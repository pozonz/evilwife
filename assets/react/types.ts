export type Key = string | number;

export type ChoiceOption = {
    label: string;
    value: string;
};

export type Schema = {
    name: string;
    type: string;
    label?: string | false | null;
    required?: boolean;
    multiple?: boolean;
    disabled?: boolean;
    attr?: Record<string, string | number>;
    choices?: ChoiceOption[];
    fields?: Record<string, Schema>;
    entry?: Schema;
    allow_add?: boolean;
    allow_delete?: boolean;
};

export type ModelFieldData = {
    widget?: string;
    label?: string;
    field?: string;
    constraints?: string[];
    sqlQuery?: string | null;
    showInListingTable?: boolean;
    listingWidth?: number | null;
    listingTitle?: string | null;
    queryableInCmsSearch?: boolean;
    [key: string]: unknown;
};

export type ModelData = {
    title?: string;
    className?: string;
    modelCategory?: string;
    listingType?: string;
    accesses?: string[];
    frontendUrl?: string | null;
    searchableInCms?: boolean;
    searchableInFrontend?: boolean;
    enableVersioning?: boolean;
    fields?: ModelFieldData[];
    [key: string]: unknown;
};

export type FormError = {
    path: string;
    message: string;
};

export type FieldInfo = {
    schema: Schema;
    id: string;
    name: string;
    value: unknown;
    errors: string[];
};
