import { bind, getTypeByKeys, escapeHtml, error } from '../dom';

export const render = (dom, keys) => {
    const { schema, id, name, value, errors } = getTypeByKeys(keys);
    const label = schema.label ? `<label class="form-label" for="${id}">${escapeHtml(schema.label)}</label>` : '';
    const cls = (schema.attr && schema.attr.class) || 'form-control';
    const type = schema.type === 'integer' ? 'number' : 'text';

    dom.innerHTML = `
        <div class="mb-0">
            ${label}
            <input class="${escapeHtml(cls)}${errors.length ? ' is-invalid' : ''}" id="${id}" name="${escapeHtml(name)}" type="${type}" value="${escapeHtml(value ?? '')}"${schema.disabled ? ' disabled' : ''}>
            ${error(errors)}
        </div>
    `;

    bind(id, () => render(dom, keys));
};
