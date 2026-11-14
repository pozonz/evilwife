<?php

namespace Pozo\EvilWife\Portal\Cms\Controller;

use Doctrine\DBAL\Connection;
use Pozo\EvilWife\Domain\Model\Form\DAOForm;
use Pozo\EvilWife\Domain\Service\UtilsService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;

#[AsController]
class DAOController extends AbstractController
{
    public function __construct(
        private readonly Connection $connection,
    ) {
    }

    #[Route('/manage/dao/{className}/{id}/schema', name: 'manage_dao_schema', requirements: ['className' => '[A-Z][A-Za-z0-9]*', 'id' => '\d+'])]
    public function schema(string $className, int $id): Response
    {
        $fields = $this->fields($className);

        $form = $this->createForm(DAOForm::class, null, [
            'fields' => $fields,
            'csrf_protection' => false,
        ]);

        $class = UtilsService::getFullClassFromName($className);

        return $this->json([
            'schema' => $this->formToSchema($form),
            'data' => $class ? $class::getById($this->connection, $id) : null,
        ]);
    }

    #[Route('/manage/dao/{className}/validate', name: 'manage_dao_validate', requirements: ['className' => '[A-Z][A-Za-z0-9]*'])]
    public function validate(string $className, Request $request): Response
    {
        $data = json_decode($request->getContent(), true);

        return $this->json([
            'errors' => $this->errors($className, $data),
        ]);
    }

    #[Route('/manage/dao/{className}/save', name: 'manage_dao_save', requirements: ['className' => '[A-Z][A-Za-z0-9]*'])]
    public function save(string $className, Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        $errors = $this->errors($className, $data);
        if (!$errors && is_array($data)) {
            $this->write($className, $data);
        }

        return $this->json([
            'errors' => $errors,
        ]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function fields(string $className): array
    {
        $path = dirname(__DIR__, 3).'/Domain/Data/DAO/'.$className.'/Generated/'.$className.'.json';
        $model = is_file($path) ? json_decode((string) file_get_contents($path), true) : [];

        return is_array($model['fields'] ?? null) ? $model['fields'] : [];
    }

    /**
     * @return list<array{path: string, message: string}>
     */
    private function errors(string $className, mixed $data): array
    {
        if (!is_array($data)) {
            return [[
                'path' => '',
                'message' => 'Invalid JSON.',
            ]];
        }

        $class = UtilsService::getFullClassFromName($className);
        $errors = [];
        foreach ($this->fields($className) as $field) {
            if (!is_array($field) || !isset($field['field'])) {
                continue;
            }
            $name = (string) $field['field'];
            if (!preg_match('/^[a-z][A-Za-z0-9]*$/', $name)) {
                continue;
            }

            $value = $data[$name] ?? null;
            $blank = $value === null || $value === '' || $value === [];
            $constraints = is_array($field['constraints'] ?? null) ? $field['constraints'] : [];
            $label = (string) ($field['label'] ?? $name);

            if (in_array('Required', $constraints, true) && $blank) {
                $errors[] = [
                    'path' => $name,
                    'message' => $label.' is required.',
                ];
            }

            if ($class && in_array('Unique', $constraints, true) && !$blank && !is_array($value)) {
                $existing = $class::getByField($this->connection, $name, $value);
                if ($existing && (string) $existing->id !== (string) ($data['id'] ?? '')) {
                    $errors[] = [
                        'path' => $name,
                        'message' => $label.' must be unique.',
                    ];
                }
            }
        }

        return $errors;
    }

    /**
     * @param array<string, mixed> $data
     */
    private function write(string $className, array $data): void
    {
        $class = UtilsService::getFullClassFromName($className);
        if (!$class) {
            return;
        }

        $id = $data['id'] ?? null;
        $record = $id ? $class::getById($this->connection, $id) : null;
        if (!$record) {
            $record = new $class($this->connection);
        }

        foreach ($this->fields($className) as $field) {
            if (!is_array($field) || !isset($field['field'])) {
                continue;
            }
            $name = (string) $field['field'];
            if (!preg_match('/^[a-z][A-Za-z0-9]*$/', $name) || !array_key_exists($name, $data)) {
                continue;
            }
            $value = $data[$name];
            $record->{$name} = is_array($value) ? json_encode(array_values($value)) : $value;
        }

        $record->save();
    }

    /**
     * @return array<string, mixed>
     */
    private function formToSchema(FormInterface $form): array
    {
        $config = $form->getConfig();
        $schema = [
            'name' => $form->getName(),
            'type' => $config->getType()->getBlockPrefix(),
            'label' => $config->getOption('label'),
            'required' => $form->isRequired(),
            'multiple' => (bool) $config->getOption('multiple'),
            'disabled' => $form->isDisabled(),
        ];

        $attr = $config->getOption('attr');
        if (is_array($attr) && $attr) {
            $schema['attr'] = $attr;
        }

        $choices = $config->getOption('choices');
        if (is_array($choices)) {
            $schema['choices'] = [];
            foreach ($choices as $label => $value) {
                $schema['choices'][] = [
                    'label' => $label,
                    'value' => $value,
                ];
            }
        }

        $children = [];
        foreach ($form->all() as $child) {
            $children[$child->getName()] = $this->formToSchema($child);
        }
        if ($children) {
            $schema['fields'] = $children;
        }

        return $schema;
    }
}
