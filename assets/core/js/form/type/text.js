import { bind, getTypeByKeys, escapeHtml } from '../dom';

export const render = (dom, keys) => {
    const { schema, id, name, value } = getTypeByKeys(keys);
    const label = schema.label ? `<label class="form-label" for="${id}">${escapeHtml(schema.label)}</label>` : '';
    const cls = (schema.attr && schema.attr.class) || 'form-control';
    const type = schema.type === 'integer' ? 'number' : 'text';

    dom.innerHTML = `
        <div class="mb-0">
            ${label}
            <input class="${escapeHtml(cls)}" id="${id}" name="${escapeHtml(name)}" type="${type}" value="${escapeHtml(value ?? '')}"${schema.disabled ? ' disabled' : ''}>
            <div id="${id}-error" class="invalid-feedback d-none"></div>
        </div>
    `;

    bind(keys);
};
