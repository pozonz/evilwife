<?php

namespace EvilWife\_Core\Service;

use BlueM\Tree;
use Cocur\Slugify\Slugify;
use Doctrine\DBAL\Connection;
use ExWife\Engine\Cms\_Core\Base\ORM\BaseORM;
use ExWife\Engine\Cms\_Core\Model\Model;
use ExWife\Engine\Cms\Page\Service\PageService;
use Ramsey\Uuid\Uuid;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Security\Core\Security;

class CmsService
{
    const CMS_MENU_ITEM_PAGES = 'pages';

    const CMS_MENU_ITEM_FILES = 'files';

    const CMS_MENU_ITEM_ADMIN = 'admin';

    /**
     * @var Connection
     */
    protected $_connection;

    /**
     * @var KernelInterface
     */
    protected $_kernel;

    /**
     * @var Security
     */
    protected $_security;

    /**
     * @var Tree
     */
    protected $_navTree;

    /**
     * CmsService constructor.
     * @param Connection $connection
     * @param KernelInterface $kernel
     * @param Security $security
     */
    public function __construct(Connection $connection, KernelInterface $kernel, Security $security)
    {
        $this->_connection = $connection;
        $this->_kernel = $kernel;
        $this->_security = $security;
    }

    /**
     * @return array
     */
    public function getUserAccessibleModelNames()
    {
        $navTree = $this->getNavTree();

        $isAdmin = 0;
        $models = [];
        foreach ($navTree->getRootNodes() as $rootNode) {
            if (isset($rootNode->data) && $rootNode->data->title == 'Admin') {
                $isAdmin = 1;
            }
            $models = array_merge($models, $this->_getModelsFromNode($rootNode));
        }

        $modelNames = array_map(function ($itm) {
            return $itm->className;
        }, $models);

        if (in_array('Product', $modelNames)) {
            $modelNames[] = 'ProductVariant';
        }

        if ($isAdmin) {
            $modelNames[] = 'Model';
        }

        return array_unique($modelNames);
    }

    /**
     * @param $pageId
     * @return array|null
     */
    public function getNavTreeNodeByPageId($pageId)
    {
        $navTree = $this->getNavTree();
        foreach ($navTree->getRootNodes() as $rootNode) {
            $node = $this->_getNavTreeNodeByPageId($rootNode, $pageId);
            if ($node) {
                return $node;
            }
        }
        return null;
    }

    /**
     * @return Tree
     */
    public function getNavTree()
    {
        if (!$this->_navTree) {
            $user = $this->_security->getUser();
            $objAccessibleSections = $user->objAccessibleSections();

            $data = [];

            $fullClass = UtilsService::getFullClassFromName('CmsMenuItem');
            $rootNodes = array_filter(array_map(function ($itm) use ($objAccessibleSections) {
                if (!in_array($itm->id, $objAccessibleSections)) {
                    return null;
                }

                $extraModel = null;
                if ($itm->_slug == 'pages') {
                    $extraModel = UtilsService::getModelFromName('Page', $this->_connection);
                }
                return array_merge((array)$itm->jsonSerialize(), [
                    'id' => $itm->_uniqid,
                    'parent' => null,
                    'url' => "/manage/section/{$itm->_slug}",
                    'data' => $itm,
                    'extraModel' => $extraModel,
                ]);
            }, $fullClass::active($this->_connection)));
            $data = array_merge($data, $rootNodes);

            foreach ($rootNodes as $itm) {
                switch ($itm['data']->_slug) {
                    case static::CMS_MENU_ITEM_PAGES:
                        $data = array_merge($data, $this->_getNodesForPages($itm));
                        break;
                    case static::CMS_MENU_ITEM_FILES:
                        $data = array_merge($data, $this->_getNodesForFiles($itm));
                        break;
                    case static::CMS_MENU_ITEM_ADMIN:
                        $data = array_merge($data, $this->_getNodesForAdmin($itm));
                        break;
                    default:
                        $data = array_merge($data, $this->_getNodesForCmsMenuItem($itm));
                        break;
                }
            }

            $data[] = [
                'id' => Uuid::uuid4()->toString(),
                'parent' => null,
                'url' => "/manage/profile",
                'icon' => null,
                'title' => null,
                '_status' => 0,
            ];
            $this->_navTree = new Tree($data, [
                'rootId' => null,
                'buildwarningcallback' => function () {
                },
            ]);
        }

        return $this->_navTree;
    }

