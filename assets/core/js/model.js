import './main.js';
import '../css/model.less';
import { load } from './form/controller';
import { store } from './form/store';

const post = (url, callback) => {
    fetch(url, {
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

const validate = (callback = () => {}) => post('/manage/model/validate', callback);
const apply = (callback = () => {}) => post('/manage/model/save', callback);
const save = (callback = () => {}) => apply(callback);

load(document.querySelector('[data-schema-url]'), {
    validate,
    save,
    apply,
});
