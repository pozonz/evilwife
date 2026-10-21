import { escapeHtml } from '../data';

export const render = (schema, fieldId, fieldName, value) => {
    const label = schema.label ? `<label class="form-label" for="${fieldId}">${escapeHtml(schema.label)}</label>` : '';
    const cls = (schema.attr && schema.attr.class) || 'form-control';
    const rows = (schema.attr && schema.attr.rows) || 3;

    return `
        <div class="mb-0">
            ${label}
            <textarea class="${escapeHtml(cls)}" id="${fieldId}" name="${escapeHtml(fieldName)}" rows="${rows}">${escapeHtml(value ?? '')}</textarea>
        </div>
    `;
};
