import { store } from './store';

export const escapeHtml = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

const keysFromName = (fieldName) => {
    const keys = String(fieldName ?? '').split(/[.\[\]]/).filter((part) => part !== '' && part != null);
    if (store.schema && keys[0] === store.schema.name) {
        keys.shift();
    }
    return keys;
};

export const getTypeByKeys = (keys) => {
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
        schema = Object.assign({}, schema, { label: null });
    }

    let value = store.data;
    keys.forEach((key) => {
        value = value == null ? undefined : value[key];
    });

    const wanted = keys.map(String);
    const errors = (store.errors || []).filter((item) => {
        const parts = keysFromName(item.path);
        return parts.length === wanted.length && parts.every((part, i) => part === wanted[i]);
    }).map((item) => item.message);

    const parts = [store.schema.name, ...keys].filter((part) => part !== '' && part != null);

    return {
        schema: schema || {},
        id: parts.join('_'),
        name: parts.reduce((acc, part) => (acc ? acc + '[' + part + ']' : part), ''),
        value,
        errors,
    };
};

const error = (keys) => {
    const { id, errors } = getTypeByKeys(keys);
    const field = document.getElementById(id);
    const box = document.getElementById(id + '-error');
    if (!field || !box) {
        return;
    }

    box.innerHTML = errors.map((message) =>
        `<div class="invalid-feedback d-block">${escapeHtml(message)}</div>`
    ).join('');
    box.classList.toggle('d-none', errors.length === 0);
    box.classList.toggle('d-block', errors.length > 0);
    field.classList.toggle('is-invalid', errors.length > 0);
};

const applyChange = (el, callback = () => {}) => {
    if (!el || !store.container.contains(el)) {
        return;
    }

    const keys = keysFromName(el.name);
    if (!keys.length) {
        return;
    }

    let object = store.data;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (object[key] == null || typeof object[key] !== 'object') {
            object[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
        }
        object = object[key];
    }

    if (el.type === 'checkbox') {
        object[keys[keys.length - 1]] = el.checked;
    } else if (el.type === 'number') {
        object[keys[keys.length - 1]] = el.value === '' ? null : Number(el.value);
    } else if (el.multiple) {
        object[keys[keys.length - 1]] = Array.from(el.selectedOptions).map((option) => option.value);
    } else {
        object[keys[keys.length - 1]] = el.value;
    }

    store.validate(callback);
};

export const bind = (keys) => {
    const { id } = getTypeByKeys(keys);

    error(keys);

    $(document).off('change input', `#${id}`).on('change input', `#${id}`, (ev) => applyChange(ev.target, () => error(keys)));
};
