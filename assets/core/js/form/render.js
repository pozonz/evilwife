import 'jquery-ui/dist/jquery-ui';
import 'jquery-ui/dist/themes/base/jquery-ui.css';
import 'chosen-js';
import 'chosen-js/chosen.css';

import { store } from './store';
import { render as text } from './type/text';
import { render as choice } from './type/choice';
import { render as checkbox } from './type/checkbox';
import { render as textarea } from './type/textarea';
import { render as collection } from './type/collection/model_field_form';

export const render = () => {
    const fields = store.schema.fields || {};

    let wrapper = document.createElement('div');
    wrapper.id = store.schema.name;
    wrapper.className = 'row g-3';
    store.container.appendChild(wrapper);

    Object.keys(fields).forEach((key) => {
        const block = document.createElement('div');
        block.className = fields[key].type === 'collection' ? 'col-12' : 'col-md-6';
        wrapper.appendChild(block);

        ({ choice, checkbox, textarea, collection }[fields[key].type] || text)(block, [key]);
    });

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
        $(select).chosen({
            width: '100%',
            placeholder_text_multiple: select.getAttribute('data-placeholder') || 'Select...',
        });
    });
};
