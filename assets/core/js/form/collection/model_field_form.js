import { getTypeByKeys, escapeHtml } from '../dom';
import { render as text } from '../type/text';
import { render as choice } from '../type/choice';
import { render as checkbox } from '../type/checkbox';
import { render as textarea } from '../type/textarea';

const types = { choice, checkbox, textarea };
const row = ['widget', 'label', 'field', 'constraints'];
const extra = ['sqlQuery'];
const settings = ['showInListingTable', 'listingWidth', 'listingTitle', 'queryableInCmsSearch'];

const field = (dom, keys) => (types[getTypeByKeys(keys).schema.type] || text)(dom, keys);

const append = (parent, keys) => {
    const cell = document.createElement('div');
    parent.appendChild(cell);
    field(cell, keys);
};

const modal = (dom, keys) => {
    const { id } = getTypeByKeys(keys);
    const title = getTypeByKeys(keys.concat('label')).value;
    const key = getTypeByKeys(keys.concat('field')).value;
    const modalId = id + '-settings';

    dom.innerHTML = `
        <div class="modal fade field-settings-modal" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-title" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content shadow">
                    <div class="modal-header border-0 pb-0">
                        <h2 class="modal-title" id="${modalId}-title">${escapeHtml(title || 'Field')}</h2>
                        <span class="field-key">${escapeHtml(key || '')}</span>
                    </div>
                    <div class="modal-body"></div>
                </div>
            </div>
        </div>
    `;

    const body = dom.querySelector('.modal-body');
    settings.forEach((name) => append(body, keys.concat(name)));
};

export const render = (dom, keys) => {
    const { schema, value } = getTypeByKeys(keys);
    const items = Array.isArray(value) && value.length ? value : [{}];
    const fields = (schema.entry && schema.entry.fields) || {};

    dom.innerHTML = `
        <div class="field-table">
            <div class="field-grid-head">
                <div>Widget</div>
                <div>Label</div>
                <div>Field</div>
                <div>Constraints</div>
                <div></div>
            </div>
        </div>
    `;

    const table = dom.querySelector('.field-table');

    items.forEach((item, i) => {
        const itemKeys = keys.concat(i);
        const modalId = getTypeByKeys(itemKeys).id + '-settings';
        const rowEl = document.createElement('div');
        rowEl.className = 'field-item' + (String(item && item.widget).indexOf('Choice') === 0 ? ' is-choice' : '');
        table.appendChild(rowEl);

        row.forEach((name) => fields[name] && append(rowEl, itemKeys.concat(name)));

        const actions = document.createElement('div');
        actions.className = 'field-actions';
        actions.innerHTML = `
            <button type="button" class="field-settings-btn" data-bs-toggle="modal" data-bs-target="#${modalId}" aria-label="Field settings">
                <i class="fa-solid fa-ellipsis"></i>
            </button>
            <button type="button" class="field-remove-btn" aria-label="Remove"><i class="fa-solid fa-xmark"></i></button>
        `;
        rowEl.appendChild(actions);

        extra.forEach((name) => fields[name] && append(rowEl, itemKeys.concat(name)));

        const modalEl = document.createElement('div');
        rowEl.appendChild(modalEl);
        modal(modalEl, itemKeys);
    });
};
