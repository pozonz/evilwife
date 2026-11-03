import { bind, getTypeByKeys, escapeHtml, error } from '../dom';

export const render = (dom, keys) => {
    const { schema, id, name, value, errors } = getTypeByKeys(keys);

    dom.innerHTML = `
        <div class="form-check">
            <input class="form-check-input${errors.length ? ' is-invalid' : ''}" type="checkbox" id="${id}" name="${escapeHtml(name)}" value="1"${value ? ' checked' : ''}>
            <label class="form-check-label" for="${id}">${escapeHtml(schema.label || '')}</label>
            ${error(errors)}
        </div>
    `;

    bind(id, () => render(dom, keys));
};
