<?php

namespace Pozo\EvilWife\Portal\Cms\Controller;

use Cocur\Slugify\Slugify;
use Doctrine\DBAL\Connection;
use Pozo\EvilWife\Domain\Model\DTO\Model;
use Pozo\EvilWife\Domain\Model\DTO\ModelField;

use Pozo\EvilWife\Domain\Model\Form\ModelForm;
use Pozo\EvilWife\Domain\Repository\SQL;
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
    ) {
    }

    #[Route('/manage/model/schema', name: 'manage_model_schema')]
    public function modelSchemas(): Response
    {
        $modelField = new ModelField();
        $modelField->widget = 'Text';
        $modelField->label = '';
        $modelField->field = 'title';
        $modelField->constraints = ['Required', 'Unique'];
        $modelField->sqlQuery = null;
        $modelField->showInListingTable = true;
        $modelField->listingWidth = 10;
        $modelField->listingTitle = null;
        $modelField->queryableInCmsSearch = false;

        $model = new Model();
        $model->title = 'New models3';
        $model->className = '';
        $model->fields = [$modelField, $modelField];

        $form = $this->createForm(ModelForm::class, new Model(), [
            'csrf_protection' => false,
        ]);

        return $this->json([
            'schema' => $this->formToSchema($form),
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
            $this->writeDao($model, $data);
        }

        return $this->json([
            'errors' => $errors,
        ]);
    }

    private function writeDao(Model $model, array $data): void
    {
        $className = $model->className;
        if (!preg_match('/^[A-Z][A-Za-z0-9]*$/', $className)) {
            return;
        }

        $base = dirname(__DIR__, 3).'/Domain/Data/DAO/'.$className;
        $generated = $base.'/Generated';
        if (!is_dir($generated)) {
            mkdir($generated, 0775, true);
        }

        $classFile = $base.'/'.$className.'.php';
        if (!is_file($classFile)) {
            file_put_contents($classFile, $this->classSource($className));
        }

        file_put_contents($generated.'/'.$className.'ORM.php', $this->ormSource($model));
        file_put_contents(
            $generated.'/'.$className.'.json',
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)."\n"
        );

        $this->syncTable($className);
    }

    private function syncTable(string $className): void
    {
        $tableName = (new Slugify(['trim' => false]))->slugify($className, '_');
        $sql = new SQL($this->connection, $tableName);
        if (!$sql->exists()) {
            $sql->create();
        }
        $sql->sync($this->ormColumns($className));
    }

    /**
     * @return array<string, string>
     */
    private function ormColumns(string $className): array
    {
        $class = 'Pozo\\EvilWife\\Domain\\Data\\DAO\\'.$className.'\\Generated\\'.$className.'ORM';
        $reflection = new \ReflectionClass($class);
        $properties = [];
        do {
            $properties = array_merge($reflection->getProperties(), $properties);
            $reflection = $reflection->getParentClass();
        } while ($reflection);

        $columns = [];
        foreach ($properties as $property) {
            $comment = $property->getDocComment();
            if (!is_string($comment) || !preg_match('/#pz(\ )+(.*)/', $comment, $matches)) {
                continue;
            }
            $columns[$property->getName()] = $matches[2];
        }

        return $columns;
    }

    private function classSource(string $className): string
    {
        return <<<PHP
<?php

namespace Pozo\\EvilWife\\Domain\\Data\\DAO\\{$className};

use Pozo\\EvilWife\\Domain\\Data\\DAO\\{$className}\\Generated\\{$className}ORM;

class {$className} extends {$className}ORM
{
}

PHP;
    }

    private function ormSource(Model $model): string
    {
        $className = $model->className;
        $properties = '';
        $seen = [];
        foreach ($model->fields as $field) {
            if (!$field instanceof ModelField) {
                continue;
            }
            $name = $field->field;
            if (!preg_match('/^[a-z][A-Za-z0-9]*$/', $name) || isset($seen[$name])) {
                continue;
            }
            $seen[$name] = true;
            $properties .= <<<PHP

    /**
     * #pz text COLLATE utf8mb4_unicode_ci DEFAULT NULL
     */
    public \${$name};

PHP;
        }

        return <<<PHP
<?php

namespace Pozo\\EvilWife\\Domain\\Data\\DAO\\{$className}\\Generated;

use Pozo\\EvilWife\\Domain\\Repository\\DAO;

class {$className}ORM extends DAO
{{$properties}
}

PHP;
    }

    #[Route('/manage/model/{id}', name: 'manage_model', requirements: ['id' => '\d+'])]
    public function model(int $id): Response
    {
        return $this->render('@EvilWife/model.twig');
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
