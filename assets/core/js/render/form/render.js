import { render as text } from './types/text';
import { render as choice } from './types/choice';
import { render as checkbox } from './types/checkbox';
import { render as textarea } from './types/textarea';
import { render as collection } from './types/collection/model_field_form';
import { childPath } from './types/util';

function field(schema, path, value) {
    return ({ choice, checkbox, textarea, collection }[schema.type] || text)(schema, path, value ?? schema.value);
}

export function mount(element, schemaUrl, data) {
    return fetch(schemaUrl, { credentials: 'same-origin' })
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Could not load form schema.');
            }
            return response.json();
        })
        .then(function (schema) {
            const fields = schema.fields || {};
            const values = data || {};
            const path = schema.name || '';
            let html = '<div class="row g-3">';
            Object.keys(fields).forEach(function (name) {
                const item = fields[name];
                const col = item.type === 'collection' ? 'col-12' : 'col-md-6';
                html += `<div class="${col}">${field(item, childPath(path, name), values[name])}</div>`;
            });
            element.innerHTML = html + '</div>';
        });
}
