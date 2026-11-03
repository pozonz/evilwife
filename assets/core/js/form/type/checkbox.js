import { store } from '../store';
import { escapeHtml, getSchemaByKeys, getValueByKeys, getFieldIdByKeys, getFieldNamebyKeys } from '../utils';

export const render = (keys) => {
    const schema = getSchemaByKeys(keys);
    const value = getValueByKeys(store.data, keys);
    const id = getFieldIdByKeys(keys);
    const fieldName = getFieldNamebyKeys(keys);

    return `
        <div class="form-check">
            <input class="form-check-input" type="checkbox" id="${id}" name="${escapeHtml(fieldName)}" value="1"${value ? ' checked' : ''}>
            <label class="form-check-label" for="${id}">${escapeHtml(schema.label || '')}</label>
        </div>
    `;
};
