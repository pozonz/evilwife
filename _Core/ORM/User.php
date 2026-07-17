<?php

namespace EvilWife\_Core\ORM;

use EvilWife\_Core\ORM\Generated\UserGenerated;
use EvilWife\_Core\ORM\Traits\UserTrait;
use Symfony\Component\Security\Core\User\EquatableInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class User extends UserGenerated implements UserInterface, EquatableInterface, \Serializable
{
    use UserTrait;
}