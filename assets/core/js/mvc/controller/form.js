import { render } from '../view/form/render';
import { render as errors } from '../view/form/types/error';

function keysFromName(name, root) {
    const keys = [];
    const base = name.split('[', 1)[0];
    if (base && base !== root) {
        keys.push(base);
    }
    const re = /\[([^\]]*)\]/g;
    let match;
    while ((match = re.exec(name))) {
        if (match[1] !== '') {
            keys.push(match[1]);
        }
    }
    return keys;
}

function set(model, keys, value, container, root) {
    let cur = model;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (cur[key] == null || typeof cur[key] !== 'object') {
            cur[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
        }
        cur = cur[key];
    }
    cur[keys[keys.length - 1]] = value;

    $.ajax({
        url: '/manage/model/validate',
        type: 'POST',
        data: JSON.stringify(model),
        contentType: 'application/json',
        success: function (xhr) {
            errors(container, xhr.errors, root);
        },
    });
}

function read(el) {
    if (el.type === 'checkbox') {
        return el.checked;
    }
    if (el.type === 'number') {
        return el.value === '' ? null : Number(el.value);
    }
    if (el.multiple) {
        return Array.from(el.selectedOptions).map(function (option) {
            return option.value;
        });
    }
    return el.value;
}

export function mount(container, schema, data) {

    render(container, schema, data);

    function apply(event) {
        const el = event.target.closest('[name]');

        if (!el || !container.contains(el)) {
            return;
        }

        const keys = keysFromName(el.name, schema.name);
        if (keys.length) {
            set(data, keys, read(el), container, schema.name);
        }
    }

    container.addEventListener('input', apply);
    container.addEventListener('change', apply);

    return data;
}
