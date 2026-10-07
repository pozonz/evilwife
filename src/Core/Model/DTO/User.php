<?php

namespace Pozo\EvilWife\Core\Model\DTO;

use Pozo\EvilWife\Core\Model\ORM\UserGenerated;
use Pozo\EvilWife\Core\Model\Traits\UserTrait;
use Scheb\TwoFactorBundle\Model\BackupCodeInterface;
use Scheb\TwoFactorBundle\Model\Totp\TwoFactorInterface as TotpTwoFactorInterface;
use Symfony\Component\Security\Core\User\EquatableInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;

class User extends UserGenerated implements UserInterface, PasswordAuthenticatedUserInterface, EquatableInterface, TotpTwoFactorInterface, BackupCodeInterface
{
    use UserTrait;

    #[Assert\NotBlank(message: 'The username cannot be empty.')]
    #[Assert\Length(min: 3, max: 20)]
    public $username;

    #[Assert\NotBlank]
    #[Assert\Email(message: 'Please provide a valid email address.')]
    public $email;
}
