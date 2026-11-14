<?php

namespace Pozo\EvilWife\Domain\Model\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class DAOForm extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        foreach ($options['fields'] as $field) {
            if (!is_array($field) || !isset($field['field']) || !preg_match('/^[a-z][A-Za-z0-9]*$/', (string) $field['field'])) {
                continue;
            }

            $widget = (string) ($field['widget'] ?? 'Text');
            $builder->add((string) $field['field'], $this->fieldType($widget), $this->fieldOptions($field, $widget));
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
        if ($widget === 'Checkbox') {
            return CheckboxType::class;
        }
        if (in_array($widget, ['Textarea', 'Wysiwyg'], true)) {
            return TextareaType::class;
        }
        if (str_starts_with($widget, 'Choice')) {
            return ChoiceType::class;
        }

        return TextType::class;
    }

    /**
     * @param array<string, mixed> $field
     * @return array<string, mixed>
     */
    private function fieldOptions(array $field, string $widget): array
    {
        $constraints = is_array($field['constraints'] ?? null) ? $field['constraints'] : [];
        $required = in_array('Required', $constraints, true);
        $label = (string) ($field['label'] ?? '');

        if ($widget === 'Checkbox') {
            return [
                'label' => $label,
                'required' => false,
            ];
        }

        if (str_starts_with($widget, 'Choice')) {
            $multiple = str_contains($widget, 'multi');
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
