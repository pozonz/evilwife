import { store } from '../store';
import { escapeHtml, getSchemaByKeys, getValueByKeys, getFieldIdByKeys, getFieldNamebyKeys } from '../utils';

export const render = (keys) => {
    const schema = getSchemaByKeys(keys);
    const value = getValueByKeys(store.data, keys);
    const id = getFieldIdByKeys(keys);
    const fieldName = getFieldNamebyKeys(keys);
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