    /**
     * @return array
     */
    public function getModels()
    {
        $paths = [
            __DIR__ . "/../../../../../../../src/ORM/Model/",
            __DIR__ . "/../ORM/Model/",
        ];

        $models = [];
        foreach ($paths as $path) {
            if (file_exists($path)) {
                $files = scandir($path);
                foreach ($files as $file) {
                    if (in_array($file, [
                        '.',
                        '..',
                    ])) {
                        continue;
                    }

                    $modelName = basename($file, 'Model.php');
                    $model = UtilsService::getModelFromName($modelName, $this->_connection);
                    $models[$modelName] = $model;
                }
            }
        }
        $models = array_filter(array_values($models));
        usort($models, function ($a, $b) {
            if ($a->_rank == $b->_rank) {
                return strcmp($a->title, $b->title);
            }
            return $a->_rank - $b->_rank > 0 ? 1 : 0;
        });
        return $models;
    }

    /**
     * @param $cmsMenuItem
     * @return array
     */
    public function getModelsByAccess($cmsMenuItem)
    {
        $models = $this->getModels();
        return array_filter($models, function ($itm) use ($cmsMenuItem) {
            return $itm->_status == 1 && strpos($itm->accesses, "\"{$cmsMenuItem->id}\"") !== false ? 1 : 0;
        });
    }

    /**
     * @param $model
     * @return void|null
     */
    public function getNavTreeNodeByModel($model)
    {
        $navTree = $this->getNavTree();
        foreach ($navTree->getRootNodes() as $rootNode) {
            $node = $this->_getNavTreeNodeByModel($rootNode, $model);
            if ($node) {
                return $node;
            }
        }

        return null;
    }

    /**
     * @return array|false|string
     */
    static public function getTheme()
    {
        return getenv('theme') ?: 'paper-dashboard';
    }

    /**
     * @param $parent
     * @return array
     */
    protected function _getNodesForPages($parent)
    {
        $nodes = [];

        $fullClass = UtilsService::getFullClassFromName('PageCategory');
        $pageCategories = $fullClass::active($this->_connection);
        foreach ($pageCategories as $pageCategory) {
            $node = [
                'id' => 'cat' . $pageCategory->id,
                'title' => $pageCategory->title,
                'parent' => $parent['id'],
                'url' => null,
            ];
            $nodes[] = $node;

            $pageTree = PageService::getPageTreeByCategoryId($this->_connection, $pageCategory->id, 1);
            foreach ($pageTree->getRootNodes() as $rootNode) {
                $nodes = array_merge($nodes, $this->_setPageNode($pageCategory, $rootNode));
            }
        }

        return $nodes;
    }

    /**
     * @param $parent
     * @return array
     */
    protected function _getNodesForFiles($parent)
    {
        $nodes = [];
        $model = UtilsService::getModelFromName('Asset', $this->_connection);
        $nodes[] = [
            'id' => $parent['data']->_uniqid . '_' . $model->_uniqid,
            'parent' => $parent['id'],
            'url' => "{$parent['url']}/orms/{$model->className}",
            'data' => $model,
            'title' => $model->title,
            'allowExtra' => 1,
            'maxParams' => 3,
        ];
        return $nodes;
    }

