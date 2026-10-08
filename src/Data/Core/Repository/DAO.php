<?php

namespace Pozo\EvilWife\Data\Core\Repository;

use Cocur\Slugify\Slugify;
use Doctrine\DBAL\Connection;
use Pozo\EvilWife\Data\Core\Service\UtilsService;
use Ramsey\Uuid\Uuid;

abstract class DAO implements \JsonSerializable
{

    /**
     * @var Connection
     */
    public $_connection;

    /**
     * #pz int(11) NOT NULL AUTO_INCREMENT
     */
    public $id;

    /**
     * #pz varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL
     */
    public $_uniqid;

    /**
     * #pz varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL
     */
    public $_slug;

    /**
     * #pz tinyint(1) NULL DEFAULT 0
     */
    public $_status;

    /**
     * #pz tinyint(1) NULL DEFAULT 0
     */
    public $_closed;

    /**
     * #pz int(11) NOT NULL DEFAULT 0
     */
    public $_rank;

    /**
     * #pz datetime NULL
     */
    public $_added;

    /**
     * #pz datetime NULL
     */
    public $_modified;

    /**
     * #pz datetime NULL
     */
    public $_publishFrom;

    /**
     * #pz datetime NULL
     */
    public $_publishTo;

    /**
     * #pz int(11) NULL DEFAULT 0
     */
    public $_userId;

    /**
     * #pz varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL
     */
    public $_versionUuid;

    /**
     * #pz int(11) NULL DEFAULT 0
     */
    public $_versionOrmId;

    /**
     * #pz tinyint(1) NULL DEFAULT 0
     */
    public $_isDraft;

    /**
     * #pz varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL
     */
    public $_draftName;

    /**
     * #pz tinyint(1) NULL DEFAULT 0
     */
    public $_isBootstrapData;

    /**
     * #pz tinyint(1) NULL DEFAULT 0
     */
    public $_isArchived;

    /**
     * #pz tinyint(1) NULL DEFAULT 0
     */
    public $_displayAdded;

    /**
     * #pz tinyint(1) NULL DEFAULT 0
     */
    public $_displayModified;

    /**
     * #pz tinyint(1) NULL DEFAULT 0
     */
    public $_displayUser;

    /**
     * BaseTrait constructor.
     * @param Connection $connection
     */
    public function __construct(Connection $connection)
    {
        $this->_connection = $connection;
        $this->_uniqid = $this->_uniqid ?: Uuid::uuid4()->toString();
        $this->_status = 1;
        $this->_closed = 0;
        $this->_rank = 0;
        $this->_added = date('Y-m-d H:i:s');
        $this->_modified = date('Y-m-d H:i:s');
        $this->_versionUuid = '';
        $this->_draftName = '';
    }

    /**
     * @return \stdClass
     */
    public function jsonSerialize()
    {
        $json = new \stdClass();

        $data = $this->_getReflectionData();

        $fields = array_keys($data->fields);
        foreach ($fields as $field) {
            $json->{$field} = $this->{$field};
        }

        foreach ($data->methods as $method) {
            $methodName = $method->getName();
            if (strpos($methodName, '_json') === 0) {
                $json->{$methodName} = $this->$methodName();
                if ($json->{$methodName} instanceof \JsonSerializable) {
                    $json->{$methodName} = $json->{$methodName}->jsonSerialize();
                }
            }
        }

        return $json;
    }

    /**
     * @return array|null
     */
    public function _ormUser()
    {
        $fullClass = UtilsService::getFullClassFromName('User');
        return $fullClass::getById($this->_connection, $this->_userId);
    }

    /**
     * @return object
     */
    public function _getReflectionData()
    {
        $properties = [];
        $methods = [];

        $rc = $this->_getReflectionClass();
        do {
            $properties = array_merge($rc->getProperties(), $properties);
            $methods = array_merge($rc->getMethods(), $methods);

            $rc = $rc->getParentClass();
        } while ($rc);

        $fields = [];
        foreach ($properties as $property) {
            $comment = $property->getDocComment();
            preg_match('/#pz(\ )+(.*)/', $comment, $matches);
            if (count($matches) == 3) {
                $fields[$property->getName()] = $matches[2];
            }
        }

        return (object)[
            'properties' => $properties,
            'methods' => $methods,
            'fields' => $fields,
        ];
    }

