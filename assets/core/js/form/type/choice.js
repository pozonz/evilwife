import { getByKeys } from '../dom';
import { escapeHtml } from '../utils';
import { render as error } from './error/error';

export const render = (keys) => {
    const { schema, id, name, value, errors } = getByKeys(keys);
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
            <select class="${escapeHtml(cls)}${errors.length ? ' is-invalid' : ''}" id="${id}" name="${escapeHtml(multiple ? name + '[]' : name)}"${multiple ? ' multiple' : ''}${placeholder ? ` data-placeholder="${escapeHtml(placeholder)}"` : ''}>
                ${options}
            </select>
            ${error(errors)}
        </div>
    `;
};
