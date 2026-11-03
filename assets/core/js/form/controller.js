import { store } from './store';
import { render as text } from './type/text';
import { render as choice } from './type/choice';
import { render as checkbox } from './type/checkbox';
import { render as textarea } from './type/textarea';
import { render as collection } from './collection/model_field_form';

const types = { choice, checkbox, textarea, collection };

export const load = (container, options) => {
    const { validate, save, apply } = options;

    store.container = container;
    store.validate = validate;
    store.save = save;
    store.apply = apply;

    fetch(store.container.getAttribute('data-schema-url'))
        .then((res) => {
            if (!res.ok) {
                throw new Error();
            }
            return res.json();
        })
        .then((response) => {
            store.schema = response.schema;
            store.data = response.data;
            render();
        })
        .catch((ev) => {
            store.container.innerHTML = `<div class="alert alert-danger mb-0">${ev.message}</div>`;
        });
};

const render = () => {
    const fields = store.schema.fields || {};
    const wrapper = document.createElement('div');
    wrapper.id = store.schema.name;
    wrapper.className = 'row g-3';
    store.container.appendChild(wrapper);

    Object.keys(fields).forEach((key) => {
        const dom = document.createElement('div');
        dom.className = fields[key].type === 'collection' ? 'col-12' : 'col-md-6';
        wrapper.appendChild(dom);
        (types[fields[key].type] || text)(dom, [key]);
    });
};