    /**
     * @return \ReflectionClass
     * @throws \ReflectionException
     */
    public function _getReflectionClass()
    {
        return new \ReflectionClass(get_called_class());
    }

    /**
     * @param $field
     * @param CmsService|null $cmsService
     * @return string|null
     */
    public function _display($field, CmsService $cmsService = null)
    {
        $customDisplay = "_display" . ucfirst($field);
        if (method_exists($this, $customDisplay)) {
            return $this->$customDisplay();
        }

        if (strpos($field, '_') === 0) {
            if (in_array($field, ['_added', '_modified'])) {
                return $this->$field ? date('d M y', strtotime($this->$field)) : null;
            } else if (in_array($field, ['_userId'])) {
                $fullClass = UtilsService::getFullClassFromName('User');
                $orm = $fullClass::getById($this->_connection, $this->$field);
                return $orm ? $orm->name : null;
            } else {
                return $this->$field;
            }
        }

        $model = static::getModel($this->_connection);
        $objColumnJson = $model->objColumnsJson();
        foreach ($objColumnJson as $columnJson) {
            if ($columnJson->field == $field) {

                if (in_array($columnJson->widget, ModelService::getRelationalWidgets())) {
                    $matches = ModelService::getModelMatchesFromQuery($columnJson->sqlQuery);
                    if (count($matches) == 2 && strtolower($matches[0]) == 'from _model') {
                        $result = ModelService::getResultModelsFromQuery($this->_connection, $columnJson->sqlQuery, $cmsService);
                    } else if (count($matches) == 2) {
                        $result = ModelService::getResultModelDataFromQuery($this->_connection, $columnJson->sqlQuery);
                    } else {
                        $result = ModelService::getResultQueryDataFromQuery($this->_connection, $columnJson->sqlQuery);
                    }

                    if (in_array($columnJson->widget, ModelService::getRelationalJsonWidgets())) {
                        $jsonValue = json_decode($this->$field ?: '[]');
                        $values = [];
                        foreach ($result as $itm) {
                            if (in_array($itm->key, $jsonValue)) {
                                $values[] = $itm->value;
                            }
                        }
                        return join(', ', $values);

                    } else {
                        foreach ($result as $itm) {
                            if ($itm->key == $this->$field) {
                                return $itm->value;
                            }
                        }
                    }
                } elseif ($columnJson->widget == 'Date picker') {

                    return date('d M y', strtotime($this->$field));

                } elseif ($columnJson->widget == 'Date time picker') {

                    return date('d M y H:i', strtotime($this->$field));

                } else {

                    return $this->$field;

                }

            }
        }

        return null;
    }

    /**
     * @param $connection
     * @return mixed
     */
    static public function getModel($connection)
    {
        $className = UtilsService::basename(get_called_class());
        return UtilsService::getModelFromName($className, $connection);
    }

    /**
     * @param Connection $connection
     * @param $id
     * @return array|null
     */
    static public function getActiveByField(Connection $connection, $field, $value)
    {
        return static::active($connection, [
            'whereSql' => "CAST(m.`$field` AS CHAR(255)) = ?",
            'params' => [$value],
            'oneOrNull' => 1,
        ]);
    }

    /**
     * @param Connection $connection
     * @param $id
     * @return array|null
     */
    static public function getActiveById(Connection $connection, $id)
    {
        return static::getActiveByField($connection, 'id', $id);
    }

    /**
     * @param Connection $connection
     * @param $slug
     * @return array|null
     */
    static public function getActiveByTitle(Connection $connection, $title)
    {
        return static::getActiveByField($connection, 'title', $title);
    }

