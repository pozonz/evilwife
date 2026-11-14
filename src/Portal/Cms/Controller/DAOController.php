<?php

namespace Pozo\EvilWife\Portal\Cms\Controller;

use Pozo\EvilWife\Domain\Model\Form\DAOForm;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;

#[AsController]
class DAOController extends AbstractController
{
    #[Route('/manage/dao/{className}/schema', name: 'manage_dao_schema', requirements: ['className' => '[A-Z][A-Za-z0-9]*'])]
    public function schema(string $className): Response
    {
        $path = dirname(__DIR__, 3).'/Domain/Data/DAO/'.$className.'/Generated/'.$className.'.json';
        $model = is_file($path) ? json_decode((string) file_get_contents($path), true) : [];
        $fields = is_array($model['fields'] ?? null) ? $model['fields'] : [];

        $form = $this->createForm(DAOForm::class, null, [
            'fields' => $fields,
            'csrf_protection' => false,
        ]);

        return $this->json([
            'schema' => $this->formToSchema($form),
            'data' => $this->emptyData($fields),
        ]);
    }

    #[Route('/manage/dao/{className}/validate', name: 'manage_dao_validate', requirements: ['className' => '[A-Z][A-Za-z0-9]*'])]
    public function validate(string $className, Request $request): Response
    {
        $data = json_decode($request->getContent(), true);

        return $this->json([
            'className' => $className,
            'errors' => is_array($data) ? [] : [[
                'path' => '',
                'message' => 'Invalid JSON.',
            ]],
        ]);
    }

    #[Route('/manage/dao/{className}/save', name: 'manage_dao_save', requirements: ['className' => '[A-Z][A-Za-z0-9]*'])]
    public function save(string $className, Request $request): Response
    {
        return $this->validate($className, $request);
    }

    /**
     * @param list<mixed> $fields
     * @return array<string, mixed>
     */
    private function emptyData(array $fields): array
    {
        $data = [];
        foreach ($fields as $field) {
            if (!is_array($field) || !isset($field['field'])) {
                continue;
            }
            $widget = (string) ($field['widget'] ?? '');
            $data[(string) $field['field']] = str_contains($widget, 'multi') ? [] : null;
        }

        return $data;
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
