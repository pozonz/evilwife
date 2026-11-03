import './main.js';
import '../css/model.less';
import { load } from './form/controller';
import { store } from './form/store';
import { render as errors } from './form/type/error/error.js';

const validate = () => {
    fetch('/manage/model/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(store.data),
    })
        .then((res) => res.json())
        .then((response) => {
            errors(response.errors);
        });
};

const save = () => {
    apply();
};

const apply = () => {
    fetch('/manage/model/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(store.data),
    })
        .then((res) => res.json())
        .then((response) => {
            errors(response.errors);
        });
};

load(document.querySelector('[data-schema-url]'), {
    validate: validate,
    save: save,
    apply: apply,
});