    /**
     * @param Connection $connection
     * @param $slug
     * @return array|null
     */
    static public function getActiveBySlug(Connection $connection, $slug)
    {
        return static::getActiveByField($connection, '_slug', $slug);
    }

    /**
     * @param Connection $connection
     * @param array $options
     * @return array|null
     */
    static public function active(Connection $connection, $options = [])
    {
        if (isset($options['whereSql'])) {
            $options['whereSql'] .= ($options['whereSql'] ? ' AND ' : '') . 'm._status = 1';
        } else {
            $options['whereSql'] = 'm._status = 1';
        }
        return static::data($connection, $options);
    }

    /**
     * @param Connection $connection
     * @param $id
     * @return array|null
     */
    static public function getByField(Connection $connection, $field, $value)
    {
        return static::data($connection, [
            'whereSql' => "CAST(m.`$field` AS CHAR(255)) = ?",
            'params' => [$value],
            'oneOrNull' => 1,
        ]);
    }

    /**
     * @param Connection $connection
     * @param $id
     * @return array|null
     */
    static public function getById(Connection $connection, $id)
    {
        return static::getByField($connection, 'id', $id);
    }

    /**
     * @param Connection $connection
     * @param $slug
     * @return array|null
     */
    static public function getByTitle(Connection $connection, $title)
    {
        return static::getByField($connection, 'title', $title);
    }

    /**
     * @param Connection $connection
     * @param $slug
     * @return array|null
     */
    static public function getBySlug(Connection $connection, $slug)
    {
        return static::getByField($connection, '_slug', $slug);
    }

    /**
     * @param Connection $connection
     * @param array $options
     * @return array|null
     */
    static public function data(Connection $connection, $options = [])
    {
        /** @var Model $model */
        $model = static::getModel($connection);
        $tableName = $model->getTableName();
        $fields = array_keys($model->getTableColumns());

        $myClass = get_called_class();
        $implementedInterfaces = class_implements($myClass);

        $options['ignorePreview'] = isset($options['ignorePreview']) ? $options['ignorePreview'] : 0;
        if (in_array('ExWife\\Engine\\Cms\\_Core\\Version\\VersionInterface', $implementedInterfaces) && $options['ignorePreview'] != 1) {
            $path = explode('\\', $myClass);
            $className = array_pop($path);
            $request = $options['request'] ?? Request::createFromGlobals();
            $previewOrmToken = $request->get('__preview_' . strtolower($className));
            if ($previewOrmToken) {
                $options['whereSql'] = 'm._versionUuid = ?';
                $options['params'] = [$previewOrmToken];
                $options['includePreviousVersion'] = 1;
            }
        }

        $options['select'] = isset($options['select']) && !empty($options['select']) ? $options['select'] : 'm.*';
        $options['joins'] = isset($options['joins']) && !empty($options['joins']) ? $options['joins'] : null;
        $options['whereSql'] = isset($options['whereSql']) && !empty($options['whereSql']) ? "({$options['whereSql']})" : null;
        $options['params'] = isset($options['params']) && gettype($options['params']) == 'array' && count($options['params']) ? $options['params'] : [];
        $options['sort'] = isset($options['sort']) && !empty($options['sort']) ? $options['sort'] : 'm._rank';
        $options['order'] = isset($options['order']) && !empty($options['order']) ? $options['order'] : 'ASC';
        $options['groupby'] = isset($options['groupby']) && !empty($options['groupby']) ? $options['groupby'] : null;
        $options['page'] = isset($options['page']) ? $options['page'] : 1;
        $options['limit'] = isset($options['limit']) ? $options['limit'] : 0;
        $options['orm'] = isset($options['orm']) ? $options['orm'] : 1;
        $options['debug'] = isset($options['debug']) ? $options['debug'] : 0;
        $options['idArray'] = isset($options['idArray']) ? $options['idArray'] : 0;
        $options['includePreviousVersion'] = isset($options['includePreviousVersion']) ? $options['includePreviousVersion'] : 0;

        $options['oneOrNull'] = isset($options['oneOrNull']) ? $options['oneOrNull'] == true : false;
        if ($options['oneOrNull']) {
            $options['limit'] = 1;
            $options['page'] = 1;
        }

        $options['count'] = isset($options['count']) ? $options['count'] == true : false;
        if ($options['count']) {
            $options['orm'] = false;
            $options['oneOrNull'] = true;
            $options['select'] = 'COUNT(*) AS count';
            $options['page'] = null;
            $options['limit'] = null;
        }

        $sql = "SELECT {$options['select']} FROM `{$tableName}` AS m";
        $sql .= $options['joins'] ? ' ' . $options['joins'] : '';
        if ($options['includePreviousVersion']) {
            $sql .= $options['whereSql'] ? ' WHERE (' . $options['whereSql'] . ')' : '';
        } else {
            $sql .= ' WHERE m._versionOrmId IS NULL ' . ($options['whereSql'] ? ' AND (' . $options['whereSql'] . ')' : '');
        }
        $sql .= $options['groupby'] ? ' GROUP BY ' . $options['groupby'] : '';
        if ($options['sort']) {
            $sql .= " ORDER BY {$options['sort']} {$options['order']}";
        }
        if ($options['limit'] && $options['page']) {
            $sql .= " LIMIT " . (($options['page'] - 1) * $options['limit']) . ", " . $options['limit'];
        }

        if ($options['debug']) {
            while (@ob_end_clean()) ;
            var_dump($sql, $options['params']);
            exit;
        }

        $result = $connection->executeQuery($sql, $options['params'])->fetchAllAssociative();

        if ($options['orm']) {
            $orms = [];
            foreach ($result as $itm) {
                $orm = new $myClass($connection);
                foreach ($fields as $field) {
                    if (array_key_exists($field, $itm)) {
                        $orm->{$field} = $itm[$field];
                    }
                }
                if ($options['idArray']) {
                    $orms[$orm->id] = $orm;
                } else {
                    $orms[] = $orm;
                }
            }
            $result = $orms;
        }

        if ($options['oneOrNull']) {
            $result = reset($result) ?: null;
        }

        return $result;
    }

