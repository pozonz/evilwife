<?php

namespace Pozo\EvilWife\_Core\Service;

class UtilsService
{
    /**
     * @param $className
     * @return string|null
     */
    static public function getFullClassFromName($className)
    {
        $fullClassNames = [
            "\\App\\ORM\\{$className}",
            "\\Pozo\\EvilWife\\_Core\\ORM\\{$className}",
        ];
        foreach ($fullClassNames as $fullClassName) {
            if (class_exists($fullClassName)) {
                return $fullClassName;
            }
        }
        return null;
    }

    /**
     * @param $name
     * @param string $delimeter
     * @return mixed|string
     */
    static public function basename($name, $delimeter = '\\')
    {
        $name = basename($name);
        $array = explode($delimeter, $name);
        return end($array);
    }

        /**
     * @param $className
     * @param $connection
     * @return mixed|null
     */
    static public function getModelFromName($className, $connection)
    {
        $fullClassNames = [
            "\\App\\ORM\\Model\\{$className}Model",
            "\\Pozo\\EvilWife\\_Core\\ORM\\Model\\{$className}Model",
        ];
        foreach ($fullClassNames as $fullClassName) {
            if (class_exists($fullClassName)) {
                return new $fullClassName($connection);
            }
        }
        return null;
    }
}