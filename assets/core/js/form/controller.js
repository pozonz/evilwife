import { store } from './store';
import { render } from './render';
import { getKeysByFieldName, setValueByKeys, getValueByEl } from './utils';

export const load = (container, options) => {
    if (!container) {
        return;
    }
    store.container = container;

    const { validate } = options;
    store.validate = validate;

    const applyChange = (el) => {
        if (!el || !store.container.contains(el)) {
            return;
        }

        const keys = getKeysByFieldName(el.name);
        if (keys.length) {
            setValueByKeys(store.data, keys, getValueByEl(el));
            validate(render);
        }
    };

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

            store.container.addEventListener('input', (ev) => applyChange(ev.target.closest('[name]')));
            store.container.addEventListener('change', (ev) => applyChange(ev.target.closest('[name]')));
        })
        .catch((ev) => {
            store.container.innerHTML = `<div class="alert alert-danger mb-0">${ev.message}</div>`;
        });
};
