import { bind, getTypeByKeys, escapeHtml } from '../dom';

export const render = (dom, keys) => {
    const { schema, id, name, value } = getTypeByKeys(keys);

    dom.innerHTML = `
        <div class="form-check">
            <input class="form-check-input" type="checkbox" id="${id}" name="${escapeHtml(name)}" value="1"${value ? ' checked' : ''}>
            <label class="form-check-label" for="${id}">${escapeHtml(schema.label || '')}</label>
            <div id="${id}-error" class="invalid-feedback d-none"></div>
        </div>
    `;

    bind(keys);
};
