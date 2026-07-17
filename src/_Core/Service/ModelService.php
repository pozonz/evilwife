<?php

namespace Pozo\EvilWife\_Core\Service;

use BlueM\Tree;
use Cocur\Slugify\Slugify;
use Doctrine\DBAL\Connection;
use Pozo\EvilWife\_Core\Db\Sql;
use Pozo\EvilWife\_Core\Db\Model;
use Symfony\Component\HttpKernel\KernelInterface;

class ModelService
{
    /**
     * @var Connection
     */
    protected $_connection;

    /**
     * @var KernelInterface
     */
    protected $_kernel;

    /**
     * @var CmsService
     */
    protected $_cmsService;

    /**
     * ModelService constructor.
     * @param Connection $connection
     * @param KernelInterface $kernel
     */
    public function __construct(Connection $connection, KernelInterface $kernel)
    {
        $this->_connection = $connection;
        $this->_kernel = $kernel;
    }

    /**
     * @param $model
     */
    public function deleteModel($model)
    {
        $ormClassDir = $this->getOrmClassDir($model);

        $classModelFile = $ormClassDir . 'Model/' . $model->className . 'Model.php';
        $classGeneratedFile = $ormClassDir . 'Generated/' . $model->className . 'Generated.php';
        $classTraitFile = $ormClassDir . 'Traits/' . $model->className . 'Trait.php';
        $classFile = $ormClassDir . $model->className . '.php';

        $files = [$classModelFile, $classGeneratedFile, $classTraitFile, $classFile];
        foreach ($files as $file) {
            if (file_exists($file)) {
                unlink($file);
            }
        }
    }

    /**
     * @param Model $model
     */
    public function saveClassModelFile($model)
    {
        $ormClassDir = $this->getOrmClassDir($model);
        $ormNamespace = $this->getOrmNamespace($model);

        $jsonModel = (array)$model->jsonSerialize();
        $fields = array_map(function ($itm, $key) {
            $value = $itm !== null ? ("'" . str_replace('\'', '\\\'', $itm . '') . "'") : 'null';

            return <<<EOD
    public \${$key} = {$value};
   
EOD;
        }, $jsonModel, array_keys($jsonModel));

        $ormClassModelDir = $ormClassDir . 'Model/';
        if (!file_exists($ormClassModelDir)) {
            mkdir($ormClassModelDir, 0777, true);
        }

        $targetFile = $ormClassModelDir . $model->className . 'Model.php';
        $sourceFile = 'orm_model.txt';
        $content = file_get_contents(__DIR__ . '/../../../../Resources/files/' . $sourceFile);
        $content = str_replace('{namespace}', $ormNamespace, $content);
        $content = str_replace('{classname}', $model->className, $content);
        $content = str_replace('{fields}', join("\n", $fields), $content);
        file_put_contents($targetFile, $content);
    }

    /**
     * @param Model $model
     */
    public function saveClassGeneratedFile($model)
    {
        $ormClassDir = $this->getOrmClassDir($model);
        $ormNamespace = $this->getOrmNamespace($model);

        $columnTypes = static::getModelColumnTypes();
        $columnsJson = $model->objColumnsJson();
        $columns = array_map(function ($itm) use ($columnTypes) {
            $columnType = $columnTypes[$itm->id];
            return <<<EOD
    /**
     * #pz {$columnType}
     */
    public \${$itm->field};
   
EOD;
        }, $columnsJson);

        $interfaces = [];
        $traits = [];

        if ($model->enableVersioning) {
            $interfaces[] = 'VersionInterface';
            $traits[] = 'VersionTrait';
        }

        if ($model->searchableInCms) {
            $interfaces[] = 'ManageSearchInterface';
            $traits[] = 'ManageSearchTrait';
        }

        if ($model->searchableInFrontend) {
            $interfaces[] = 'SiteSearchInterface';
            $traits[] = 'SiteSearchTrait';
        }

        if (!count($interfaces)) {
            $interfaces = '';
        } else {
            $interfaces = 'implements ' . join(', ', $interfaces);
        }

        if (!count($traits)) {
            $traits = '';
        } else {
            $traits = 'use ' . join(', ', $traits) . ';';
        }

        $ormClassGeneratedDir = $ormClassDir . 'Generated/';
        if (!file_exists($ormClassGeneratedDir)) {
            mkdir($ormClassGeneratedDir, 0777, true);
        }

        $targetFile = $ormClassGeneratedDir . $model->className . 'Generated.php';
        $sourceFile = 'orm_generated.txt';
        $content = file_get_contents(__DIR__ . '/../../../../Resources/files/' . $sourceFile);
        $content = str_replace('{namespace}', $ormNamespace, $content);
        $content = str_replace('{classname}', $model->className, $content);
        $content = str_replace('{interfaces}', $interfaces, $content);
        $content = str_replace('{traits}', $traits, $content);
        $content = str_replace('{fields}', join("\n", $columns), $content);
        file_put_contents($targetFile, $content);
    }

