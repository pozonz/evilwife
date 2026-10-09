import { escapeHtml, fieldId, fieldName } from './util';

export function render(schema, path, value) {
    const id = fieldId(path);
    const label = schema.label ? `<label class="form-label" for="${id}">${escapeHtml(schema.label)}</label>` : '';
    const cls = (schema.attr && schema.attr.class) || 'form-control';
    const rows = (schema.attr && schema.attr.rows) || 3;

    return `
        <div class="mb-0">
            ${label}
            <textarea class="${escapeHtml(cls)}" id="${id}" name="${escapeHtml(fieldName(path))}" rows="${rows}">${escapeHtml(value ?? '')}</textarea>
        </div>
    `;
}
