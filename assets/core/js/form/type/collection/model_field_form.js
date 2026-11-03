import { render as text } from '../text';
import { render as choice } from '../choice';
import { render as checkbox } from '../checkbox';
import { render as textarea } from '../textarea';
import { getByKeys, escapeHtml } from '../../dom';

const row = ['widget', 'label', 'field', 'constraints'];
const extra = ['sqlQuery'];
const settings = ['showInListingTable', 'listingWidth', 'listingTitle', 'queryableInCmsSearch'];

const field = (dom, keys) =>
    ({ choice, checkbox, textarea }[getByKeys(keys).schema.type] || text)(dom, keys);

const modal = (dom, keys) => {
    const { id } = getByKeys(keys);
    const title = getByKeys(keys.concat('label')).value;
    const key = getByKeys(keys.concat('field')).value;
    const modalId = id + '_settings';

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
    settings.forEach((name) => {
        const cell = document.createElement('div');
        body.appendChild(cell);
        field(cell, keys.concat(name));
    });
};

export const render = (dom, keys) => {
    const { schema, value } = getByKeys(keys);
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
        const modalId = getByKeys(itemKeys).id + '_settings';
        const rowEl = document.createElement('div');
        rowEl.className = 'field-item' + (String(item && item.widget).indexOf('Choice') === 0 ? ' is-choice' : '');
        table.appendChild(rowEl);

        row.forEach((name) => {
            if (!fields[name]) {
                return;
            }
            const cell = document.createElement('div');
            rowEl.appendChild(cell);
            field(cell, itemKeys.concat(name));
        });

        const actions = document.createElement('div');
        actions.className = 'field-actions';
        actions.innerHTML = `
            <button type="button" class="field-settings-btn" data-bs-toggle="modal" data-bs-target="#${modalId}" aria-label="Field settings">
                <i class="fa-solid fa-ellipsis"></i>
            </button>
            <button type="button" class="field-remove-btn" aria-label="Remove"><i class="fa-solid fa-xmark"></i></button>
        `;
        rowEl.appendChild(actions);

        extra.forEach((name) => {
            if (!fields[name]) {
                return;
            }
            const cell = document.createElement('div');
            rowEl.appendChild(cell);
            field(cell, itemKeys.concat(name));
        });

        const modalEl = document.createElement('div');
        rowEl.appendChild(modalEl);
        modal(modalEl, itemKeys);
    });
};
