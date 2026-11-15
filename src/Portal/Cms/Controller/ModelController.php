<?php

namespace Pozo\EvilWife\Portal\Cms\Controller;

use Pozo\EvilWife\Domain\Model\DTO\Model;
use Pozo\EvilWife\Domain\Model\Form\ModelForm;
use Pozo\EvilWife\Domain\Service\ModelService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[AsController]
class ModelController extends AbstractController
{
    public function __construct(
        private readonly ValidatorInterface $validator,
        private readonly ModelService $models,
    ) {}

    #[Route('/manage/model/{className}/schema', name: 'manage_model_schema', requirements: ['className' => '[A-Z][A-Za-z0-9]*'])]
    public function modelSchemas(string $className): Response
    {
        $form = $this->createForm(ModelForm::class, new Model(), [
            'csrf_protection' => false,
        ]);

        $model = $this->models->modelFromClass($className);
        if (!$model) {
            $model = new Model();
            $model->className = $className;
        }

        return $this->json([
            'schema' => $this->models->formToSchema($form),
            'data' => $model,
        ]);
    }

    #[Route('/manage/model/validate', name: 'manage_model_validate')]
    public function modelValidate(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        $errors = $this->validate($data, [NotBlank::class]);

        return $this->json([
            'errors' => $errors,
        ]);
    }

    #[Route('/manage/model/save', name: 'manage_model_save')]
    public function modelSave(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        $errors = $this->validate($data);

        if (!$errors && is_array($data)) {
            $model = new Model();
            $form = $this->createForm(ModelForm::class, $model, [
                'csrf_protection' => false,
            ]);
            $form->submit($data);
            $this->models->writeDao($model, $data);
            sleep(10);
            $this->models->syncTable($model->className);
        }

        return $this->json([
            'errors' => $errors,
        ]);
    }

    private function validate($data, $ignores = []): array
    {
        $model = new Model();
        $form = $this->createForm(ModelForm::class, $model, [
            'csrf_protection' => false,
        ]);
        $form->submit($data);

        $violations = $this->validator->validate($model);

        $errors = [];
        foreach ($violations as $violation) {
            $ignored = false;
            foreach ($ignores as $ignore) {
                if ($violation->getConstraint() instanceof NotBlank) {
                    $ignored = true;
                }
            }

            if ($ignored) {
                continue;
            }

            $errors[] = [
                'path' => $violation->getPropertyPath(),
                'message' => $violation->getMessage(),
            ];
        }

        return $errors;
    }
}
