<?php

namespace Pozo\EvilWife\Cms\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class LoginController extends AbstractController
{
    #[Route('/manage/login', name: 'manage_login')]
    public function login(AuthenticationUtils $authUtils): Response
    {
        if ($this->getUser()) {
            return $this->redirectToRoute('manage_dashboard');
        }

        $error = $authUtils->getLastAuthenticationError();
        $errorMessage = $error ? $error->getMessageKey() : null;
        return new Response(sprintf(
            '<form method="post" action="/manage/login_check">%s<input name="_username" placeholder="Username"><input type="password" name="_password" placeholder="Password"><button>Login</button></form>',
            $errorMessage ? '<p style="color:red">' . $errorMessage . '</p>' : ''
        ));
    }

    #[Route('/manage/login_check', name: 'manage_login_check')]
    public function loginCheck(): never
    {
        throw new \LogicException('This route is handled by the firewall.');
    }

    #[Route('/manage/logout', name: 'manage_logout')]
    public function logout(): never
    {
        throw new \LogicException('This route is handled by the firewall.');
    }

    #[Route('/manage/dashboard', name: 'manage_dashboard')]
    public function dashboard(): Response
    {
        return new Response('Welcome to the CMS dashboard, ' . $this->getUser()?->getUserIdentifier());
    }

    #[Route('/manage/{path}', name: 'manage_catch_all', requirements: ['path' => '.*'], priority: -100)]
    public function catchAll(Request $request, string $path = ''): Response
    {
        return new Response(sprintf('EvilWife CMS caught: /manage/%s', $path));
    }
}
