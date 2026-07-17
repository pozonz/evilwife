<?php

namespace Pozo\EvilWife\_Core\ORM;

use Pozo\EvilWife\_Core\ORM\Generated\UserGenerated;
use Pozo\EvilWife\_Core\ORM\Traits\UserTrait;
use Symfony\Component\Security\Core\User\EquatableInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class User extends UserGenerated implements UserInterface, PasswordAuthenticatedUserInterface, EquatableInterface
{
    use UserTrait;
}