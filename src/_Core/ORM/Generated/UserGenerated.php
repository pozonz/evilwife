<?php

namespace EvilWife\_Core\ORM\Generated;

use EvilWife\_Core\Db\Traits\BaseORMTrait;
use EvilWife\_Core\Db\BaseORM;

class UserGenerated extends BaseORM
{
    use BaseORMTrait;

    /**
     * #pz text COLLATE utf8mb4_unicode_ci DEFAULT NULL
     */
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
    public $email;
   
    /**
     * #pz text COLLATE utf8mb4_unicode_ci DEFAULT NULL
     */
    public $accessibleSections;
   
}