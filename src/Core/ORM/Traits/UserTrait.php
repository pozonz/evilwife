<?php

namespace Pozo\EvilWife\Core\ORM\Traits;

use Pozo\EvilWife\Core\Service\UtilsService;
use Scheb\TwoFactorBundle\Model\Totp\TotpConfiguration;
use Scheb\TwoFactorBundle\Model\Totp\TotpConfigurationInterface;
use Symfony\Component\Security\Core\User\UserInterface;

trait UserTrait
{
    public function save($options = [])
    {
        if ($this->passwordInput) {
            $this->password = password_hash($this->passwordInput, PASSWORD_BCRYPT);
            $this->passwordInput = null;
        }
        return parent::save($options);
    }

    public function isEqualTo(UserInterface $user): bool
    {
        $fullClass = UtilsService::getFullClassFromName('User');
        if (!($user instanceof $fullClass)) {
            return false;
        }

        if ($this->getPassword() !== $user->getPassword()) {
            return false;
        }

        if ($this->getUserIdentifier() !== $user->getUserIdentifier()) {
            return false;
        }

        return true;
    }

    public function getRoles(): array
    {
        return ['ROLE_ADMIN'];
    }

    public function getId()
    {
        return $this->id;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->title;
    }

    public function eraseCredentials(): void
    {
        $this->passwordInput = null;
    }

    public function __serialize(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'password' => $this->password,
        ];
    }

    public function __unserialize(array $data): void
    {
        $this->id = $data['id'];
        $this->title = $data['title'];
        $this->password = $data['password'];
    }

    public function objAccessibleSections()
    {
        return json_decode($this->accessibleSections ?? '[]');
    }

    public function isTotpAuthenticationEnabled(): bool
    {
        return $this->isTwoFactorEnabled() && !empty($this->totpSecret);
    }

    public function getTotpAuthenticationUsername(): string
    {
        return $this->getUserIdentifier();
    }

    public function getTotpAuthenticationConfiguration(): ?TotpConfigurationInterface
    {
        if (empty($this->totpSecret)) {
            return null;
        }

        return new TotpConfiguration(
            $this->totpSecret,
            TotpConfiguration::ALGORITHM_SHA1,
            30,
            6
        );
    }

    public function isTwoFactorEnabled(): bool
    {
        return in_array($this->totpEnabled, [1, '1', true], true);
    }

    public function enableTwoFactor(string $secret): void
    {
        $this->totpSecret = $secret;
        $this->totpEnabled = '1';
    }

    public function disableTwoFactor(): void
    {
        $this->totpSecret = null;
        $this->totpEnabled = '0';
        $this->backupCodes = null;
    }

    /**
     * @return list<string>
     */
    public function getBackupCodesArray(): array
    {
        $codes = json_decode($this->backupCodes ?? '[]', true);

        return is_array($codes) ? array_values($codes) : [];
    }

    /**
     * @param list<string> $plainCodes
     * @return list<string>
     */
    public function replaceBackupCodes(array $plainCodes): array
    {
        $hashed = [];
        foreach ($plainCodes as $code) {
            $hashed[] = password_hash($code, PASSWORD_BCRYPT);
        }
        $this->backupCodes = json_encode(array_values($hashed));

        return array_values($plainCodes);
    }

    public function isBackupCode(string $code): bool
    {
        foreach ($this->getBackupCodesArray() as $hashed) {
            if (is_string($hashed) && password_verify($code, $hashed)) {
                return true;
            }
        }

        return false;
    }

    public function invalidateBackupCode(string $code): void
    {
        $remaining = [];
        foreach ($this->getBackupCodesArray() as $hashed) {
            if (is_string($hashed) && password_verify($code, $hashed)) {
                continue;
            }
            $remaining[] = $hashed;
        }
        $this->backupCodes = json_encode(array_values($remaining));
    }
}