    /**
     * @param Model $model
     */
    public function saveClassTraitFile($model)
    {
        if ($model->modelCategory == 1) {
            return;
        }

        $ormClassDir = $this->getOrmClassDir($model);
        $ormNamespace = $this->getOrmNamespace($model);

        $ormClassTraitsDir = $ormClassDir . 'Traits/';
        if (!file_exists($ormClassTraitsDir)) {
            mkdir($ormClassTraitsDir, 0777, true);
        }

        $targetFile = $ormClassTraitsDir . $model->className . 'Trait.php';
        if (!file_exists($targetFile)) {
            $sourceFile = 'orm_trait.txt';
            $content = file_get_contents(__DIR__ . '/../../../../Resources/files/' . $sourceFile);
            $content = str_replace('{namespace}', $ormNamespace, $content);
            $content = str_replace('{classname}', $model->className, $content);
            file_put_contents($targetFile, $content);
        }
    }

    /**
     * @param Model $model
     */
    public function saveClassFile($model)
    {
        $ormClassDir = $this->getOrmClassDir($model);
        $ormNamespace = $this->getOrmNamespace($model);

        if (!file_exists($ormClassDir)) {
            mkdir($ormClassDir, 0777, true);
        }

        $targetFile = $ormClassDir . $model->className . '.php';
        if (!file_exists($targetFile)) {
            $sourceFile = 'orm_custom.txt';
            $content = file_get_contents(__DIR__ . '/../../../../Resources/files/' . $sourceFile);
            $content = str_replace('{namespace}', $ormNamespace, $content);
            $content = str_replace('{classname}', $model->className, $content);

            if ($model->modelCategory == 1) {
                $builtInModel = clone $model;
                $builtInModel->modelCategory = 2;
                $builtInModelOrmNamespace = $this->getOrmNamespace($builtInModel);
                if (class_exists("$builtInModelOrmNamespace\\{$model->className}")) {
                    $content = str_replace('{useTraitsClass}',  "use {$builtInModelOrmNamespace}\\Traits\\{$model->className}Trait;", $content);
                    $content = str_replace('{traitsClass}',  "use {$model->className}Trait;", $content);
                } else {
                    $content = str_replace('{useTraitsClass}',  "", $content);
                    $content = str_replace('{traitsClass}',  "", $content);
                }

            } else if ($model->modelCategory == 2) {
                $content = str_replace('{useTraitsClass}',  "use {$ormNamespace}\\Traits\\{$model->className}Trait;", $content);
                $content = str_replace('{traitsClass}',  "use {$model->className}Trait;", $content);
            }

            file_put_contents($targetFile, $content);
        }
    }

    /**
     * @param Model $model
     * @return int
     */
    public function updateDatabaseTable($model)
    {
        $tableName = $model->getTableName();
        $db = new Sql($this->_connection, $tableName);
        if (!$db->exists()) {
            $db->create();
        }
        $columns = $model->getTableColumns();
        return $db->sync($columns);
    }

    /**
     * @param $model
     * @return string
     */
    public function getOrmClassDir($model)
    {
        return ($model->modelCategory == 1 ? __DIR__ . '/../../../../../../../src/ORM/' : __DIR__ . '/../ORM/');
    }

    /**
     * @param $model
     * @return string
     */
    public function getOrmNamespace($model)
    {
        return $model->modelCategory == 1 ? 'App\\ORM' : 'ExWife\\Engine\\Cms\\_Core\\ORM';
    }

