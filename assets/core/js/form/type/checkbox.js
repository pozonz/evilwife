import { applyChange, getByKeys } from '../dom';
import { escapeHtml } from '../utils';
import { render as error } from './error/error';

export const render = (dom, keys) => {
    const { schema, id, name, value, errors } = getByKeys(keys);

    dom.innerHTML = `
        <div class="form-check">
            <input class="form-check-input${errors.length ? ' is-invalid' : ''}" type="checkbox" id="${id}" name="${escapeHtml(name)}" value="1"${value ? ' checked' : ''}>
            <label class="form-check-label" for="${id}">${escapeHtml(schema.label || '')}</label>
            ${error(errors)}
        </div>
    `;

    $(document).off('change input', `#${id}`).on('change input', `#${id}`, (ev) => {
        applyChange(ev.target, () => render(dom, keys));
    });
};
