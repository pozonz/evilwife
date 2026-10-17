import $ from 'jquery';
import 'jquery-ui/dist/jquery-ui';
import 'jquery-ui/dist/themes/base/jquery-ui.css';
import 'chosen-js';
import 'chosen-js/chosen.css';
import './main.js';
import '../css/model.less';
import { mount } from './form/controller';

(function () {
    var root = document.querySelector('[data-schema-url]');
    if (!root) {
        return;
    }

    $.ajax({
        url: root.getAttribute('data-schema-url'),
        success: function (payload) {
            mount(root, payload.schema, payload.data);
        },
        error: function () {
            root.innerHTML = '<div class="alert alert-danger mb-0">Could not load form schema.</div>';
        },
    });
})();
