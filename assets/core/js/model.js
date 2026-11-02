import './main.js';
import '../css/model.less';
import { load } from './form/controller';
import { data } from './form/store';
import { render as errors } from './form/type/error';

const validate = () => {
    fetch('/manage/model/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.data),
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

};

load(document.querySelector('[data-schema-url]'), {
    validate: validate, 
    save: save,
    apply: apply,
});
