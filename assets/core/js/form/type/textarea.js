import { getByKeys } from '../dom';
import { escapeHtml } from '../utils';
import { render as error } from './error/error';

export const render = (keys) => {
    const { schema, id, name, value, errors } = getByKeys(keys);
    const label = schema.label ? `<label class="form-label" for="${id}">${escapeHtml(schema.label)}</label>` : '';
    const cls = (schema.attr && schema.attr.class) || 'form-control';
    const rows = (schema.attr && schema.attr.rows) || 3;

    return `
        <div class="mb-0">
            ${label}
            <textarea class="${escapeHtml(cls)}${errors.length ? ' is-invalid' : ''}" id="${id}" name="${escapeHtml(name)}" rows="${rows}">${escapeHtml(value ?? '')}</textarea>
            ${error(errors)}
        </div>
    `;
};
