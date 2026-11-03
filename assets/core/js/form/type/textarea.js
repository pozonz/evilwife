import { applyChange, getByKeys, escapeHtml } from '../dom';
import { render as error } from './error/error';

export const render = (dom, keys) => {
    const { schema, id, name, value, errors } = getByKeys(keys);
    const label = schema.label ? `<label class="form-label" for="${id}">${escapeHtml(schema.label)}</label>` : '';
    const cls = (schema.attr && schema.attr.class) || 'form-control';
    const rows = (schema.attr && schema.attr.rows) || 3;

    dom.innerHTML = `
        <div class="mb-0">
            ${label}
            <textarea class="${escapeHtml(cls)}${errors.length ? ' is-invalid' : ''}" id="${id}" name="${escapeHtml(name)}" rows="${rows}">${escapeHtml(value ?? '')}</textarea>
            ${error(errors)}
        </div>
    `;

    $(document).off('change input', `#${id}`).on('change input', `#${id}`, (ev) => {
        applyChange(ev.target, () => render(dom, keys));
    });
};
