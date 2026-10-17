import 'jquery-ui/dist/jquery-ui';
import 'jquery-ui/dist/themes/base/jquery-ui.css';
import 'chosen-js';
import 'chosen-js/chosen.css';

import { render } from './view';
import { render as errors } from './render/error';
import { fieldId, keysFromName } from './data';

const read = (el) => {
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

const set = (data, keys, value) => {
    let cur = data;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (cur[key] == null || typeof cur[key] !== 'object') {
            cur[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
        }
        cur = cur[key];
    }
    cur[keys[keys.length - 1]] = value;
};

const apply = (el, container, schema, data) => {
    if (!el || !container.contains(el)) {
        return;
    }
    const keys = keysFromName(el.name || '', schema.name);
    if (keys.length) {
        set(data, keys, read(el));
        validate(container, schema, data);
    }
};

const validate = (container, schema, data) => {
    fetch('/manage/model/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
        .then((res) => res.json())
        .then((response) => {
            errors(container, response.errors, schema.name);
        });
};

const enhance = (container, schema, data) => {
    const table = container.querySelector('.field-table');
    if (table) {
        $(table).sortable({
            items: '.field-item',
            placeholder: 'field-item-placeholder',
            forcePlaceholderSize: true,
        });
    }

    container.querySelectorAll('select[multiple]').forEach((select) => {
        $(select)
            .chosen({
                width: '100%',
                placeholder_text_multiple: select.getAttribute('data-placeholder') || 'Select...',
            })
            .on('change', () => {
                apply(select, container, schema, data);
            });
    });

    container.querySelectorAll('select[name*="[widget]"]').forEach((select) => {
        const item = select.closest('.field-item');
        if (!item) {
            return;
        }
        select.addEventListener('change', () => {
            item.classList.toggle('is-choice', String(select.value).indexOf('Choice') === 0);
        });
    });
};

const rowPrefix = (item) => {
    const named = item.querySelector('[name*="[widget]"], [name*="[label]"], [name*="[field]"]');
    return named ? named.name.replace(/\[[^\]]+\]$/, '') : '';
};

const setModal = (container, schema, data) => {
    const settings = ['showInListingTable', 'listingWidth', 'listingTitle', 'queryableInCmsSearch'];
    const modal = document.getElementById('field-settings-modal');
    if (!modal) {
        return;
    }

    container.appendChild(modal);

    modal.addEventListener('show.bs.modal', (ev) => {
        const item = ev.relatedTarget && ev.relatedTarget.closest('.field-item');
        if (!item) {
            return;
        }

        const prefix = rowPrefix(item);
        const index = Number((prefix.match(/\[(\d+)\]$/) || [])[1]);
        const row = (data.fields && data.fields[index]) || {};
        const label = item.querySelector('[name*="[label]"]');
        const field = item.querySelector('[name*="[field]"]');

        modal.querySelector('.modal-title').textContent = (label && label.value) || 'Field';
        modal.querySelector('.field-key').textContent = (field && field.value) || '';

        settings.forEach((name) => {
            const el = modal.querySelector('[data-setting="' + name + '"]');
            if (!el) {
                return;
            }
            const id = fieldId(prefix + '[' + name + ']');
            el.name = prefix + '[' + name + ']';
            el.id = id;
            const wrap = el.closest('.form-check, .mb-3');
            const labelEl = wrap && wrap.querySelector('label');
            if (labelEl) {
                labelEl.htmlFor = id;
            }
            if (el.type === 'checkbox') {
                el.checked = !!row[name];
            } else {
                el.value = row[name] ?? '';
            }
        });

        validate(container, schema, data);
    });
};

const mount = (container, schema, data) => {
    render(container, schema, data);
    setModal(container, schema, data);
    container.addEventListener('input', ev => apply(ev.target.closest('[name]'), container, schema, data));
    container.addEventListener('change', ev => apply(ev.target.closest('[name]'), container, schema, data));
    enhance(container, schema, data);
};

export const load = (container) => {
    if (!container) {
        return;
    }

    fetch(container.getAttribute('data-schema-url'))
        .then((res) => {
            if (!res.ok) {
                throw new Error();
            }
            return res.json();
        })
        .then((response) => {
            mount(container, response.schema, response.data);
        })
        .catch(() => {
            container.innerHTML = '<div class="alert alert-danger mb-0">Could not load form schema.</div>';
        });
};
