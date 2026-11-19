<?php

namespace Pozo\EvilWife\Domain\Data\Dao\User\Generated;

use Pozo\EvilWife\Domain\Repository\Dao;
use Pozo\EvilWife\Domain\Model\Form\Constraints\ContraintUnqiue;
use Symfony\Component\Validator\Constraints as Assert;

class UserORM extends Dao
{
    /**
     * #pz text COLLATE utf8mb4_unicode_ci DEFAULT NULL
     */
    #[Assert\NotBlank]
    #[ContraintUnqiue]
    public $title;

    /**
     * #pz text COLLATE utf8mb4_unicode_ci DEFAULT NULL
     */
    public $passwordInput;

    /**
     * #pz text COLLATE utf8mb4_unicode_ci DEFAULT NULL
     */
    public $password;

    /**
     * #pz text COLLATE utf8mb4_unicode_ci DEFAULT NULL
     */
    public $name;

    /**
     * #pz text COLLATE utf8mb4_unicode_ci DEFAULT NULL
     */
    #[Assert\NotBlank]
    #[ContraintUnqiue]
    public $email;

    /**
     * #pz text COLLATE utf8mb4_unicode_ci DEFAULT NULL
     */
    public $accessibleSections;

    /**
     * #pz text COLLATE utf8mb4_unicode_ci DEFAULT NULL
     */
    public $totpSecret;

    /**
     * #pz text COLLATE utf8mb4_unicode_ci DEFAULT NULL
     */
    public $totpEnabled;

    /**
     * #pz text COLLATE utf8mb4_unicode_ci DEFAULT NULL
     */
    public $backupCodes;

}
