<?php

namespace Pozo\EvilWife\Portal\Cms\Controller;

use Pozo\EvilWife\Core\ORM\User;
use Pozo\EvilWife\Portal\Cms\Service\TwoFactorSetupService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_ADMIN')]
class TwoFactorController extends AbstractController
{
    public function __construct(
        private readonly TwoFactorSetupService $twoFactorSetup,
    ) {
    }

    #[Route('/manage/security/two-factor', name: 'manage_2fa_settings', methods: ['GET'])]
    public function settings(Request $request): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $session = $request->getSession();
        $plainBackupCodes = $session->get('evilwife.2fa.backup_codes');
        if ($plainBackupCodes) {
            $session->remove('evilwife.2fa.backup_codes');
        }

        if ($user->isTwoFactorEnabled()) {
            return $this->render('@EvilWife/2fa_settings.twig', [
                'enabled' => true,
                'backup_codes' => $plainBackupCodes,
            ]);
        }

        $pendingSecret = $session->get(TwoFactorSetupService::SESSION_PENDING_SECRET);
        if (!$pendingSecret) {
            $pendingSecret = $this->twoFactorSetup->generateSecret();
            $session->set(TwoFactorSetupService::SESSION_PENDING_SECRET, $pendingSecret);
        }

        $user->totpSecret = $pendingSecret;

        return $this->render('@EvilWife/2fa_settings.twig', [
            'enabled' => false,
            'qr_data_uri' => $this->twoFactorSetup->getQrDataUri($user),
            'secret' => $pendingSecret,
            'backup_codes' => null,
        ]);
    }

    #[Route('/manage/security/two-factor/enable', name: 'manage_2fa_enable', methods: ['POST'])]
    public function enable(Request $request): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        if ($user->isTwoFactorEnabled()) {
            return $this->redirectToRoute('manage_2fa_settings');
        }

        if (!$this->isCsrfTokenValid('manage_2fa_enable', (string) $request->request->get('_csrf_token'))) {
            throw $this->createAccessDeniedException('Invalid CSRF token.');
        }

        $session = $request->getSession();
        $pendingSecret = $session->get(TwoFactorSetupService::SESSION_PENDING_SECRET);
        if (!$pendingSecret) {
            $this->addFlash('error', 'Two-factor setup expired. Please try again.');

            return $this->redirectToRoute('manage_2fa_settings');
        }

        $code = trim((string) $request->request->get('auth_code'));
        $user->totpSecret = $pendingSecret;

        if ($code === '' || !$this->twoFactorSetup->checkCode($user, $code)) {
            $this->addFlash('error', 'Invalid authentication code.');

            return $this->redirectToRoute('manage_2fa_settings');
        }

        $user->enableTwoFactor($pendingSecret);
        $plainCodes = $user->replaceBackupCodes($this->twoFactorSetup->generateBackupCodes());
        $user->save();

        $session->remove(TwoFactorSetupService::SESSION_PENDING_SECRET);
        $session->set('evilwife.2fa.backup_codes', $plainCodes);

        $this->addFlash('success', 'Two-factor authentication is now enabled.');

        return $this->redirectToRoute('manage_2fa_settings');
    }

    #[Route('/manage/security/two-factor/disable', name: 'manage_2fa_disable', methods: ['POST'])]
    public function disable(Request $request): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        if (!$user->isTwoFactorEnabled()) {
            return $this->redirectToRoute('manage_2fa_settings');
        }

        if (!$this->isCsrfTokenValid('manage_2fa_disable', (string) $request->request->get('_csrf_token'))) {
            throw $this->createAccessDeniedException('Invalid CSRF token.');
        }

        $password = (string) $request->request->get('password');
        if ($password === '' || !password_verify($password, (string) $user->getPassword())) {
            $this->addFlash('error', 'Incorrect password.');

            return $this->redirectToRoute('manage_2fa_settings');
        }

        $user->disableTwoFactor();
        $user->save();
        $request->getSession()->remove(TwoFactorSetupService::SESSION_PENDING_SECRET);

        $this->addFlash('success', 'Two-factor authentication has been disabled.');

        return $this->redirectToRoute('manage_2fa_settings');
    }

    #[Route('/manage/security/two-factor/regenerate-backup-codes', name: 'manage_2fa_regenerate_backup', methods: ['POST'])]
    public function regenerateBackupCodes(Request $request): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        if (!$user->isTwoFactorEnabled()) {
            return $this->redirectToRoute('manage_2fa_settings');
        }

        if (!$this->isCsrfTokenValid('manage_2fa_regenerate_backup', (string) $request->request->get('_csrf_token'))) {
            throw $this->createAccessDeniedException('Invalid CSRF token.');
        }

        $plainCodes = $user->replaceBackupCodes($this->twoFactorSetup->generateBackupCodes());
        $user->save();
        $request->getSession()->set('evilwife.2fa.backup_codes', $plainCodes);

        $this->addFlash('success', 'New backup codes generated. Store them somewhere safe.');

        return $this->redirectToRoute('manage_2fa_settings');
    }
}
