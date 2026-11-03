import 'chosen-js';
import 'chosen-js/chosen.css';

import { bind, getTypeByKeys, escapeHtml, error } from '../dom';

export const render = (dom, keys) => {
    const { schema, id, name, value, errors } = getTypeByKeys(keys);
    const multiple = !!schema.multiple;
    const label = schema.label ? `<label class="form-label" for="${id}">${escapeHtml(schema.label)}</label>` : '';
    const cls = (schema.attr && schema.attr.class) || 'form-select';
    const placeholder = (schema.attr && schema.attr['data-placeholder']) || '';
    const values = Array.isArray(value) ? value : (value ? [value] : []);
    const options = (schema.choices || []).map((choice) => {
        const selected = values.indexOf(choice.value) !== -1 ? ' selected' : '';
        return `<option value="${escapeHtml(choice.value)}"${selected}>${escapeHtml(choice.label)}</option>`;
    }).join('');

    dom.innerHTML = `
        <div class="mb-0">
            ${label}
            <select class="${escapeHtml(cls)}${errors.length ? ' is-invalid' : ''}" id="${id}" name="${escapeHtml(multiple ? name + '[]' : name)}"${multiple ? ' multiple' : ''}${placeholder ? ` data-placeholder="${escapeHtml(placeholder)}"` : ''}>
                ${options}
            </select>
            ${error(errors)}
        </div>
    `;

    const item = dom.closest('.field-item');
    if (item && /\[widget\]$/.test(name)) {
        item.classList.toggle('is-choice', String(value).indexOf('Choice') === 0);
    }

    if (multiple) {
        $(dom).find('select').chosen({
            width: '100%',
            placeholder_text_multiple: placeholder || 'Select...',
        });
    }

    bind(id, () => render(dom, keys));
};
