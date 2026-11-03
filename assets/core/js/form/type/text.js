import { getByKeys, applyChange } from '../dom';
import { escapeHtml } from '../utils';
import { render as error } from './error/error';

export const render = (keys) => {
    const { schema, id, name, value, errors } = getByKeys(keys);
    const label = schema.label ? `<label class="form-label" for="${id}">${escapeHtml(schema.label)}</label>` : '';
    const cls = (schema.attr && schema.attr.class) || 'form-control';
    const type = schema.type === 'integer' ? 'number' : 'text';

    $(document).on('change input', `#${id}`, (ev) => {
        applyChange(ev.target, () => render(keys));
    });

    return `
        <div class="mb-0">
            ${label}
            <input class="${escapeHtml(cls)}${errors.length ? ' is-invalid' : ''}" id="${id}" name="${escapeHtml(name)}" type="${type}" value="${escapeHtml(value ?? '')}"${schema.disabled ? ' disabled' : ''}>
            ${error(errors)}
        </div>
    `;  
};
