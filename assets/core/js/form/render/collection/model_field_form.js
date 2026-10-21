import { render as text } from '../text';
import { render as choice } from '../choice';
import { render as checkbox } from '../checkbox';
import { render as textarea } from '../textarea';
import { fieldId } from '../../data';

const row = ['widget', 'label', 'field', 'constraints'];
const extra = ['sqlQuery'];

const field = (schema, path, value) =>
    ({ choice, checkbox, textarea }[schema.type] || text)(Object.assign({}, schema, { label: row.indexOf(schema.name) >= 0 ? null : schema.label }), path, value);

export const render = (schema, path, value) => {
    const items = Array.isArray(value) && value.length ? value : [{}];
    const fields = (schema.entry && schema.entry.fields) || {};
    const rows = items.map((item, i) => {
        const data = item || {};
        const widget = data.widget || '';
        const cells = row.map((name) =>
            fields[name] ? field(Object.assign({ name: name }, fields[name]), fieldId(path, i, name).name, data[name]) : ''
        ).join('');
        const rest = extra.map((name) => {
            if (!fields[name]) {
                return '';
            }
            return field(fields[name], fieldId(path, i, name).name, data[name]);
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
};
