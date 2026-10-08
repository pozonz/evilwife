<?php

namespace Pozo\EvilWife\Data\Core\Model\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class ModelField
{
    public const WIDGETS = [
        'Asset files picker',
        'Asset picker',
        'Checkbox',
        'Choice',
        'Choice multi',
        'Choice sortable',
        'Choice tree',
        'Choice tree multi',
        'Content blocks',
        'Date & time picker',
        'Date picker',
        'Email',
        'Hidden',
        'Multiple key value pair',
        'Password',
        'Text',
        'Textarea',
        'Wysiwyg',
    ];

    public const CONSTRAINTS = [
        'Required',
        'Unique',
    ];

    #[Assert\NotBlank]
    #[Assert\Choice(choices: self::WIDGETS)]
    public string $widget = 'Text';

    #[Assert\NotBlank(message: 'Label is required.')]
    public string $label = '';

    #[Assert\NotBlank(message: 'Field name is required.')]
    #[Assert\Regex(
        pattern: '/^[a-z][A-Za-z0-9]*$/',
        message: 'Field name must be camelCase, e.g. authorName.',
    )]
    public string $field = '';

    /** @var list<string> */
    #[Assert\All([new Assert\Choice(choices: self::CONSTRAINTS)])]
    public array $constraints = [];

    #[Assert\When(
        expression: 'this.widget matches "/^Choice/"',
        constraints: [new Assert\NotBlank(message: 'Choice widgets need a source query.')],
    )]
    public ?string $sqlQuery = null;

    public bool $showInListingTable = false;

    #[Assert\PositiveOrZero]
    public ?int $listingWidth = null;

    public ?string $listingTitle = null;

    public bool $queryableInCmsSearch = false;
}
