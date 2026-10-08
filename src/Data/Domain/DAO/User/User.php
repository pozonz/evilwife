<?php

namespace Pozo\EvilWife\Data\Domain\DAO\User;

use Pozo\EvilWife\Data\Domain\DAO\User\Generated\UserORM;
use Scheb\TwoFactorBundle\Model\BackupCodeInterface;
use Scheb\TwoFactorBundle\Model\Totp\TwoFactorInterface as TotpTwoFactorInterface;
use Symfony\Component\Security\Core\User\EquatableInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class User extends UserORM implements UserInterface, PasswordAuthenticatedUserInterface, EquatableInterface, TotpTwoFactorInterface, BackupCodeInterface
{
    use UserTrait;
}
