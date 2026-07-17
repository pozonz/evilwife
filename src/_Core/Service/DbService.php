<?php

namespace Pozo\EvilWife\_Core\Service;

use Doctrine\DBAL\Connection;
use ExWife\Engine\Cms\_Core\Service\UtilsService;

class DbService
{

    /**
     * @var Connection
     */
    protected $_connection;

    /**
     * DbService constructor.
     * @param Connection $connection
     */
    public function __construct(Connection $connection)
    {
        $this->_connection = $connection;
    }

    /**
     * @param $className
     * @param $field
     * @param $value
     * @return mixed
     */
    public function getActiveByField($className, $field, $value)
    {
        return $this->data($className, [
            'whereSql' => "m.$field = ?",
            'params' => array($value),
            'oneOrNull' => 1,
        ]);
    }

    /**
     * @param $className
     * @param $id
     * @return mixed
     */
    public function getActiveById($className, $id)
    {
        return $this->getActiveByField($className, 'id', $id);
    }

    /**
     * @param $className
     * @param $slug
     * @return mixed
     */
    public function getActiveBySlug($className, $slug)
    {
        return $this->getActiveByField($className, '_slug', $slug);
    }

    /**
     * @param $className
     * @param array $options
     * @return mixed
     */
    public function active($className, $options = array())
    {
        $fullClassName = UtilsService::getFullClassFromName($className);
        return $fullClassName::active($this->_connection, $options);
    }

    /**
     * @param $className
     * @param $field
     * @param $value
     * @return mixed
     */
    public function getByField($className, $field, $value)
    {
        return $this->data($className, [
            'whereSql' => "m.$field = ?",
            'params' => array($value),
            'oneOrNull' => 1,
        ]);
    }

    /**
     * @param $className
     * @param $id
     * @return mixed
     */
    public function getById($className, $id)
    {
        return $this->getByField($className, 'id', $id);
    }

    /**
     * @param $className
     * @param $slug
     * @return mixed
     */
    public function getBySlug($className, $slug)
    {
        return $this->getByField($className, '_slug', $slug);
    }

    /**
     * @param $className
     * @param array $options
     * @return mixed
     */
    public function data($className, $options = array())
    {
        $fullClassName = UtilsService::getFullClassFromName($className);
        return $fullClassName::data($this->_connection, $options);
    }
}