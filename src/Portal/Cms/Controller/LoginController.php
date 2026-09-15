<?php

namespace Pozo\EvilWife\Portal\Cms\Controller;

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
        if ($this->isGranted('IS_AUTHENTICATED_FULLY')) {
            return $this->redirectToRoute('manage_dashboard');
        }

        return $this->render('@EvilWife/login.twig', [
            'last_username' => $authUtils->getLastUsername(),
            'error' => $authUtils->getLastAuthenticationError()?->getMessageKey(),
        ]);
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
        return $this->render('@EvilWife/dashboard.twig', [
            'username' => $this->getUser()?->getUserIdentifier(),
        ]);
    }

    #[Route('/manage/chat', name: 'manage_chat')]
    public function chat(): Response
    {
        return $this->render('@EvilWife/chat.twig', [
            'username' => $this->getUser()?->getUserIdentifier(),
        ]);
    }

    #[Route('/manage/ollama/chat', name: 'manage_ollama_chat', methods: ['POST','GET'])]
    public function ollamaChat(Request $request): Response
    {
        // Same-origin proxy so HTTPS ngrok pages can talk to WSL Ollama without browser CORS/mixed-content blocks.
        // PHP runs in Docker; host.docker.internal reaches Ollama on the WSL host (127.0.0.1:11434).
        $ch = curl_init('http://host.docker.internal:11434/api/chat');
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => $request->getContent(),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 120,
        ]);
        $body = curl_exec($ch);
        $errno = curl_errno($ch);
        $error = curl_error($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($errno) {
            return $this->json([
                'error' => 'Ollama unreachable from Docker proxy',
                'detail' => $error,
            ], 502);
        }

        return new Response($body === false ? '' : $body, $status ?: 502, [
            'Content-Type' => 'application/json',
        ]);
    }

    #[Route('/manage/{path}', name: 'manage_catch_all', requirements: ['path' => '.*'], priority: -100)]
    public function catchAll(Request $request, string $path = ''): Response
    {
        return new Response(sprintf('EvilWife CMS caught: /manage/%s', $path));
    }
}
