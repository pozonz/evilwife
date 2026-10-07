<?php

namespace Pozo\EvilWife\Portal\Cms\Controller;

use Doctrine\DBAL\Connection;
use Pozo\EvilWife\Core\Model\DTO\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Symfony\Component\Validator\Validator\ValidatorInterface;

use Pozo\EvilWife\Core\Model\DTO\Model;

#[AsController]
class ModelController extends AbstractController
{
    public function __construct(
        private readonly ValidatorInterface $validator,
        private readonly Connection $connection,
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
        // 1. Create or populate your object instance
        $userDto = new User($this->connection);
        $userDto->username = 'hi'; // Too short!
        $userDto->email = 'invalid-email'; // Invalid format!

        // 2. Validate the object
        $violations = $this->validator->validate($userDto);

        // 3. Check for errors
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
