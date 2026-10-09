<?php

namespace Pozo\EvilWife\Portal\Cms\Controller;

use Pozo\EvilWife\Domain\Model\DTO\Model;
use Pozo\EvilWife\Domain\Model\DTO\ModelField;

use Pozo\EvilWife\Domain\Model\Form\ModelForm;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[AsController]
class ModelController extends AbstractController
{
    public function __construct(
        private readonly ValidatorInterface $validator,
    ) {
    }

    #[Route('/manage/model/schema', name: 'manage_model_schema')]
    public function modelSchemas(): Response
    {
        $modelField = new ModelField();
        $modelField->widget = 'Text';
        $modelField->label = 'Title';
        $modelField->field = 'title';
        $modelField->constraints = ['Required', 'Unique'];
        $modelField->sqlQuery = null;
        $modelField->showInListingTable = true;
        $modelField->listingWidth = -10;
        $modelField->listingTitle = null;
        $modelField->queryableInCmsSearch = false;

        $model = new Model();
        $model->title = 'New models3';
        $model->className = 'NewModel';
        $model->fields = [$modelField, $modelField];

        $form = $this->createForm(ModelForm::class, $model, [
            'csrf_protection' => false,
        ]);

        return $this->json($this->formToSchema($form));
    }

    #[Route('/manage/model/{id}', name: 'manage_model', requirements: ['id' => '\d+'])]
    public function model(int $id): Response
    {
        return $this->render('@EvilWife/model.twig');
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

        $children = [];
        foreach ($form->all() as $child) {
            $children[$child->getName()] = $this->formToSchema($child);
        }
        if ($children && 'collection' !== $schema['type']) {
            $schema['fields'] = $children;
        } else {
            $schema['value'] = $form->getViewData();
        }

        return $schema;
    }

    #[Route('/manage/model/validate', name: 'manage_model_validate')]
    public function modelValidate(): Response
    {
        $model = new Model();
        $form = $this->createForm(ModelForm::class, $model, [
            'csrf_protection' => false,
        ]);

        $form->submit([
            'title' => '',
            'className' => 'news-article',
            'modelCategory' => 'Customised',
            'listingType' => 'Drag & Drop',
            'accesses' => ['admin'],
            'frontendUrl' => '/news',
            'searchableInCms' => true,
            'enableVersioning' => false,
            'searchableInFrontend' => false,
            'fields' => [
                [
                    'widget' => 'Text',
                    'label' => '',
                    'field' => 'Title',
                    'constraints' => ['Required', 'Unique'],
                    'sqlQuery' => null,
                    'showInListingTable' => true,
                    'listingWidth' => -10,
                    'listingTitle' => null,
                    'queryableInCmsSearch' => false,
                ],
                [
                    'widget' => 'Choice',
                    'label' => 'Author',
                    'field' => 'author',
                    'constraints' => [],
                    'sqlQuery' => '',
                    'showInListingTable' => false,
                    'listingWidth' => null,
                    'listingTitle' => null,
                    'queryableInCmsSearch' => true,
                ],
            ],
        ]);

        $violations = $this->validator->validate($model);

        if (count($violations) > 0) {
            $errors = [];
            foreach ($violations as $violation) {
                $errors[$violation->getPropertyPath()] = $violation->getMessage();
            }

            return $this->json(['errors' => $errors], 400);
        }

        return $this->json(['status' => 'Success!']);
    }
}
