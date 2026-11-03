import 'jquery-ui/dist/jquery-ui';
import 'jquery-ui/dist/themes/base/jquery-ui.css';
import 'chosen-js';
import 'chosen-js/chosen.css';

import { data, apply, validate, getIdByKeys, getNameByKeys, getSchemaByKeys } from './store';
import { render as text } from './type/text';
import { render as choice } from './type/choice';
import { render as checkbox } from './type/checkbox';
import { render as textarea } from './type/textarea';
import { render as collection } from './type/collection/model_field_form';

const field = (keys) =>
    ({ choice, checkbox, textarea, collection }[getSchemaByKeys(keys).type] || text)(keys);

export const render = () => {
    const fields = data.schema.fields || {};
    let html = '<div class="row g-3">';
    Object.keys(fields).forEach((key) => {
        const col = fields[key].type === 'collection' ? 'col-12' : 'col-md-6';
        html += `<div class="${col}">${field([key])}</div>`;
    });
    data.container.innerHTML = html + '</div>';

    enhance();
    setModal();
};

const enhance = () => {
    const table = data.container.querySelector('.field-table');
    if (table) {
        $(table).sortable({
            items: '.field-item',
            placeholder: 'field-item-placeholder',
            forcePlaceholderSize: true,
        });
    }

    data.container.querySelectorAll('select[multiple]').forEach((select) => {
        $(select)
            .chosen({
                width: '100%',
                placeholder_text_multiple: select.getAttribute('data-placeholder') || 'Select...',
            })
            .on('change', () => {
                apply(select);
            });
    });

    data.container.querySelectorAll('select[name*="[widget]"]').forEach((select) => {
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

export const setModal = () => {
    const settings = ['showInListingTable', 'listingWidth', 'listingTitle', 'queryableInCmsSearch'];
    const modal = document.getElementById('field-settings-modal');
    if (!modal) {
        return;
    }

    data.container.appendChild(modal);

    modal.addEventListener('show.bs.modal', (ev) => {
        const item = ev.relatedTarget && ev.relatedTarget.closest('.field-item');
        if (!item) {
            return;
        }

        const prefix = rowPrefix(item);
        const index = Number((prefix.match(/\[(\d+)\]$/) || [])[1]);
        const row = (data.data.fields && data.data.fields[index]) || {};
        const label = item.querySelector('[name*="[label]"]');
        const field = item.querySelector('[name*="[field]"]');

        modal.querySelector('.modal-title').textContent = (label && label.value) || 'Field';
        modal.querySelector('.field-key').textContent = (field && field.value) || '';

        settings.forEach((name) => {
            const el = modal.querySelector('[data-setting="' + name + '"]');
            if (!el) {
                return;
            }
            el.name = getNameByKeys(['fields', index, name]);
            el.id = getIdByKeys(['fields', index, name]);
            const wrap = el.closest('.form-check, .mb-3');
            const labelEl = wrap && wrap.querySelector('label');
            if (labelEl) {
                labelEl.htmlFor = el.id;
            }
            if (el.type === 'checkbox') {
                el.checked = !!row[name];
            } else {
                el.value = row[name] ?? '';
            }
        });

        validate();
    });
};
