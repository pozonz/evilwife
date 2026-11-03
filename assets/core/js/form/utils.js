import { store } from './store';

export const escapeHtml = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');


export const getByKeys = (keys) => {
    const getSchemaByKeys = (keys) => {
        let schema = store.schema;
        keys.forEach((key) => {
            if (schema && schema.type === 'collection' && /^\d+$/.test(String(key))) {
                schema = schema.entry;
                return;
            }
            schema = ((schema && schema.fields) || {})[key];
        });
        const last = keys[keys.length - 1];
        if (keys.some((key) => /^\d+$/.test(String(key))) && ['widget', 'label', 'field', 'constraints'].includes(last)) {
            return Object.assign({}, schema, { label: null });
        }
        return schema || {};
    };
    
    const getIdByKeys = (keys) =>
        [store.schema.name, ...keys].filter((part) => part !== '' && part != null).join('_');
    
    const getNamebyKeys = (keys) =>
        [store.schema.name, ...keys]
            .filter((part) => part !== '' && part != null)
            .reduce((acc, part) => (acc ? acc + '[' + part + ']' : part), '');
    
    const getValueByKeys = (keys) => {
        let value = store.data;
        keys.forEach((key) => {
            value = value == null ? undefined : value[key];
        });
        return value;
    };
    
    const getErrorsByKeys = (keys) => {
    };

    return {
        schema: getSchemaByKeys(keys),
        id: getIdByKeys(keys),
        name: getNamebyKeys(keys),
        value: getValueByKeys(keys),
        errors: getErrorsByKeys(keys),
    };
};

export const getKeysByFieldName = (fieldName) => {
    const keys = String(fieldName ?? '').split(/[.\[\]]/).filter((part) => part !== '' && part != null);
    if (store.schema && keys[0] === store.schema.name) {
        keys.shift();
    }
    return keys;
};

/**
 * Set the value of an object by keys
 * @param {*} object 
 * @param {*} keys 
 * @param {*} value 
 * @returns {void}
 */
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

/**
 * Get the value of an element
 * @param {*} el 
 * @returns {any}
 */
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