    /**
     * @param null $cmsService
     * @return array
     */
    public function getContentBlocks($cmsService = null)
    {
        $fullClass = UtilsService::getFullClassFromName('ContentBlock');
        $data = $fullClass::active($this->_connection, [
            'sort' => 'm.title',
        ]);
        $data = array_map(function ($itm) use ($cmsService) {
            $jsonItems = json_decode($itm->items ?: '[]');
            foreach ($jsonItems as $jsonItem) {
                $jsonItem->choices = static::getChoicesByWidget($jsonItem->widget, $this->_connection, $jsonItem->sql, $cmsService);
            }
            $itm->items = json_encode($jsonItems);
            return $itm;
        }, $data);
        return $data;
    }

    /**
     * @return string[]
     */
    static public function getRelationalWidgets()
    {
        return ['Choice', 'Choice multi', 'Choice tree', 'Choice tree multi', 'Choice sortable'];
    }

    /**
     * @return string[]
     */
    static public function getRelationalTreeWidgets()
    {
        return ['Choice tree', 'Choice tree multi'];
    }

    /**
     * @return string[]
     */
    static public function getRelationalJsonWidgets()
    {
        return ['Choice multi', 'Choice tree multi', 'Choice sortable'];
    }

    /**
     * @return string[]
     */
    static public function getModelColumnWidgets()
    {
        $widgets = [
            'Date picker' => '\\ExWife\\Engine\\Cms\\_Core\\Model\\Form\\Type\\DatePickerType',
            'Date & time picker' => '\\ExWife\\Engine\\Cms\\_Core\\Model\\Form\\Type\\DateTimePickerType',
            'Time picker' => '\\ExWife\\Engine\\Cms\\_Core\\Model\\Form\\Type\\TimePickerType',
            'Asset picker' => '\\ExWife\\Engine\\Cms\\_Core\\Model\\Form\\Type\\AssetPickerType',
            'Asset files picker' => '\\ExWife\\Engine\\Cms\\_Core\\Model\\Form\\Type\\AssetFilesPickerType',
            'Wysiwyg' => '\\ExWife\\Engine\\Cms\\_Core\\Model\\Form\\Type\\WysiwygType',
            'Choice' => '\\Symfony\\Component\\Form\\Extension\\Core\\Type\\ChoiceType',
            'Choice multi' => '\\ExWife\\Engine\\Cms\\_Core\\Model\\Form\\Type\\ChoiceMultiType',
            'Choice tree' => '\\ExWife\\Engine\\Cms\\_Core\\Model\\Form\\Type\\ChoiceTreeType',
            'Choice tree multi' => '\\ExWife\\Engine\\Cms\\_Core\\Model\\Form\\Type\\ChoiceTreeMultiType',
            'Choice sortable' => '\\ExWife\\Engine\\Cms\\_Core\\Model\\Form\\Type\\ChoiceSortableType',
            'Multiple key value pair' => '\\ExWife\\Engine\\Cms\\_Core\\Model\\Form\\Type\\MultipleKeyValuePairType',
            'Content blocks' => '\\ExWife\\Engine\\Cms\\_Core\\Model\\Form\\Type\\ContentBlockType',
            'Checkbox' => '\\Symfony\\Component\\Form\\Extension\\Core\\Type\\CheckboxType',
            'Email' => '\\Symfony\\Component\\Form\\Extension\\Core\\Type\\EmailType',
            'Password' => '\\Symfony\\Component\\Form\\Extension\\Core\\Type\\PasswordType',
            'Text' => '\\Symfony\\Component\\Form\\Extension\\Core\\Type\\TextType',
            'Textarea' => '\\Symfony\\Component\\Form\\Extension\\Core\\Type\\TextareaType',
            'Hidden' => '\\Symfony\\Component\\Form\\Extension\\Core\\Type\\HiddenType',
        ];
        ksort($widgets);
        return $widgets;
    }

    /**
     * @return array
     */
    static public function getBlockWidgets()
    {
        $widgets = [
            'Text' => 'Text',
            'Textarea' => 'Textarea',
            'Asset picker' => 'Asset picker',
            'Asset files picker' => 'Asset files picker',
            'Checkbox' => 'Checkbox',
            'Wysiwyg' => 'Wysiwyg',
            'Date picker' => 'Date picker',
            'Date & time picker' => 'Date & time picker',
            'Time picker' => 'Time picker',
            'Choice' => 'Choice',
            'Choice multi' => 'Choice multi',
            'Placeholder' => 'Placeholder',
            'Choice tree' => 'Choice tree',
            'Choice tree multi' => 'Choice tree multi',
            'Choice sortable' => 'Choice sortable',
            'Multiple key value pair' => 'Multiple key value pair',
        ];
        asort($widgets);
        return $widgets;
    }

