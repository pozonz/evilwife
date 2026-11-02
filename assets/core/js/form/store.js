export const data = {
    container: null,
    schema: null,
    data: null,
};

export const escapeHtml = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

export const getSchemaByKeys = (keys) => {
    let schema = data.schema;
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

export const getFieldIdByKeys = (keys) => {
};

export const getFieldNamebyKeys = (keys) => {
};

export const getKeysByFieldName = (fieldName) => {
    const keys = parts(fieldName);
    if (data.schema && keys[0] === data.schema.name) {
        keys.shift();
    }
    return keys;
};

export const setValue = (keys, value) => {
    let cur = data.data;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (cur[key] == null || typeof cur[key] !== 'object') {
            cur[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
        }
        cur = cur[key];
    }
    cur[keys[keys.length - 1]] = value;
};

const getValueByKeys = (keys) => {
    let value = data.data;
    keys.forEach((key) => {
        value = value == null ? undefined : value[key];
    });
    return value;
};

const getValueByEl = (el) => {
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

export const apply = (el) => {
    if (!el || !data.container.contains(el)) {
        return;
    }
    const keys = getKeysByFieldName(el.name);
    if (keys.length) {
        setValue(keys, read(el));
        validate();
    }
};
