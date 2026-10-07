<?php

namespace Pozo\EvilWife\Core\Model\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class Model
{
    #[Assert\NotBlank(message: 'Title is required.')]
    public string $title;

    #[Assert\NotBlank(message: 'Class name is required.')]
    #[Assert\Regex(
        pattern: '/^[A-Z][A-Za-z0-9]*$/',
        message: 'Class name must be PascalCase, e.g. NewsArticle.',
    )]
    public string $className;

    #[Assert\NotBlank]
    #[Assert\Choice(choices: ['Customised', 'Core', 'System'])]
    public string $modelCategory = 'Customised';

    #[Assert\NotBlank]
    #[Assert\Choice(choices: ['Drag & Drop', 'Table', 'Tree'])]
    public string $listingType = 'Drag & Drop';

    /** @var list<string> */
    public array $accesses = [];

    public ?string $frontendUrl = null;

    public bool $searchableInCms = false;

    public bool $searchableInFrontend = false;

    public bool $enableVersioning = false;

    /** @var list<ModelField> */
    #[Assert\Valid]
    public array $fields = [];
}
