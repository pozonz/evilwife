import { render as text } from './render/text';
import { render as choice } from './render/choice';
import { render as checkbox } from './render/checkbox';
import { render as textarea } from './render/textarea';
import { render as collection } from './render/collection/model_field_form';
import { fieldId } from './data';

const field = (schema, path, value) =>
    ({ choice, checkbox, textarea, collection }[schema.type] || text)(schema, path, value);

export const render = (container, schema, data) => {
    const fields = schema.fields || {};
    const values = data || {};
    const path = schema.name || '';
    let html = '<div class="row g-3">';
    Object.keys(fields).forEach((name) => {
        const item = fields[name];
        const col = item.type === 'collection' ? 'col-12' : 'col-md-6';
        html += `<div class="${col}">${field(item, fieldId(path, name).name, values[name])}</div>`;
    });
    container.innerHTML = html + '</div>';
};
