import 'jquery-ui/dist/jquery-ui';
import 'jquery-ui/dist/themes/base/jquery-ui.css';
import 'chosen-js';
import 'chosen-js/chosen.css';

import { store } from './store';
import { getByKeys } from './utils';
import { render as text } from './type/text';
import { render as choice } from './type/choice';
import { render as checkbox } from './type/checkbox';
import { render as textarea } from './type/textarea';
import { render as collection } from './type/collection/model_field_form';

const field = (keys) =>
    ({ choice, checkbox, textarea, collection }[getByKeys(keys).schema.type] || text)(keys);

export const render = () => {
    const fields = store.schema.fields || {};
    let html = '<div class="row g-3">';
    Object.keys(fields).forEach((key) => {
        const col = fields[key].type === 'collection' ? 'col-12' : 'col-md-6';
        html += `<div class="${col}">${field([key])}</div>`;
    });
    store.container.innerHTML = html + '</div>';

    enhance();
};

const enhance = () => {
    const table = store.container.querySelector('.field-table');
    if (table) {
        $(table).sortable({
            items: '.field-item',
            placeholder: 'field-item-placeholder',
            forcePlaceholderSize: true,
        });
    }

    store.container.querySelectorAll('select[multiple]').forEach((select) => {
        $(select)
            .chosen({
                width: '100%',
                placeholder_text_multiple: select.getAttribute('data-placeholder') || 'Select...',
            })
            .on('change', () => {
                store.applyChange && store.applyChange(select);
            });
    });

    store.container.querySelectorAll('select[name*="[widget]"]').forEach((select) => {
        const item = select.closest('.field-item');
        if (!item) {
            return;
        }
        select.addEventListener('change', () => {
            item.classList.toggle('is-choice', String(select.value).indexOf('Choice') === 0);
        });
    });
};
