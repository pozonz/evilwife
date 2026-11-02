import { escapeHtml, getSchemaByKeys, getValueByKeys, getIdByKeys, getNameByKeys } from '../store';

export const render = (keys) => {
    const schema = getSchemaByKeys(keys);
    const value = getValueByKeys(keys);
    const id = getIdByKeys(keys);
    const fieldName = getNameByKeys(keys);

    return `
        <div class="form-check">
            <input class="form-check-input" type="checkbox" id="${id}" name="${escapeHtml(fieldName)}" value="1"${value ? ' checked' : ''}>
            <label class="form-check-label" for="${id}">${escapeHtml(schema.label || '')}</label>
        </div>
    `;
};
