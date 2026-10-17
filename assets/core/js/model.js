import './main.js';
import '../css/model.less';
import { load } from './form/controller';

(function () {
    var container = document.querySelector('[data-schema-url]');
    if (!container) {
        return;
    }

    load(container);
})();
