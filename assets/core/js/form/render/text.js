import { escapeHtml } from '../data';

export const render = (schema, fieldId, fieldName, value) => {
    const label = schema.label ? `<label class="form-label" for="${fieldId}">${escapeHtml(schema.label)}</label>` : '';
    const cls = (schema.attr && schema.attr.class) || 'form-control';
    const type = schema.type === 'integer' ? 'number' : 'text';

    return `
        <div class="mb-0">
            ${label}
            <input class="${escapeHtml(cls)}" id="${fieldId}" name="${escapeHtml(fieldName)}" type="${type}" value="${escapeHtml(value ?? '')}"${schema.disabled ? ' disabled' : ''}>
        </div>
    `;
};
