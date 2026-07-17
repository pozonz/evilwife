<?php

namespace EvilWife\_Core\ORM\Traits;

use EvilWife\_Core\Service\UtilsService;
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
}