    /**
     * @param $parent
     * @return array
     */
    protected function _getNodesForAdmin($parent)
    {
        $nodes = [];
        $nodes[] = [
            'id' => Uuid::uuid4()->toString(),
            'parent' => $parent['id'],
            'url' => null,
            'data' => null,
            'title' => 'Tools',
            'allowExtra' => 0,
            'maxParams' => 0,
        ];

        $nodes[] = [
            'id' => 'page-builder',
            'parent' => $parent['id'],
            'url' => "{$parent['url']}/orms/Page",
            'data' => UtilsService::getModelFromName('Page', $this->_connection),
            'title' => 'Page builder',
            'allowExtra' => 1,
            'maxParams' => 3,
        ];

        $modelNames = ['PageCategory', 'PageTemplate'];
        foreach ($modelNames as $modelName) {
            $model = UtilsService::getModelFromName($modelName, $this->_connection);
            $nodes[] = [
                'id' => $parent['data']->_uniqid . '_page-builder_' . $model->_uniqid,
                'parent' => 'page-builder',
                'url' => "{$parent['url']}/orms/{$model->className}",
                'data' => $model,
                'title' => $model->title,
                'allowExtra' => 1,
                'maxParams' => 3,
            ];
        }

        $nodes[] = [
            'id' => 'model-builder',
            'parent' => $parent['id'],
            'url' => "{$parent['url']}/models",
            'data' => null,
            'title' => 'Model builder',
            'allowExtra' => 1,
            'maxParams' => 3,
        ];

        $modelNames = ['ContentBlock', 'ContentBlockTag', 'ContentBlockDefault'];
        foreach ($modelNames as $modelName) {
            $model = UtilsService::getModelFromName($modelName, $this->_connection);
            $nodes[] = [
                'id' => $parent['data']->_uniqid . '_model-builder_' . $model->_uniqid,
                'parent' => 'model-builder',
                'url' => "{$parent['url']}/orms/{$model->className}",
                'data' => $model,
                'title' => $model->title,
                'allowExtra' => 1,
                'maxParams' => 3,
            ];
        }

        $modelNames = ['ImageSize', 'FormBuilder'];
        foreach ($modelNames as $modelName) {
            $model = UtilsService::getModelFromName($modelName, $this->_connection);
            $nodes[] = [
                'id' => $parent['data']->_uniqid . '_' . $model->_uniqid,
                'parent' => $parent['id'],
                'url' => "{$parent['url']}/orms/{$model->className}",
                'data' => $model,
                'title' => $model->title,
                'allowExtra' => 1,
                'maxParams' => 3,
            ];
        }

        $nodes = array_merge($nodes, $this->_getNodesForCmsMenuItem($parent));
        return $nodes;
    }

    /**
     * @param $parent
     * @return array
     */
    protected function _getNodesForCmsMenuItem($parent)
    {
        $models = $this->getModelsByAccess($parent['data']);

        $nodes = [];

        if ($parent['data']->loadFromConfig) {
            $json = json_decode($parent['data']->config ?: '[]');
            foreach ($json as $idx => $itm) {
                $nodes = array_merge($nodes, $this->_getConfigNodes($idx, $itm, $parent['id'], $parent['url']));
            }
        }

        if (count($models) > 0) {
            $nodes[] = [
                'id' => Uuid::uuid4()->toString(),
                'parent' => $parent['id'],
                'url' => null,
                'data' => null,
                'title' => 'Data',
                'allowExtra' => 0,
                'maxParams' => 0,
            ];

            $nodes = array_merge($nodes, array_map(function ($model) use ($parent) {
                return array_merge((array)$model->jsonSerialize(), [
                    'id' => $parent['data']->_uniqid . '_' . $model->_uniqid,
                    'parent' => $parent['id'],
                    'url' => "{$parent['url']}/orms/{$model->className}",
                    'data' => $model,
                    'allowExtra' => 1,
                    'maxParams' => 3,
                ]);
            }, $models));
        }

        return $nodes;
    }

    /**
     * @param $title
     * @param $configNode
     * @param $parentId
     * @param $baseUrl
     * @return array
     */
    protected function _getConfigNodes($title, $configNode, $parentId, $baseUrl)
    {
        $slugify = new Slugify(['trim' => false]);

        $configNodes = [];
        $id = $parentId . '_' . $slugify->slugify($title);
        if (isset($configNode->model) && $configNode->model) {
            $model = UtilsService::getModelFromName($configNode->model, $this->_connection);
            if ($model) {
                $configNodes[] = [
                    'id' => $id,
                    'parent' => $parentId,
                    'url' => "{$baseUrl}/orms/{$model->className}",
                    'title' => $title,
                    'data' => $model,
                    'allowExtra' => 1,
                    'maxParams' => 3,
                ];
            }

        } else {
            $configNodes[] = [
                'id' => $id,
                'parent' => $parentId,
                'title' => $title,
                'url' => null,
            ];
        }

        if (isset($configNode->children)) {
            foreach ($configNode->children as $idx => $child) {
                $configNodes = array_merge($configNodes, $this->_getConfigNodes($idx, $child, $id, $baseUrl));
            }
        }

        return $configNodes;
    }

