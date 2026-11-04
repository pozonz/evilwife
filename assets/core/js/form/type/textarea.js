import { bind, getTypeByKeys, escapeHtml } from '../dom';

export const render = (dom, keys) => {
    const { schema, id, name, value } = getTypeByKeys(keys);
    const label = schema.label ? `<label class="form-label" for="${id}">${escapeHtml(schema.label)}</label>` : '';
    const cls = (schema.attr && schema.attr.class) || 'form-control';
    const rows = (schema.attr && schema.attr.rows) || 3;

    dom.innerHTML = `
        <div class="mb-0">
            ${label}
            <textarea class="${escapeHtml(cls)}" id="${id}" name="${escapeHtml(name)}" rows="${rows}">${escapeHtml(value ?? '')}</textarea>
            <div id="${id}-error" class="invalid-feedback d-none"></div>
        </div>
    `;

    bind(keys);
};
