<?php

namespace Pozo\EvilWife\Portal\Cms\Controller;

use Cocur\Slugify\Slugify;
use Doctrine\DBAL\Connection;
use Pozo\EvilWife\Domain\Model\DTO\Model;
use Pozo\EvilWife\Domain\Model\Form\ModelForm;
use Pozo\EvilWife\Domain\Repository\SQL;
use Pozo\EvilWife\Domain\Service\ModelService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\FormInterface;
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
        private readonly Connection $connection,
        private readonly ModelService $models,
    ) {
    }

    #[Route('/manage/model/{className}/schema', name: 'manage_model_schema', requirements: ['className' => '[A-Z][A-Za-z0-9]*'])]
    public function modelSchemas(string $className): Response
    {
        $form = $this->createForm(ModelForm::class, new Model(), [
            'csrf_protection' => false,
        ]);

        return $this->json([
            'schema' => $this->formToSchema($form),
            'data' => $this->models->modelFromClass($className),
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
            $this->syncTable($model->className);
        }

        return $this->json([
            'errors' => $errors,
        ]);
    }

    private function syncTable(string $className): void
    {
        $tableName = (new Slugify(['trim' => false]))->slugify($className, '_');
        $sql = new SQL($this->connection, $tableName);
        if (!$sql->exists()) {
            $sql->create();
        }
        $sql->sync($this->models->ormColumns($className));
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

        if ('collection' === $schema['type']) {
            $schema['allow_add'] = (bool) $config->getOption('allow_add');
            $schema['allow_delete'] = (bool) $config->getOption('allow_delete');
            $prototype = $form->getConfig()->getAttribute('prototype');
            if ($prototype instanceof FormInterface) {
                $schema['entry'] = $this->formToSchema($prototype);
            }
        }

        if ('collection' !== $schema['type']) {
            $children = [];
            foreach ($form->all() as $child) {
                $children[$child->getName()] = $this->formToSchema($child);
            }
            if ($children) {
                $schema['fields'] = $children;
            }
        }

        return $schema;
    }


}
