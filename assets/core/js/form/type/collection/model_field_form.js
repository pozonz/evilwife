import { render as text } from '../text';
import { render as choice } from '../choice';
import { render as checkbox } from '../checkbox';
import { render as textarea } from '../textarea';
import { escapeHtml, getByKeys } from '../../utils';

const row = ['widget', 'label', 'field', 'constraints'];
const extra = ['sqlQuery'];
const settings = ['showInListingTable', 'listingWidth', 'listingTitle', 'queryableInCmsSearch'];

const field = (keys) =>
    ({ choice, checkbox, textarea }[getByKeys(keys).schema.type] || text)(keys);

const modal = (keys) => {
    const { id } = getByKeys(keys);
    const title = getByKeys(keys.concat('label')).value;
    const key = getByKeys(keys.concat('field')).value;
    const modalId = id + '_settings';
    const body = settings.map((name) => field(keys.concat(name))).join('');

    return `
        <div class="modal fade field-settings-modal" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-title" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content shadow">
                    <div class="modal-header border-0 pb-0">
                        <h2 class="modal-title" id="${modalId}-title">${escapeHtml(title || 'Field')}</h2>
                        <span class="field-key">${escapeHtml(key || '')}</span>
                    </div>
                    <div class="modal-body">
                        ${body}
                    </div>
                </div>
            </div>
        </div>
    `;
};

export const render = (keys) => {
    const { schema, value } = getByKeys(keys);
    const items = Array.isArray(value) && value.length ? value : [{}];
    const fields = (schema.entry && schema.entry.fields) || {};
    const rows = items.map((item, i) => {
        const itemKeys = keys.concat(i);
        const cells = row.map((name) => fields[name] ? field(itemKeys.concat(name)) : '').join('');
        const rest = extra.map((name) => fields[name] ? field(itemKeys.concat(name)) : '').join('');
        const modalId = getByKeys(itemKeys).id + '_settings';

        return `
            <div class="field-item${String(item && item.widget).indexOf('Choice') === 0 ? ' is-choice' : ''}">
                ${cells}
                <div class="field-actions">
                    <button type="button" class="field-settings-btn" data-bs-toggle="modal" data-bs-target="#${modalId}" aria-label="Field settings">
                        <i class="fa-solid fa-ellipsis"></i>
                    </button>
                    <button type="button" class="field-remove-btn" aria-label="Remove"><i class="fa-solid fa-xmark"></i></button>
                </div>
                ${rest}
                ${modal(itemKeys)}
            </div>
        `;
    }).join('');

    return `
        <div class="field-table">
            <div class="field-grid-head">
                <div>Widget</div>
                <div>Label</div>
                <div>Field</div>
                <div>Constraints</div>
                <div></div>
            </div>
            ${rows}
        </div>
    `;
};
