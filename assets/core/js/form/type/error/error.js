import { store } from '../../store';
import { getFieldIdByKeys, getKeysByFieldName } from '../../utils';

export const render = (errors) => {
    store.container.querySelectorAll('.is-invalid').forEach((el) => {
        el.classList.remove('is-invalid');
    });
    store.container.querySelectorAll('.invalid-feedback').forEach((el) => {
        el.remove();
    });

    (errors || []).forEach((error) => {
        const field = document.getElementById(getFieldIdByKeys(getKeysByFieldName(error.path)));
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
