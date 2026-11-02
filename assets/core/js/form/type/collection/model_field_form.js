import { render as text } from '../text';
import { render as choice } from '../choice';
import { render as checkbox } from '../checkbox';
import { render as textarea } from '../textarea';
import { getSchemaByKeys, getValueByKeys } from '../../store';

const row = ['widget', 'label', 'field', 'constraints'];
const extra = ['sqlQuery'];

const field = (keys) =>
    ({ choice, checkbox, textarea }[getSchemaByKeys(keys).type] || text)(keys);

export const render = (keys) => {
    const schema = getSchemaByKeys(keys);
    const value = getValueByKeys(keys);
    const items = Array.isArray(value) && value.length ? value : [{}];
    const fields = (schema.entry && schema.entry.fields) || {};
    const rows = items.map((item, i) => {
        const cells = row.map((name) => fields[name] ? field(keys.concat(i, name)) : '').join('');
        const rest = extra.map((name) => fields[name] ? field(keys.concat(i, name)) : '').join('');

        return `
            <div class="field-item${String(item && item.widget).indexOf('Choice') === 0 ? ' is-choice' : ''}">
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
