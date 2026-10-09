<?php

namespace Pozo\EvilWife\Domain\Model\Form;

use Pozo\EvilWife\Domain\Model\DTO\Model;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ModelForm extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('title', TextType::class, [
                'label' => 'Title',
                'empty_data' => '',
                'attr' => ['class' => 'form-control'],
            ])
            ->add('className', TextType::class, [
                'label' => 'Class name',
                'empty_data' => '',
                'attr' => ['class' => 'form-control'],
            ])
            ->add('modelCategory', ChoiceType::class, [
                'label' => 'Model category',
                'choices' => [
                    'Customised' => 'Customised',
                    'Core' => 'Core',
                    'System' => 'System',
                ],
                'attr' => ['class' => 'form-select'],
            ])
            ->add('listingType', ChoiceType::class, [
                'label' => 'Listing type',
                'choices' => [
                    'Drag & Drop' => 'Drag & Drop',
                    'Table' => 'Table',
                    'Tree' => 'Tree',
                ],
                'attr' => ['class' => 'form-select'],
            ])
            ->add('accesses', ChoiceType::class, [
                'label' => 'Accesses',
                'choices' => [
                    'Adoption' => 'adoption',
                    'Pages' => 'pages',
                    'Snippets' => 'snippets',
                    'Utilities' => 'utilities',
                    'Modules' => 'modules',
                    'Assets' => 'assets',
                    'Admin' => 'admin',
                ],
                'multiple' => true,
                'required' => false,
                'attr' => [
                    'class' => 'form-select',
                    'data-placeholder' => 'Select accesses...',
                ],
            ])
            ->add('frontendUrl', TextType::class, [
                'label' => 'Frontend URL',
                'required' => false,
                'attr' => ['class' => 'form-control'],
            ])
            ->add('searchableInCms', CheckboxType::class, [
                'label' => 'Data is searchable in CMS',
                'required' => false,
            ])
            ->add('enableVersioning', CheckboxType::class, [
                'label' => 'Enable versioning',
                'required' => false,
            ])
            ->add('searchableInFrontend', CheckboxType::class, [
                'label' => 'Data is searchable in Frontend',
                'required' => false,
            ])
            ->add('fields', CollectionType::class, [
                'entry_type' => ModelFieldForm::class,
                'entry_options' => ['label' => false],
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
                'prototype' => true,
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Model::class,
            'validation_groups' => false,
        ]);
    }
}
