import { escapeHtml, fieldId, fieldName } from './util';

export function render(schema, path, value) {
    const id = fieldId(path);
    const multiple = !!schema.multiple;
    const label = schema.label ? `<label class="form-label" for="${id}">${escapeHtml(schema.label)}</label>` : '';
    const cls = (schema.attr && schema.attr.class) || 'form-select';
    const placeholder = (schema.attr && schema.attr['data-placeholder']) || '';
    const values = Array.isArray(value) ? value : (value ? [value] : []);
    const options = (schema.choices || []).map(function (choice) {
        const selected = values.indexOf(choice.value) !== -1 ? ' selected' : '';
        return `<option value="${escapeHtml(choice.value)}"${selected}>${escapeHtml(choice.label)}</option>`;
    }).join('');

    return `
        <div class="mb-0">
            ${label}
            <select class="${escapeHtml(cls)}" id="${id}" name="${escapeHtml(fieldName(path, multiple))}"${multiple ? ' multiple' : ''}${placeholder ? ` data-placeholder="${escapeHtml(placeholder)}"` : ''}>
                ${options}
            </select>
        </div>
    `;
}