    /**
     * @param $pageCategory
     * @param $node
     * @param null $parentArrayNode
     * @return array
     */
    protected function _setPageNode($pageCategory, $node, $parentArrayNode = null)
    {
        $nodes = [];

        $arrayNode = $node->toArray();
        if ($arrayNode['data']->hideFromCmsNav == 1) {
            return $nodes;
        }

        $oldId = $arrayNode['id'];
        if ($parentArrayNode) {
            $arrayNode['id'] = $parentArrayNode['id'] . '_' . $arrayNode['id'];
            $arrayNode['parent'] = $parentArrayNode['id'];
            $arrayNode['url'] = $parentArrayNode['url'] . "/orms/Page/$oldId";
        } else {
            $arrayNode['id'] = 'cat' . $pageCategory->id . '_' . $arrayNode['id'];
            $arrayNode['parent'] = 'cat' . $pageCategory->id;
            $arrayNode['url'] = "/manage/section/pages/{$pageCategory->_slug}/orms/Page/$oldId";
        }

        $arrayNode['allowExtra'] = 1;
        $arrayNode['maxParams'] = 3;
        $nodes[] = $arrayNode;

        $attachedModelClassNames = json_decode($arrayNode['data']->attachedModels ?: '[]');
        foreach ($attachedModelClassNames as $attachedModelClassName) {
            $model = UtilsService::getModelFromName($attachedModelClassName, $this->_connection);

            $modelNode = [
                'id' => $arrayNode['id'] . '_' . $model->className,
                'title' => $model->title,
                'parent' => $arrayNode['id'],
                'url' => "{$arrayNode['url']}/orms/{$attachedModelClassName}",
                'allowExtra' => 1,
                'maxParams' => 3,
                'data' => $model,
            ];
            $nodes[] = $modelNode;
        }

        foreach ($node->getChildren() as $child) {
            $nodes = array_merge($nodes, $this->_setPageNode($pageCategory, $child, $arrayNode));
        }

        return $nodes;
    }

    /**
     * @param $node
     * @return array
     */
    protected function _getModelsFromNode($node)
    {
        $models = [];
        if (isset($node->data) && $node->data instanceof Model) {
            $models[] = $node->data;
        }

        if (isset($node->extraModel) && $node->extraModel instanceof Model) {
            $models[] = $node->extraModel;
        }

        foreach ($node->getChildren() as $child) {
            $models = array_merge($models, $this->_getModelsFromNode($child));
        }

        return $models;
    }

    /**
     * @param $node
     * @param $pageId
     * @return null
     */
    protected function _getNavTreeNodeByPageId($node, $pageId)
    {
        if (isset($node->data) && $node->data) {
            $className = UtilsService::basename(get_class($node->data));
            if ($className == 'Page' && $node->data->id == $pageId) {
                return $node;
            }
        }

        foreach ($node->getChildren() as $child) {
            $childNode = $this->_getNavTreeNodeByPageId($child, $pageId);
            if ($childNode) {
                return $childNode;
            }
        }

        return null;
    }

    /**
     * @param $node
     * @param $model
     * @return null
     */
    protected function _getNavTreeNodeByModel($node, $model)
    {
        if (isset($node->data) && $node->data instanceof Model) {
            if ($node->data->className == $model->className) {
                return $node;
            }
        }

        foreach ($node->getChildren() as $child) {
            $result = $this->_getNavTreeNodeByModel($child, $model);
            if ($result) {
                return $result;
            }
        }

        return null;
    }
}