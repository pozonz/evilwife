import { escapeHtml, getSchemaByKeys, getValueByKeys, getIdByKeys, getNameByKeys } from '../store';

export const render = (keys) => {
    const schema = getSchemaByKeys(keys);
    const value = getValueByKeys(keys);
    const id = getIdByKeys(keys);
    const fieldName = getNameByKeys(keys);
    const label = schema.label ? `<label class="form-label" for="${id}">${escapeHtml(schema.label)}</label>` : '';
    const cls = (schema.attr && schema.attr.class) || 'form-control';
    const type = schema.type === 'integer' ? 'number' : 'text';

    return `
        <div class="mb-0">
            ${label}
            <input class="${escapeHtml(cls)}" id="${id}" name="${escapeHtml(fieldName)}" type="${type}" value="${escapeHtml(value ?? '')}"${schema.disabled ? ' disabled' : ''}>
        </div>
    `;
};
