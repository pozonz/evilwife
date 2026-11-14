<?php

namespace Pozo\EvilWife\Portal\Cms\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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
        return $this->json([
            'className' => $className,
            'schema' => null,
            'data' => null,
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
}
