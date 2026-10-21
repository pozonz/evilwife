import { render as text } from './render/text';
import { render as choice } from './render/choice';
import { render as checkbox } from './render/checkbox';
import { render as textarea } from './render/textarea';
import { render as collection } from './render/collection/model_field_form';
import { getIdFromAttr, getNameFromAttr } from './data';

const field = (schema, fieldId, fieldName, value) =>
    ({ choice, checkbox, textarea, collection }[schema.type] || text)(schema, fieldId, fieldName, value);

export const render = (container, schema, data) => {
    const fields = schema.fields || {};
    const values = data || {};
    let html = '<div class="row g-3">';
    Object.keys(fields).forEach((key) => {
        const item = fields[key];
        const col = item.type === 'collection' ? 'col-12' : 'col-md-6';
        html += `<div class="${col}">${field(item, getIdFromAttr(schema.name, key), getNameFromAttr(schema.name, key), values[key])}</div>`;
    });
    container.innerHTML = html + '</div>';
};
