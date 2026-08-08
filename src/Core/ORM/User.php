<?php

namespace Pozo\EvilWife\Core\ORM;

use Pozo\EvilWife\Core\ORM\Generated\UserGenerated;
use Pozo\EvilWife\Core\ORM\Traits\UserTrait;
use Scheb\TwoFactorBundle\Model\BackupCodeInterface;
use Scheb\TwoFactorBundle\Model\Totp\TwoFactorInterface as TotpTwoFactorInterface;
use Symfony\Component\Security\Core\User\EquatableInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class User extends UserGenerated implements UserInterface, PasswordAuthenticatedUserInterface, EquatableInterface, TotpTwoFactorInterface, BackupCodeInterface
{
    use UserTrait;
}
