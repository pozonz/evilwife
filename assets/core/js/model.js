import './main.js';
import '../css/model.less';
import { load } from './form/controller';
import { store } from './form/store';

const validate = (callback = () => {}) => {
    fetch('/manage/model/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(store.data),
    })
        .then((res) => res.json())
        .then((response) => {
            store.errors = response.errors;
            callback();
        });
};

const save = (callback = () => {}) => {
    apply(callback);
};

const apply = (callback = () => {}) => {
    fetch('/manage/model/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(store.data),
    })
        .then((res) => res.json())
        .then((response) => {
            store.errors = response.errors;
            callback();
        });
};

load(document.querySelector('[data-schema-url]'), {
    validate: validate,
    save: save,
    apply: apply,
});