    /**
     * @param array $options
     */
    protected function _beforeSave($options = [])
    {
        $saveVersion = $options['saveVersion'] ?? 0;
        $doNotUpdateModified = $options['doNotUpdateModified'] ?? 0;
        $doNotUpdateSlug = $options['doNotUpdateSlug'] ?? 0;
        $draftName = $options['draftName'] ?? '';

        if ($saveVersion && $this instanceof VersionInterface) {
            if ($draftName) {
                $this->saveDraft($draftName);
            } else {
                $this->saveVersion();
            }
        }

        if (!$doNotUpdateModified) {
            $this->_modified = date('Y-m-d H:i:s');
        }

        if (!$doNotUpdateSlug) {
            $slugify = new Slugify(['trim' => false]);
            $this->_slug = $slugify->slugify($this->title ?? '');
        }
    }

    /**
     * @param array $options
     * @return string|null
     * @throws \Doctrine\DBAL\Driver\Exception
     */
    public function save($options = [])
    {
        $this->_beforeSave($options);

        /** @var Model $model */
        $model = static::getModel($this->_connection);
        $tableName = $model->getTableName();
        $fields = array_keys($model->getTableColumns());

        $sql = '';
        $params = [];
        if (!$this->id || (isset($options['forceInsert']) && $options['forceInsert'] == 1)) {

            $sql = "INSERT INTO `{$tableName}` ";
            $part1 = '(';
            $part2 = ' VALUES (';
            foreach ($fields as $field) {
                if ($field == 'id') {
//                    continue;
                }

                $part1 .= "`$field`, ";
                $part2 .= "?, ";
                $params[] = $this->{$field};
            }
            $part1 = rtrim($part1, ', ') . ')';
            $part2 = rtrim($part2, ', ') . ')';
            $sql = $sql . $part1 . $part2;

        } else {

            $sql = "UPDATE `{$tableName}` SET ";
            foreach ($fields as $field) {
                if ($field == 'id') {
                    continue;
                }
                $sql .= "`$field` = ?, ";
                $params[] = $this->{$field};
            }
            $sql = rtrim($sql, ', ') . ' WHERE id = ?';
            $params[] = $this->id;

        }

        try {

            $this->_connection->executeStatement($sql, $params);
            if (!$this->id) {
                $this->id = $this->_connection->lastInsertId();
            }

            if (method_exists($this, 'updateManageSearchList')) {
                $this->updateManageSearchList();
            }

            if (method_exists($this, 'updateSiteSearchList')) {
                $this->updateSiteSearchList();
            }

            return $this->id;
        } catch (\Exception $ex) {
            die($ex->getMessage());
        }

        return null;
    }

