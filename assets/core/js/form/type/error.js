import { data, getIdFromAttr } from '../store';

export const render = (errors) => {
    data.container.querySelectorAll('.is-invalid').forEach((el) => {
        el.classList.remove('is-invalid');
    });
    data.container.querySelectorAll('.invalid-feedback').forEach((el) => {
        el.remove();
    });

    (errors || []).forEach((error) => {
        const field = document.getElementById(getIdFromAttr(data.schema.name, error.path));
        if (!field) {
            return;
        }
        field.classList.add('is-invalid');
        const message = document.createElement('div');
        message.className = 'invalid-feedback d-block';
        message.textContent = error.message;
        field.after(message);
    });
};
