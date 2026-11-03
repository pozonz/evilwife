import { escapeHtml, getByKeys } from '../utils';
import { render as error } from './error/error';

export const render = (keys) => {
    const { schema, id, name, value, errors } = getByKeys(keys);

    return `
        <div class="form-check">
            <input class="form-check-input${errors.length ? ' is-invalid' : ''}" type="checkbox" id="${id}" name="${escapeHtml(name)}" value="1"${value ? ' checked' : ''}>
            <label class="form-check-label" for="${id}">${escapeHtml(schema.label || '')}</label>
            ${error(errors)}
        </div>
    `;
};