    /**
     * @return string[]
     */
    static public function getModelColumnTypes()
    {
        $columns = [
            'startdate' => "datetime DEFAULT NULL",
            'enddate' => "datetime DEFAULT NULL",
            'firstdate' => "datetime DEFAULT NULL",
            'lastdate' => "datetime DEFAULT NULL",
            'date' => "datetime DEFAULT NULL",
            'date1' => "datetime DEFAULT NULL",
            'date2' => "datetime DEFAULT NULL",
            'date3' => "datetime DEFAULT NULL",
            'date4' => "datetime DEFAULT NULL",
            'date5' => "datetime DEFAULT NULL",
            'date6' => "datetime DEFAULT NULL",
            'date7' => "datetime DEFAULT NULL",
            'date8' => "datetime DEFAULT NULL",
            'date9' => "datetime DEFAULT NULL",
            'date10' => "datetime DEFAULT NULL",
            'date11' => "datetime DEFAULT NULL",
            'date12' => "datetime DEFAULT NULL",
            'date13' => "datetime DEFAULT NULL",
            'date14' => "datetime DEFAULT NULL",
            'date15' => "datetime DEFAULT NULL",
            'title' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'isactive' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'subtitle' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'shortdescription' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'description' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'content' => "mediumtext COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'category' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'subcategory' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'phone' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'mobile' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'fax' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'email' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'facebook' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'twitter' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'pinterest' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'linkedIn' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'instagram' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'qq' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'weico' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'address' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'website' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'author' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'authorbio' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'url' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'value' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'image' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'gallery' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'thumbnail' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'lastname' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'firstname' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'name' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'region' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'destination' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'excerpts' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'about' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'latitude' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'longitude' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'price' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'saleprice' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'features' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'account' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'username' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'password' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra1' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra2' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra3' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra4' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra5' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra6' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra7' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra8' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra9' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra10' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra11' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra12' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra13' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra14' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra15' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra16' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra17' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra18' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra19' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra20' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra21' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra22' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra23' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra24' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra25' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra26' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra27' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra28' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra29' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra30' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra31' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra32' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra33' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra34' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra35' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra36' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra37' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra38' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra39' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra40' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra41' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra42' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra43' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra44' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra45' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra46' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra47' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra48' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra49' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra50' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra51' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra52' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra53' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra54' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra55' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra56' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra57' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra58' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra59' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra60' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra61' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra62' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra63' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra64' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra65' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra66' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra67' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra68' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra69' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra70' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra71' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra72' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra73' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra74' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra75' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra76' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra77' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra78' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra79' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra80' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra81' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra82' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra83' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra84' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra85' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra86' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra87' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra88' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra89' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra90' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra91' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra92' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra93' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra94' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra95' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra96' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra97' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra98' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra99' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'extra100' => "text COLLATE utf8mb4_unicode_ci DEFAULT NULL",
            'blob' => "LONGBLOB NULL",
        ];
        ksort($columns, SORT_NATURAL);
        return $columns;
    }

    /**
     * @param $widget
     * @param $connection
     * @param $query
     * @param $cmsService
     * @return null
     */
    static public function getChoicesByWidget($widget, $connection, $sqlQuery, $cmsService = null)
    {
        if (in_array($widget, static::getRelationalWidgets())) {
            if (in_array($widget, static::getRelationalTreeWidgets())) {
                $result = static::getResultModelDataFromQuery($connection, $sqlQuery);
                return static::getTreeChoicesFromResult($result);
            } else {
                $matches = static::getModelMatchesFromQuery($sqlQuery);
                if (count($matches) == 2 && strtolower($matches[0]) == 'from _model') {
                    $result = static::getResultModelsFromQuery($connection, $sqlQuery, $cmsService);
                } else if (count($matches) == 2) {
                    $result = static::getResultModelDataFromQuery($connection, $sqlQuery);
                } else {
                    $result = static::getResultQueryDataFromQuery($connection, $sqlQuery);
                }
                return static::getDropdownChoicesFromResult($result);
            }
        }
        return null;
    }

