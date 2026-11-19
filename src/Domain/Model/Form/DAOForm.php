<?php

namespace Pozo\EvilWife\Domain\Model\Form;

use Pozo\EvilWife\Domain\Model\Dto\ModelField;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class DAOForm extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        foreach ($options['fields'] as $field) {
            if (!$field instanceof ModelField || !preg_match('/^[a-z][A-Za-z0-9]*$/', $field->field)) {
                continue;
            }

            $widget = (string) ($field->widget ?? 'Text');
            $builder->add($field->field, $this->fieldType($widget), $this->fieldOptions($field, $widget));
        }
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'fields' => [],
            'validation_groups' => false,
        ]);
        $resolver->setAllowedTypes('fields', 'array');
    }

    private function fieldType(string $widget): string
    {
        return match ($widget) {
            'Content blocks' => CollectionType::class,
            'Asset files picker', 'Asset picker', 'Text' => TextType::class,
            'Checkbox' => CheckboxType::class,
            'Choice', 'Choice multi', 'Choice sortable', 'Choice tree', 'Choice tree multi' => ChoiceType::class,
            'Date & time picker' => DateTimeType::class,
            'Date picker' => DateType::class,
            'Email' => EmailType::class,
            'Hidden' => HiddenType::class,
            'Password' => PasswordType::class,
            'Textarea', 'Wysiwyg' => TextareaType::class,
            default => TextType::class,
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function fieldOptions(ModelField $field, string $widget): array
    {
        $required = in_array('Required', $field->constraints, true);
        $label = $field->label;

        if ($widget === 'Checkbox') {
            return [
                'label' => $label,
                'required' => false,
            ];
        }

        if ($widget === 'Hidden') {
            return [
                'label' => false,
                'required' => false,
                'empty_data' => '',
            ];
        }

        if (in_array($widget, ['Asset files picker', 'Content blocks', 'Multiple key value pair'], true)) {
            return [
                'label' => $label,
                'required' => false,
                'allow_add' => true,
                'allow_delete' => true,
                'entry_type' => TextType::class,
                'entry_options' => [
                    'label' => false,
                    'required' => false,
                    'empty_data' => '',
                ],
            ];
        }

        if ($widget === 'Date picker' || $widget === 'Date & time picker') {
            return [
                'label' => $label,
                'required' => $required,
                'widget' => 'single_text',
                'html5' => true,
                'input' => 'string',
                'empty_data' => '',
                'attr' => ['class' => 'form-control'],
            ];
        }

        if (str_starts_with($widget, 'Choice')) {
            $multiple = str_contains($widget, 'multi') || $widget === 'Choice sortable';
            $options = [
                'label' => $label,
                'required' => $required && !$multiple,
                'multiple' => $multiple,
                'choices' => [],
                'attr' => ['class' => 'form-select'],
            ];
            if (!$multiple) {
                $options['placeholder'] = '';
            }

            return $options;
        }

        if (in_array($widget, ['Textarea', 'Wysiwyg'], true)) {
            return [
                'label' => $label,
                'required' => $required,
                'empty_data' => '',
                'attr' => ['class' => 'form-control', 'rows' => 3],
            ];
        }

        return [
            'label' => $label,
            'required' => $required,
            'empty_data' => '',
            'attr' => ['class' => 'form-control'],
        ];
    }
}
