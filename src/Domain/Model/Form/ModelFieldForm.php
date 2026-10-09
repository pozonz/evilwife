<?php

namespace Pozo\EvilWife\Domain\Model\Form;

use Pozo\EvilWife\Domain\Model\DTO\ModelField;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ModelFieldForm extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $widgets = array_combine(ModelField::WIDGETS, ModelField::WIDGETS);
        $constraints = array_combine(ModelField::CONSTRAINTS, ModelField::CONSTRAINTS);

        $builder
            ->add('widget', ChoiceType::class, [
                'label' => 'Widget',
                'choices' => $widgets,
                'attr' => ['class' => 'form-select widget-select'],
            ])
            ->add('label', TextType::class, [
                'label' => 'Label',
                'empty_data' => '',
                'attr' => ['class' => 'form-control field-label-input'],
            ])
            ->add('field', TextType::class, [
                'label' => 'Field',
                'empty_data' => '',
                'attr' => ['class' => 'form-control field-name-input'],
            ])
            ->add('constraints', ChoiceType::class, [
                'label' => 'Constraints',
                'choices' => $constraints,
                'multiple' => true,
                'required' => false,
                'attr' => [
                    'class' => 'form-select constraints-select',
                    'data-placeholder' => 'Select constraints...',
                ],
            ])
            ->add('sqlQuery', TextareaType::class, [
                'label' => false,
                'required' => false,
                'attr' => [
                    'class' => 'form-control field-choice-source',
                    'rows' => 3,
                ],
            ])
            ->add('showInListingTable', CheckboxType::class, [
                'label' => 'Show in listing table',
                'required' => false,
            ])
            ->add('listingWidth', IntegerType::class, [
                'label' => 'Table column width (px)',
                'required' => false,
                'attr' => ['class' => 'form-control'],
            ])
            ->add('listingTitle', TextType::class, [
                'label' => 'Table column title (optional)',
                'required' => false,
                'attr' => ['class' => 'form-control'],
            ])
            ->add('queryableInCmsSearch', CheckboxType::class, [
                'label' => 'Queryable in CMS search',
                'required' => false,
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => ModelField::class,
            'validation_groups' => false,
        ]);
    }
}
