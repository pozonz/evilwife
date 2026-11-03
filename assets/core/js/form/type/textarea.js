import { bind, getTypeByKeys, escapeHtml, error } from '../dom';

export const render = (dom, keys) => {
    const { schema, id, name, value, errors } = getTypeByKeys(keys);
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

    bind(id, () => render(dom, keys));
};
