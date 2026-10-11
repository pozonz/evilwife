import { escapeHtml, fieldId, fieldName } from './util';

export function render(schema, path, value) {
    const id = fieldId(path);
    return `
        <div class="form-check">
            <input class="form-check-input" type="checkbox" id="${id}" name="${escapeHtml(fieldName(path))}" value="1"${value ? ' checked' : ''}>
            <label class="form-check-label" for="${id}">${escapeHtml(schema.label || '')}</label>
        </div>
    `;
}
