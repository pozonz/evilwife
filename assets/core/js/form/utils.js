import { store } from './store';

export const escapeHtml = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

export const getSchemaByKeys = (keys) => {
    return getValueByKeys(store.schema, keys);
};

export const getFieldIdByKeys = (keys) =>
    [store.schema.name, ...keys].filter((part) => part !== '' && part != null).join('_');

export const getFieldNamebyKeys = (keys) =>
    [store.schema.name, ...keys]
        .filter((part) => part !== '' && part != null)
        .reduce((acc, part) => (acc ? acc + '[' + part + ']' : part), '');

export const getKeysByFieldName = (fieldName) => {
    const keys = String(fieldName ?? '').split(/[.\[\]]/).filter((part) => part !== '' && part != null);
    if (store.schema && keys[0] === store.schema.name) {
        keys.shift();
    }
    return keys;
};

export const setValueByKeys = (object, keys, value) => {
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (object[key] == null || typeof object[key] !== 'object') {
            object[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
        }
        object = object[key];
    }
    object[keys[keys.length - 1]] = value;
};

export const getValueByKeys = (object, keys) => {
    let value = object;
    keys.forEach((key) => {
        value = value == null ? undefined : value[key];
    });
    return value;
};

export const getValueByEl = (el) => {
    if (el.type === 'checkbox') {
        return el.checked;
    }
    if (el.type === 'number') {
        return el.value === '' ? null : Number(el.value);
    }
    if (el.multiple) {
        return Array.from(el.selectedOptions).map((option) => option.value);
    }
    return el.value;
};