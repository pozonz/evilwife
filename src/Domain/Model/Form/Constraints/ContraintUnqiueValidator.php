<?php

namespace Pozo\EvilWife\Domain\Model\Form\Constraints;

use Pozo\EvilWife\Domain\Service\ModelService;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Pozo\EvilWife\Domain\Model\Dto\Model;
use Pozo\EvilWife\Domain\Repository\Dao;

class ContraintUnqiueValidator extends ConstraintValidator
{
    public function validate(mixed $value, Constraint $constraint): void
    {
        if ($value === null || $value === '') {
            return;
        }

        $object = $this->context->getObject();
        if ($object instanceof Model) {
            $this->validateModel($value, $constraint);
        } elseif ($object instanceof Dao) {
            $this->validateDAO($value, $constraint);
        }
    }

    public function validateModel(mixed $value, Constraint $constraint): void
    {
        $property = (string) $this->context->getPropertyName();
        foreach (ModelService::service()->getModels() as $model) {

            if ((string) $model->{$property} === (string) $value && (string) $model->id !== (string) $this->context->getObject()->id) {
                $this->context->buildViolation($constraint->message)->addViolation();
            }
        }
    }

    public function validateDAO(mixed $value, Constraint $constraint): void
    {
        $property = (string) $this->context->getPropertyName();
        $object = $this->context->getObject();
        $class = $object::class;
        $dao = $class::data($object->_connection, [
            'whereSql' => "m.{$property} = ? AND m.id != ?",
            'params' => [$value, $object->id],
            'limit' => 1,
            'oneOrNull' => 1,
        ]);
        if ($dao) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
