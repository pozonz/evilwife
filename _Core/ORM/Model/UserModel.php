<?php

namespace EvilWife\_Core\ORM\Model;

use Doctrine\DBAL\Connection;
use EvilWife\_Core\Db\Model;

class UserModel extends Model
{
    public $id = '90b7f664-a831-490d-8420-d1819704323c';
   
    public $_uniqid = '59232074-63c0-47e4-a9ee-0c73ff64fd7f';
   
    public $_slug = 'users';
   
    public $_status = '1';
   
    public $_closed = '0';
   
    public $_rank = '0';
   
    public $_added = '2021-09-02 12:07:37';
   
    public $_modified = '2021-10-20 18:36:28';
   
    public $_publishFrom = null;
   
    public $_publishTo = null;
   
    public $_userId = null;
   
    public $_versionUuid = '';
   
    public $_versionOrmId = null;
   
    public $_isDraft = null;
   
    public $_draftName = null;
   
    public $_isBootstrapData = null;
   
    public $_isArchived = null;
   
    public $_displayAdded = '0';
   
    public $_displayModified = '0';
   
    public $_displayUser = '0';
   
    public $title = 'Users';
   
    public $className = 'User';
   
    public $modelCategory = '2';
   
    public $listingType = '2';
   
    public $pageSize = '200';
   
    public $defaultSortBy = 'title';
   
    public $defaultOrderBy = 'ASC';
   
    public $accesses = '["3"]';
   
    public $frontendUrl = null;
   
    public $searchableInCms = '1';
   
    public $searchableInFrontend = '0';
   
    public $enableVersioning = '0';
   
    public $columnsJson = '[{"id":"title","label":"Username:","field":"title","widget":"Text","required":1,"unique":1,"sqlQuery":null,"listing":1,"listingWidth":"250","queryable":1,"chosen":false,"selected":false},{"id":"extra1","label":"Password:","field":"passwordInput","widget":"Password","required":0,"unique":0,"sqlQuery":null,"listing":0,"listingWidth":null,"queryable":0,"chosen":false,"selected":false},{"id":"password","label":"Password:","field":"password","widget":"Hidden","required":0,"unique":0,"sqlQuery":null,"listing":0,"listingWidth":null,"queryable":0,"chosen":false,"selected":false},{"id":"name","label":"Name:","field":"name","widget":"Text","required":0,"unique":0,"sqlQuery":null,"listing":1,"listingWidth":"250","queryable":1,"chosen":false,"selected":false},{"id":"email","label":"Email:","field":"email","widget":"Text","required":0,"unique":0,"sqlQuery":null,"lilistingst":0,"listingWidth":"","queryable":1,"chosen":false,"selected":false,"listing":1},{"id":"extra2","label":"Accessible menu items:","field":"accessibleSections","widget":"Choice multi","required":0,"unique":0,"sqlQuery":"SELECT id AS `key`, title AS value FROM CmsMenuItem WHERE `_versionOrmId` IS NULL ORDER BY `_rank`","listing":0,"listingWidth":null,"listingTitle":null,"displayFunc":null,"queryable":0,"chosen":false,"selected":false}]';
   

    public function __construct(Connection $connection)
    {
        $this->_connection = $connection;
    }
}