    /**
     * @param $result
     * @return array
     */
    static public function getDropdownChoicesFromResult($result)
    {
        $choices = [];
        foreach ($result as $key => $val) {
            $choices[$val->value] = $val->key;
        }
        return $choices;
    }

    /**
     * @param $result
     * @return array
     */
    static public function getTreeChoicesFromResult($result)
    {
        $nodes = [];
        foreach ($result as $key => $val) {
            $nodes[] = [
                'id' => $val->key,
                'parent' => $val->parentId ?: 0, $key,
                'title' => $val->value,
            ];
        }
        $tree = new Tree($nodes, [
            'buildwarningcallback' => function () {
            },
        ]);
        $nodes = $tree->getRootNodes();

        $choices = [];
        foreach ($nodes as $node) {
            $choices = array_merge($choices, static::_getTreeChoicesFromResult($node, 1));
        }
        return $choices;
    }

    /**
     * @param Node $node
     * @param $level
     * @return array
     */
    static protected function _getTreeChoicesFromResult($node, $level)
    {
        $result = [];
        $result[] = [
            'level' => $level,
            'value' => $node->getId(),
            'label' => $node->getTitle(),
        ];
        foreach ($node->getChildren() as $itm) {
            $result = array_merge($result, static::_getTreeChoicesFromResult($itm, $level + 1));
        }
        return $result;
    }

    /**
     * @param $sqlQuery
     * @return mixed
     */
    static public function getModelMatchesFromQuery($sqlQuery)
    {
        preg_match('/\bfrom\b\s*(\w+)/i', $sqlQuery, $matches);
        return $matches;
    }

    /**
     * @param $connection
     * @param $sqlQuery
     * @return array
     */
    static public function getResultQueryDataFromQuery($connection, $sqlQuery)
    {
        $result = [];
        if ($sqlQuery) {
            $stmt = $connection->prepare($sqlQuery);
            $stmt->execute();
            $result = $stmt->fetchAll(\PDO::FETCH_OBJ);
        }
        return $result;
    }

    /**
     * @param $connection
     * @param $sqlQuery
     * @param $matches
     * @return array
     */
    static public function getResultModelDataFromQuery($connection, $sqlQuery)
    {
        $result = [];
        $matches = static::getModelMatchesFromQuery($sqlQuery);
        if (count($matches) == 2) {
            $slugify = new Slugify(['trim' => false]);
            $tablename = $slugify->slugify($matches[1]);
            $sqlQuery = str_replace($matches[0], "FROM $tablename", $sqlQuery);

//                    $model = $orm->getModel();
//                    $fullClass = static::fullClass($connection, $model->getClassName());
//                    $fields = array_keys($fullClass::getFields());
//                    foreach ($fields as $itm) {
//                        $getMethod = "get" . ucfirst($itm);
//                        $column->sqlQuery = str_replace("{{{$itm}}}", "'{$orm->$getMethod()}'", $column->sqlQuery);
//                    }

            $result = static::getResultQueryDataFromQuery($connection, $sqlQuery);
        }

        return $result;
    }

    /**
     * @param $connection
     * @param $sqlQuery
     * @param $cmsService
     * @return array|object[]
     */
    static public function getResultModelsFromQuery($connection, $sqlQuery, $cmsService)
    {
        $result = [];
        $matches = static::getModelMatchesFromQuery($sqlQuery);
        if (count($matches) == 2) {
            $model = UtilsService::getModelFromName($matches[1], $connection);
            $models = $cmsService->getModels();
            $result = array_map(function ($model) {
                return (object)[
                    'key' => $model->className,
                    'value' => $model->title,
                ];
            }, $models);

            usort($result, function ($a, $b) {
                return strcmp($a->value, $b->value) > 0 ? 1 : 0;
            });
        }
        return $result;
    }
}