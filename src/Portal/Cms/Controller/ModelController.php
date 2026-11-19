<?php

namespace Pozo\EvilWife\Portal\Cms\Controller;

use Pozo\EvilWife\Domain\Model\DTO\Model;
use Pozo\EvilWife\Domain\Model\Form\ModelForm;
use Pozo\EvilWife\Domain\Service\ModelService;
use Ramsey\Uuid\Uuid;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Constraints\NotBlank;

#[AsController]
class ModelController extends AbstractController
{
    public function __construct(
        private readonly ModelService $models,
    ) {}

    #[Route('/manage/api/model/{modelId}/schema', name: 'manage_model_schema', requirements: ['modelId' => '[a-z0-9-]*'])]
    public function modelSchemas(string $modelId): Response
    {
        $form = $this->createForm(ModelForm::class, new Model(), [
            'csrf_protection' => false,
        ]);

        return $this->json([
            'schema' => $this->models->formToSchema($form),
            'data' => $this->models->getModelById($modelId),
        ]);
    }

    #[Route('/manage/api/model/validate', name: 'manage_model_validate')]
    public function modelValidate(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        $errors = $this->models->validate($data, Model::class, [NotBlank::class]);

        return $this->json([
            'errors' => $errors,
        ]);
    }

    #[Route('/manage/api/model/save', name: 'manage_model_save')]
    public function modelSave(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        $data['id'] = $data['id'] ?? Uuid::uuid4()->toString();
        $errors = $this->models->validate($data, Model::class);

        if (!$errors && is_array($data)) {
            $model = $this->models->unserialize($data, Model::class);
            $this->models->writeDao($model);
            $this->models->syncTable($model->className);
        }

        return $this->json([
            'errors' => $errors,
        ]);
    }
}
