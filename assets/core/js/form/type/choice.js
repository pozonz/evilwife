import { escapeHtml, getSchemaByKeys, getValueByKeys, getIdByKeys, getNameByKeys } from '../store';

export const render = (keys) => {
    const schema = getSchemaByKeys(keys);
    const value = getValueByKeys(keys);
    const id = getIdByKeys(keys);
    const fieldName = getNameByKeys(keys);
    const multiple = !!schema.multiple;
    const label = schema.label ? `<label class="form-label" for="${id}">${escapeHtml(schema.label)}</label>` : '';
    const cls = (schema.attr && schema.attr.class) || 'form-select';
    const placeholder = (schema.attr && schema.attr['data-placeholder']) || '';
    const values = Array.isArray(value) ? value : (value ? [value] : []);
    const options = (schema.choices || []).map((choice) => {
        const selected = values.indexOf(choice.value) !== -1 ? ' selected' : '';
        return `<option value="${escapeHtml(choice.value)}"${selected}>${escapeHtml(choice.label)}</option>`;
    }).join('');

    return `
        <div class="mb-0">
            ${label}
            <select class="${escapeHtml(cls)}" id="${id}" name="${escapeHtml(multiple ? fieldName + '[]' : fieldName)}"${multiple ? ' multiple' : ''}${placeholder ? ` data-placeholder="${escapeHtml(placeholder)}"` : ''}>
                ${options}
            </select>
        </div>
    `;
};
