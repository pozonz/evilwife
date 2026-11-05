import useFormStore from './store';

import { Text } from './type/text';
import { Choice } from './type/choice';
import { Checkbox } from './type/checkbox';
import { Textarea } from './type/textarea';
import { ModelFieldCollection } from './collection/modelFieldForm';
import { ComponentType } from 'react';

export const getType = (type: string) => {
    const types = { choice: Choice, checkbox: Checkbox, textarea: Textarea, model_field_form: ModelFieldCollection };
    return (types[type as keyof typeof types] || Text) as ComponentType<{ keys: Array<string> }>;
};

const keysFromName = (fieldName: string) => {
    const { schema } = useFormStore.getState();
    
    const keys = String(fieldName ?? '').split(/[.\[\]]/).filter((part) => part !== '' && part != null);
    if (schema && keys[0] === schema.name) {
        keys.shift();
    }
    return keys;
};

export const getTypeByKeys = (keys: Array<string>) => {
    let { schema, data, errors } = useFormStore();
    const rootName = schema.name || '';

    keys.forEach((key) => {
        if (schema && schema.type === 'collection' && /^\d+$/.test(String(key))) {
            schema = schema.entry;
            return;
        }
        schema = ((schema && schema.fields) || {})[key];
    });
    const last = keys[keys.length - 1];
    if (keys.some((key) => /^\d+$/.test(String(key))) && ['widget', 'label', 'field', 'constraints'].includes(last)) {
        schema = Object.assign({}, schema, { label: null });
    }

    let value = data;
    keys.forEach((key) => {
        value = value == null ? undefined : value[key];
    });

    const wanted = keys.map(String);
    errors = (errors || []).filter((item: any) => {
        const parts = keysFromName(item.path);
        return parts.length === wanted.length && parts.every((part, i) => part === wanted[i]);
    }).map((item: any) => item.message);

    const parts = [rootName, ...keys].filter((part) => part !== '' && part != null);

    return {
        schema: schema || {},
        id: parts.join('_'),
        name: parts.reduce((acc, part) => (acc ? acc + '[' + part + ']' : part), ''),
        value,
        errors,
    };
};

export const applyChange = (el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
    const { data, update, validate } = useFormStore.getState();

    const keys = keysFromName(el.name);
    if (!keys.length) {
        return;
    }

    const next = Array.isArray(data) ? [...data] : { ...(data ?? {}) };
    let object: any = next;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const child = object[key];
        const copy = child == null || typeof child !== 'object'
            ? (/^\d+$/.test(String(keys[i + 1])) ? [] : {})
            : (Array.isArray(child) ? [...child] : { ...child });
        object[key] = copy;
        object = copy;
    }

    if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        object[keys[keys.length - 1]] = el.checked;
    } else if (el instanceof HTMLInputElement && el.type === 'number') {
        object[keys[keys.length - 1]] = el.value === '' ? null : Number(el.value);
    } else if (el instanceof HTMLSelectElement && el.multiple) {
        object[keys[keys.length - 1]] = Array.from(el.selectedOptions).map((option) => option.value);
    } else {
        object[keys[keys.length - 1]] = el.value;
    }

    update({ data: next });
    validate();
};