<?php

namespace Pozo\EvilWife\Portal\Cms\Controller;

use Pozo\EvilWife\Data\Core\Model\DTO\Model;
use Pozo\EvilWife\Data\Core\Model\Form\ModelForm;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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

    #[Route('/manage/model/{id}', name: 'manage_model')]
    public function model(int $id): Response
    {
        $model = new Model();

        return $this->render('@EvilWife/model.twig', [
            'model' => $model,
        ]);
    }

    #[Route('/manage/validate', name: 'manage_validate')]
    public function validate(): Response
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
