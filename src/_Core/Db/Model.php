<?php

namespace EvilWife\_Core\Db;

use Cocur\Slugify\Slugify;
use Doctrine\DBAL\Connection;
use EvilWife\_Core\Db\BaseORM;
use EvilWife\_Core\Service\ModelService;
use EvilWife\_Core\Service\UtilsService;
use Ramsey\Uuid\Uuid;

class Model extends BaseORM
{
    /**
     * #pz text COLLATE utf8mb4_unicode_ci NULL
     */
    public $title;

    /**
     * #pz text COLLATE utf8mb4_unicode_ci NULL
     */
    public $className;

    /**
     * #pz text COLLATE utf8mb4_unicode_ci NULL
     */
    public $modelCategory;

    /**
     * #pz text COLLATE utf8mb4_unicode_ci NULL
     */
    public $listingType;

    /**
     * #pz text COLLATE utf8mb4_unicode_ci NULL
     */
    public $pageSize;

    /**
     * #pz text COLLATE utf8mb4_unicode_ci NULL
     */
    public $defaultSortBy;

    /**
     * #pz text COLLATE utf8mb4_unicode_ci NULL
     */
    public $defaultOrderBy;

    /**
     * #pz text COLLATE utf8mb4_unicode_ci NULL
     */
    public $accesses;

    /**
     * #pz text COLLATE utf8mb4_unicode_ci NULL
     */
    public $frontendUrl;

    /**
     * #pz text COLLATE utf8mb4_unicode_ci NULL
     */
    public $searchableInCms;

    /**
     * #pz text COLLATE utf8mb4_unicode_ci NULL
     */
    public $searchableInFrontend;

    /**
     * #pz text COLLATE utf8mb4_unicode_ci NULL
     */
    public $enableVersioning;

    /**
     * #pz text COLLATE utf8mb4_unicode_ci NULL
     */
    public $columnsJson;

    /**
     * Model constructor.
     * @param Connection $connection
     */
    public function __construct(Connection $connection)
    {
        parent::__construct($connection);

        $this->defaultSortBy = 'id';
        $this->pageSize = 200;
    }

    /**
     * @return mixed
     */
    public function objColumnsJson()
    {
        return json_decode($this->columnsJson ?: '[]');
    }

    /**
     * @return mixed
     */
    public function objModelNote()
    {
        $fullClass = UtilsService::getFullClassFromName('ModelNote');
        $modelNote = $fullClass::getByField($this->_connection, 'title', $this->className);

        $newModeNote = new $fullClass($this->_connection);
        $newModeNote->title = $this->className;

        return $modelNote ?: $newModeNote;
    }

    /**
     * @param array $options
     * @return string|void|null
     */
    public function save($options = [])
    {
        $this->_beforeSave();

        if (!$this->id) {
            $this->id = Uuid::uuid4()->toString();
        }

        $modelService = $options['modelService'] ?? null;
        if ($modelService) {
            $modelService->saveClassModelFile($this);
            $modelService->saveClassGeneratedFile($this);
            $modelService->updateDatabaseTable($this);
        }
    }

    /**
     * @return mixed
     */
    public function delete($options = [])
    {
        $modelService = $options['modelService'] ?? null;
        if ($modelService) {
            $modelService->deleteModel($this);
        }
    }

    /**
     * @return string
     */
    public function getTableName()
    {
        $slugify = new Slugify(['trim' => false]);
        return $slugify->slugify($this->className, '_');
    }

    /**
     * @return array
     */
    public function getTableColumns()
    {
        $columns = [];

        $data = $this->_getReflectionData();
        foreach ($data->fields as $idx => $itm) {
            if (substr($idx, 0, 1) == '_' || $idx == 'id') {
                $columns[$idx] = $itm;
            }
        }

        $types = ModelService::getModelColumnTypes();
        $columnsJson = $this->objColumnsJson();
        foreach ($columnsJson as $itm) {
            if ($types[$itm->id]) {
                $columns[$itm->field] = $types[$itm->id];
            }
        }

        return $columns;
    }
}