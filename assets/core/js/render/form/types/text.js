import { escapeHtml, fieldId, fieldName } from './util';

export function render(schema, path, value) {
    const id = fieldId(path);
    const label = schema.label ? `<label class="form-label" for="${id}">${escapeHtml(schema.label)}</label>` : '';
    const cls = (schema.attr && schema.attr.class) || 'form-control';
    const type = schema.type === 'integer' ? 'number' : 'text';

    return `
        <div class="mb-0">
            ${label}
            <input class="${escapeHtml(cls)}" id="${id}" name="${escapeHtml(fieldName(path))}" type="${type}" value="${escapeHtml(value ?? '')}"${schema.disabled ? ' disabled' : ''}>
        </div>
    `;
}
