import { escapeHtml, getSchemaByKeys, getValueByKeys, getIdByKeys, getNameByKeys } from '../store';

export const render = (keys) => {
    const schema = getSchemaByKeys(keys);
    const value = getValueByKeys(keys);
    const id = getIdByKeys(keys);
    const fieldName = getNameByKeys(keys);
    const label = schema.label ? `<label class="form-label" for="${id}">${escapeHtml(schema.label)}</label>` : '';
    const cls = (schema.attr && schema.attr.class) || 'form-control';
    const rows = (schema.attr && schema.attr.rows) || 3;

    return `
        <div class="mb-0">
            ${label}
            <textarea class="${escapeHtml(cls)}" id="${id}" name="${escapeHtml(fieldName)}" rows="${rows}">${escapeHtml(value ?? '')}</textarea>
        </div>
    `;
};