    /**
     * @return mixed
     */
    public function delete($options = [])
    {
        if (method_exists($this, 'deleteManageSearchList')) {
            $this->deleteManageSearchList($this->id);
        }

        if (method_exists($this, 'deleteSiteSearchList')) {
            $this->deleteSiteSearchList($this->id);
        }

        /** @var Model $model */
        $model = static::getModel($this->_connection);
        $tableName = $model->getTableName();

        $sql = "DELETE FROM `{$tableName}` WHERE id = ?";
        return $this->_connection->executeStatement($sql, [$this->id]);
    }

    /**
     * @param $siteMapUrl
     * @return string|string[]|null
     */
    public function getSiteMapUrlByCustomUrl($customUrl)
    {
        $model = static::getModel($this->_connection);
        $fields = array_keys($model->getTableColumns());
        foreach ($fields as $field) {
            $customUrl = str_replace("{{{$field}}}", $this->$field, $customUrl);
        }
        return $customUrl;
    }

    /**
     * Return the front-end URL by replacing the value of the sitemap URL's variables
     * @return string|string[]|null
     */
    public function getSiteMapUrl()
    {
        /** @var Model $model */
        $model = static::getModel($this->_connection);
        if ($model) {
            $frontendUrl = $model->frontendUrl;
            return $this->getSiteMapUrlByCustomUrl($frontendUrl);
        }
        return null;
    }

    /**
     * @return bool
     */
    public function enabledVersioning()
    {
        return $this instanceof VersionInterface;
    }

    /**
     * @return int
     */
    public function canBePreviewed()
    {
        return $this->enabledVersioning() && $this->getSiteMapUrl() ? 1 : 0;
    }

    /**
     * @return array|null
     */
    public function objDrafts()
    {
        return static::data($this->_connection, [
            'whereSql' => 'm._versionOrmId = ? AND m._isDraft = 1',
            'params' => [$this->id],
            'sort' => 'm.id',
            'order' => 'DESC',
            'includePreviousVersion' => 1,
        ]);
    }

    /**
     * @return array|null
     */
    public function objVersions()
    {
        return static::data($this->_connection, [
            'whereSql' => 'm._versionOrmId = ? AND m._isDraft = 0',
            'params' => [$this->id],
            'sort' => 'm.id',
			'order' => 'DESC',
            'includePreviousVersion' => 1,
        ]);
    }

    /**
     * @param $contentBlocksContent
     * @return string
     */
    protected function _ContentBlocksContent($contentBlocksContent)
    {
        $result = [];
        $sections = json_decode($contentBlocksContent);
        foreach ($sections as $section) {
            foreach ($section->blocks as $block) {
                foreach ($block->values as $key => $value) {
                    if (is_numeric($value)) {
                        continue;
                    } else if (!$value) {
                        continue;
                    } else if (gettype($value) !== 'string') {
                        continue;
                    } else if (strpos(strtolower($key), 'youtube') !== false) {
                        continue;
                    } else if (json_decode($value)) {
                        continue;
                    }

                    $value = strip_tags($value);
                    $value = str_replace("\n", '', $value);
                    $result[] = $value;
                }
            }
        }
        return implode(' ', $result);
    }
}