<?php

namespace Pozo\EvilWife\Domain\Model\Form\Constraints;

use Pozo\EvilWife\Domain\Model\DTO\Model;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;

class ContraintUnqiueValidator extends ConstraintValidator
{
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof ContraintUnqiue) {
            throw new UnexpectedTypeException($constraint, ContraintUnqiue::class);
        }
        if ($value === null || $value === '') {
            return;
        }

        $model = $this->context->getObject();
        if (!$model instanceof Model) {
            return;
        }

        $property = (string) $this->context->getPropertyName();
        $root = dirname(__DIR__, 3).'/Data/DAO';
        foreach (glob($root.'/*/Generated/*.json') ?: [] as $path) {
            $data = json_decode((string) file_get_contents($path), true);
            if (!is_array($data)) {
                continue;
            }

            $className = (string) ($data['className'] ?? basename(dirname($path, 2)));
            if ($className === $model->className) {
                continue;
            }

            $stored = $property === 'className' ? $className : (string) ($data[$property] ?? '');
            if ($stored !== '' && $stored === (string) $value) {
                $this->context->buildViolation($constraint->message)->addViolation();

                return;
            }
        }
    }
}
