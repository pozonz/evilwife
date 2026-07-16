<?php

namespace EvilWife\Cms\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class LoginController extends AbstractController
{
    #[Route('/manage/{path}', name: 'evilwife_catch_all', requirements: ['path' => '.*'], priority: -100)]
    public function catchAll(Request $request, string $path = ''): Response
    {
        return new Response(sprintf('EvilWife caught: /%s', $path));
    }  
}
