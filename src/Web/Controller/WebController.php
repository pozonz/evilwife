<?php

namespace EvilWife\Web\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class WebController extends AbstractController
{
    #[Route('/{path}', name: 'evilwife_web_catch_all', requirements: ['path' => '.*'], priority: -100)]
    public function catchAll(Request $request, string $path = ''): Response
    {
        return new Response(sprintf('EvilWife Web caught: /%s', $path));
    }
}
