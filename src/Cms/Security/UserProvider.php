<?php

namespace EvilWife\Cms\Security;

use Doctrine\DBAL\Connection;
use EvilWife\_Core\ORM\User;
use EvilWife\_Core\Service\UtilsService;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class UserProvider implements UserProviderInterface
{
    public function __construct(private readonly Connection $connection)
    {
    }

    public function loadUserByIdentifier(string $identifier): UserInterface
    {
        $fullClass = UtilsService::getFullClassFromName('User');
        $user = $fullClass::data($this->connection, [
            'whereSql' => 'm.title = ?',
            'params' => [$identifier],
            'oneOrNull' => 1,
        ]);

        if (!$user) {
            throw new UserNotFoundException(sprintf('Username "%s" does not exist.', $identifier));
        }

        return $user;
    }

    public function refreshUser(UserInterface $user): UserInterface
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', $user::class));
        }

        return $this->loadUserByIdentifier($user->getUserIdentifier());
    }

    public function supportsClass(string $class): bool
    {
        return $class === User::class || is_subclass_of($class, User::class);
    }
}
