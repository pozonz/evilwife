<?php

namespace Pozo\EvilWife\Portal\Cms\Service;

use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;
use Pozo\EvilWife\Core\ORM\User;
use Scheb\TwoFactorBundle\Security\TwoFactor\Provider\Totp\TotpAuthenticatorInterface;

class TwoFactorSetupService
{
    public const SESSION_PENDING_SECRET = 'evilwife.2fa.pending_secret';

    public function __construct(
        private readonly TotpAuthenticatorInterface $totpAuthenticator,
    ) {
    }

    public function generateSecret(): string
    {
        return $this->totpAuthenticator->generateSecret();
    }

    public function getQrContent(User $user): string
    {
        return $this->totpAuthenticator->getQRContent($user);
    }

    public function getQrDataUri(User $user): string
    {
        $result = (new Builder(
            writer: new PngWriter(),
            data: $this->getQrContent($user),
            size: 220,
            margin: 10,
        ))->build();

        return $result->getDataUri();
    }

    public function checkCode(User $user, string $code): bool
    {
        return $this->totpAuthenticator->checkCode($user, $code);
    }

    /**
     * @return list<string>
     */
    public function generateBackupCodes(int $count = 8): array
    {
        $codes = [];
        for ($i = 0; $i < $count; ++$i) {
            $codes[] = strtoupper(bin2hex(random_bytes(4)));
        }

        return $codes;
    }
}
