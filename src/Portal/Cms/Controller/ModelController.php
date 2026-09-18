<?php

namespace Pozo\EvilWife\Portal\Cms\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class ModelController extends AbstractController
{
    #[Route('/manage/model/{id}', name: 'manage_model')]
    public function model(int $id): Response
    {
        return $this->render('@EvilWife/model.twig', [

        ]);
    }

}
