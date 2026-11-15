<?php

namespace Pozo\EvilWife\Domain\Service;

use Pozo\EvilWife\Domain\Model\DTO\Model;
use Pozo\EvilWife\Domain\Model\DTO\ModelField;
use Symfony\Component\PropertyInfo\Extractor\PhpDocExtractor;
use Symfony\Component\PropertyInfo\Extractor\ReflectionExtractor;
use Symfony\Component\PropertyInfo\PropertyInfoExtractor;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Normalizer\ArrayDenormalizer;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\SerializerInterface;

class ModelService
{
    private static ?self $instance = null;

    public function __construct(
        private readonly SerializerInterface $serializer,
    ) {
        self::$instance = $this;
    }

    public static function service(): self
    {
        return self::$instance ??= new self(self::serializer());
    }

    public function modelFromClass(string $className): ?Model
    {
        $path = $this->daoDir($className) . '/Generated/' . $className . '.json';
        if (!is_file($path)) {
            return null;
        }

        $json = file_get_contents($path);
        if ($json === false || $json === '') {
            return null;
        }

        return $this->serializer->deserialize($json, Model::class, 'json');
    }

    public function writeDao(Model $model, array $data): void
    {
        $className = $model->className;
        if (!preg_match('/^[A-Z][A-Za-z0-9]*$/', $className)) {
            return;
        }

        $base = $this->daoDir($className);
        $generated = $base . '/Generated';
        if (!is_dir($generated)) {
            mkdir($generated, 0775, true);
        }

        $classFile = $base . '/' . $className . '.php';
        if (!is_file($classFile)) {
            file_put_contents($classFile, $this->classSource($className));
        }

        file_put_contents($generated . '/' . $className . 'ORM.php', $this->ormSource($model));
        file_put_contents(
            $generated . '/' . $className . '.json',
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n"
        );
    }

    /**
     * @return array<string, string>
     */
    public function ormColumns(string $className): array
    {
        $class = 'Pozo\\EvilWife\\Domain\\Data\\DAO\\' . $className . '\\Generated\\' . $className . 'ORM';
        $reflection = new \ReflectionClass($class);
        $properties = [];
        do {
            $properties = array_merge($reflection->getProperties(), $properties);
            $reflection = $reflection->getParentClass();
        } while ($reflection);

        $columns = [];
        foreach ($properties as $property) {
            $comment = $property->getDocComment();
            if (!is_string($comment) || !preg_match('/#pz(\ )+(.*)/', $comment, $matches)) {
                continue;
            }
            $columns[$property->getName()] = $matches[2];
        }

        return $columns;
    }

    private function daoDir(string $className): string
    {
        return dirname(__DIR__) . '/Data/DAO/' . $className;
    }

    private static function serializer(): SerializerInterface
    {
        $types = new PropertyInfoExtractor([], [new PhpDocExtractor(), new ReflectionExtractor()]);

        return new Serializer(
            [new ArrayDenormalizer(), new ObjectNormalizer(null, null, null, $types)],
            [new JsonEncoder()]
        );
    }

    private function classSource(string $className): string
    {
        return <<<PHP
<?php

namespace Pozo\\EvilWife\\Domain\\Data\\DAO\\{$className};

use Pozo\\EvilWife\\Domain\\Data\\DAO\\{$className}\\Generated\\{$className}ORM;

class {$className} extends {$className}ORM
{
}

PHP;
    }

    private function ormSource(Model $model): string
    {
        $className = $model->className;
        $properties = '';
        $seen = [];
        foreach ($model->fields as $field) {
            if (!$field instanceof ModelField) {
                continue;
            }
            $name = $field->field;
            if (!preg_match('/^[a-z][A-Za-z0-9]*$/', $name) || isset($seen[$name])) {
                continue;
            }
            $seen[$name] = true;
            $properties .= <<<PHP

    /**
     * #pz text COLLATE utf8mb4_unicode_ci DEFAULT NULL
     */
    public \${$name};

PHP;
        }

        return <<<PHP
<?php

namespace Pozo\\EvilWife\\Domain\\Data\\DAO\\{$className}\\Generated;

use Pozo\\EvilWife\\Domain\\Repository\\DAO;

class {$className}ORM extends DAO
{{$properties}
}

PHP;
    }
}
