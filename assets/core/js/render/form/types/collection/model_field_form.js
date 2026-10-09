import { render as text } from '../text';
import { render as choice } from '../choice';
import { render as checkbox } from '../checkbox';
import { render as textarea } from '../textarea';
import { childPath } from '../util';

const row = ['widget', 'label', 'field', 'constraints'];
const extra = ['sqlQuery', 'showInListingTable', 'listingWidth', 'listingTitle', 'queryableInCmsSearch'];

function field(schema, path, value) {
    return ({ choice, checkbox, textarea }[schema.type] || text)(Object.assign({}, schema, { label: row.indexOf(schema.name) >= 0 ? null : schema.label }), path, value ?? schema.value);
}

export function render(schema, path, value) {
    const items = Array.isArray(value) && value.length ? value : [{}];
    const fields = (schema.entry && schema.entry.fields) || {};
    const rows = items.map(function (item, i) {
        const prefix = path + '[' + i + ']';
        const data = item || {};
        const widget = data.widget || '';
        const cells = row.map(function (name) {
            return fields[name] ? field(Object.assign({ name: name }, fields[name]), childPath(prefix, name), data[name]) : '';
        }).join('');
        const rest = extra.map(function (name) {
            if (!fields[name]) {
                return '';
            }
            const html = field(fields[name], childPath(prefix, name), data[name]);
            return name === 'sqlQuery' ? html : `<div class="d-none">${html}</div>`;
        }).join('');

        return `
            <div class="field-item${String(widget).indexOf('Choice') === 0 ? ' is-choice' : ''}">
                ${cells}
                <div class="field-actions">
                    <button type="button" class="field-settings-btn" data-bs-toggle="modal" data-bs-target="#field-settings-modal" aria-label="Field settings">
                        <i class="fa-solid fa-ellipsis"></i>
                    </button>
                    <button type="button" class="field-remove-btn" aria-label="Remove"><i class="fa-solid fa-xmark"></i></button>
                </div>
                ${rest}
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
}
