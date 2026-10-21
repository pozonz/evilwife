import { fieldId } from '../data';

export const render = (container, errors, root) => {
    container.querySelectorAll('.is-invalid').forEach((el) => {
        el.classList.remove('is-invalid');
    });
    container.querySelectorAll('.invalid-feedback').forEach((el) => {
        el.remove();
    });

    (errors || []).forEach((error) => {
        const field = document.getElementById(fieldId(root, error.path).id);
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
