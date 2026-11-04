import type { FieldInfo, FormError, Key, ModelData, Schema } from '../types';

export const keysFromName = (fieldName: string, schemaName?: string): Key[] => {
    const keys = String(fieldName ?? '').split(/[.\[\]]/).filter((part) => part !== '' && part != null);
    if (schemaName && keys[0] === schemaName) {
        keys.shift();
    }
    return keys;
};

export const getValueByKeys = (object: unknown, keys: Key[]): unknown => {
    let value: unknown = object;
    keys.forEach((key) => {
        if (value == null || typeof value !== 'object') {
            value = undefined;
            return;
        }
        value = (value as Record<string, unknown>)[key];
    });
    return value;
};

export const setValueByKeys = (object: unknown, keys: Key[], value: unknown): unknown => {
    if (!keys.length) {
        return value;
    }

    const [head, ...rest] = keys;
    const source = object && typeof object === 'object' ? object : (/^\d+$/.test(String(head)) ? [] : {});
    const next = Array.isArray(source) ? [...source] : { ...source as Record<string, unknown> };

    (next as Record<string, unknown>)[head] = rest.length
        ? setValueByKeys((source as Record<string, unknown>)[head], rest, value)
        : value;

    return next;
};

export const getTypeByKeys = (schema: Schema, data: ModelData, errors: FormError[], keys: Key[]): FieldInfo => {
    let field: Schema | undefined = schema;
    keys.forEach((key) => {
        if (field && field.type === 'collection' && /^\d+$/.test(String(key))) {
            field = field.entry;
            return;
        }
        field = (field && field.fields || {})[key];
    });

    const last = keys[keys.length - 1];
    if (keys.some((key) => /^\d+$/.test(String(key))) && ['widget', 'label', 'field', 'constraints'].includes(String(last))) {
        field = Object.assign({}, field, { label: null });
    }

    const wanted = keys.map(String);
    const messages = errors.filter((item) => {
        const parts = keysFromName(item.path, schema.name).map(String);
        return parts.length === wanted.length && parts.every((part, i) => part === wanted[i]);
    }).map((item) => item.message);

    const parts = [schema.name, ...keys].filter((part) => part !== '' && part != null);

    return {
        schema: field || { name: '', type: 'text' },
        id: parts.join('_'),
        name: parts.reduce((acc: string, part) => (acc ? acc + '[' + part + ']' : String(part)), ''),
        value: getValueByKeys(data, keys),
        errors: messages,
    };
};
