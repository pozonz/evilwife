<?php

namespace EvilWife\_Core\Db\Traits;

use Cocur\Slugify\Slugify;
use Doctrine\DBAL\Connection;
use EvilWife\_Core\Service\UtilsService;

trait BaseORMTrait
{
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
