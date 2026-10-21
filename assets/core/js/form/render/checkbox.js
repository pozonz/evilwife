import { escapeHtml } from '../data';

export const render = (schema, fieldId, fieldName, value) => `
    <div class="form-check">
        <input class="form-check-input" type="checkbox" id="${fieldId}" name="${escapeHtml(fieldName)}" value="1"${value ? ' checked' : ''}>
        <label class="form-check-label" for="${fieldId}">${escapeHtml(schema.label || '')}</label>
    </div>
`;
