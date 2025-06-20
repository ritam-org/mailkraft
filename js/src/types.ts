export type TemplateVariable = {
    type: 'string' | 'number' | 'boolean';
    description?: string;
    required?: boolean;
    default?: string | number | boolean;
    example?: string | number;
    group?: string;
    options?: (string | number)[];
    hidden?: boolean;
};

export type ThemeData = {
    [key: string]: any;
};

export type RETMeta = {
    name: string;
    description?: string;
    tags?: string[];
    locale?: string;
    variables: Record<string, TemplateVariable>;
    theme?: ThemeData;
};

export type ParsedRET = {
    meta: RETMeta;
    html: string;
    text: string;
};

