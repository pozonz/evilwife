<?php

namespace Pozo\EvilWife\Portal\Cms\Controller;

use Doctrine\DBAL\Connection;
use Pozo\EvilWife\Domain\Model\DTO\ModelField;
use Pozo\EvilWife\Domain\Model\Form\DAOForm;
use Pozo\EvilWife\Domain\Service\ModelService;
use Pozo\EvilWife\Domain\Service\UtilsService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;

#[AsController]
class DAOController extends AbstractController
{
    public function __construct(
        private readonly Connection $connection,
        private readonly ModelService $models,
    ) {}

    #[Route('/manage/dao/{modelId}/{daoId}/schema', name: 'manage_dao_schema', requirements: ['modelId' => '[a-z0-9-]*', 'id' => '\d+'])]
    public function schema(string $modelId, int $daoId): Response
    {
        $model = $this->models->getModelById($modelId);
        $form = $this->createForm(DAOForm::class, null, [
            'fields' => $model->fields,
            'csrf_protection' => false,
        ]);

        $class = UtilsService::getFullClassFromName($model->className);

        return $this->json([
            'schema' => $this->models->formToSchema($form),
            'data' => $class ? $class::getById($this->connection, $daoId) : null,
        ]);
    }

    #[Route('/manage/dao/{modelId}/validate', name: 'manage_dao_validate', requirements: ['modelId' => '[a-z0-9-]*'])]
    public function validate(string $modelId, Request $request): Response
    {
        $model = $this->models->getModelById($modelId);
        $class = $model ? UtilsService::getFullClassFromName($model->className) : null;
        if (!$class) {
            throw new \Exception('Model not found');
        }

        $data = json_decode($request->getContent(), true);

        $errors = $this->models->validate($data, $class, [NotBlank::class]);

        return $this->json([
            'errors' => $errors,
        ]);
    }

    #[Route('/manage/dao/{modelId}/save', name: 'manage_dao_save', requirements: ['modelId' => '[a-z0-9-]*'])]
    public function save(string $modelId, Request $request): Response
    {
        $model = $this->models->getModelById($modelId);
        $class = $model ? UtilsService::getFullClassFromName($model->className) : null;
        if (!$class) {
            throw new \Exception('Model not found');
        }

        $data = json_decode($request->getContent(), true);      

        $errors = $this->models->validate($data, $class);

        if (!$errors && is_array($data)) {
            $dao = $this->models->unserialize($data, $class);
            $dao->save();
        }

        return $this->json([
            'errors' => $errors,
        ]);
    }
}
