<?php

namespace EvilWife\_Core\Db;

use Cocur\Slugify\Slugify;
use Doctrine\DBAL\Connection;

use EvilWife\_Core\Db\Traits\BaseORMTrait;
use EvilWife\_Core\Service\UtilsService;
use Ramsey\Uuid\Uuid;

abstract class BaseORM implements \JsonSerializable
{
    use BaseORMTrait;

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
}