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
        $data = json_decode($request->getContent(), true);

        return $this->json([
            'errors' => $this->errors($modelId, $data),
        ]);
    }

    #[Route('/manage/dao/{modelId}/save', name: 'manage_dao_save', requirements: ['modelId' => '[a-z0-9-]*'])]
    public function save(string $modelId, Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        $errors = $this->errors($modelId, $data);
        if (!$errors && is_array($data)) {
            $model = $this->models->getModelById($modelId);
            $class = $model ? UtilsService::getFullClassFromName($model->className) : null;
            if ($class) {
                $record = $this->models->unserialize($data, $class);
                $record->save();
            }
        }

        return $this->json([
            'errors' => $errors,
        ]);
    }

    /**
     * @return list<array{path: string, message: string}>
     */
    private function errors(string $modelId, mixed $data): array
    {
        if (!is_array($data)) {
            return [[
                'path' => '',
                'message' => 'Invalid JSON.',
            ]];
        }

        $model = $this->models->getModelById($modelId);
        if (!$model) {
            return [];
        }

        $class = UtilsService::getFullClassFromName($model->className);
        $errors = [];
        foreach ($model->fields as $field) {
            if (!$field instanceof ModelField || !preg_match('/^[a-z][A-Za-z0-9]*$/', $field->field)) {
                continue;
            }

            $name = $field->field;
            $value = $data[$name] ?? null;
            $blank = $value === null || $value === '' || $value === [];
            $label = $field->label !== '' ? $field->label : $name;

            if (in_array('Required', $field->constraints, true) && $blank) {
                $errors[] = [
                    'path' => $name,
                    'message' => $label . ' is required.',
                ];
            }

            if ($class && in_array('Unique', $field->constraints, true) && !$blank && !is_array($value)) {
                $existing = $class::getByField($this->connection, $name, $value);
                if ($existing && (string) $existing->id !== (string) ($data['id'] ?? '')) {
                    $errors[] = [
                        'path' => $name,
                        'message' => $label . ' must be unique.',
                    ];
                }
            }
        }

        return $errors;
    }
}
