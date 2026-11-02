import { render, enhance, setModal } from './render';
import { data, apply, setValidate } from './store';

export const load = (el, validate) => {
    if (!el) {
        return;
    }

    data.container = el;
    setValidate(validate);

    fetch(data.container.getAttribute('data-schema-url'))
        .then((res) => {
            if (!res.ok) {
                throw new Error();
            }
            return res.json();
        })
        .then((response) => {
            data.schema = response.schema;
            data.data = response.data;

            render();
            enhance();
            setModal();

            data.container.addEventListener('input', (ev) => apply(ev.target.closest('[name]')));
            data.container.addEventListener('change', (ev) => apply(ev.target.closest('[name]')));
        })
        .catch(() => {
            data.container.innerHTML = '<div class="alert alert-danger mb-0">Could not load form schema.</div>';
        });
};
