import { store } from './store';
import { render } from './render';

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
