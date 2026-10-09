import $ from 'jquery';
import 'jquery-ui/dist/jquery-ui';
import 'jquery-ui/dist/themes/base/jquery-ui.css';
import 'chosen-js';
import 'chosen-js/chosen.css';
import './main.js';
import '../css/model.less';
import { mount } from './form/render';

(function ($) {
    var root = document.querySelector('[data-schema-url]');
    if (!root) {
        return;
    }

    function enhance() {
        var $table = $('.field-table');
        if ($table.length) {
            $table.sortable({
                items: '.field-item',
                placeholder: 'field-item-placeholder',
                forcePlaceholderSize: true,
            });
        }

        $('select[multiple]').each(function () {
            $(this).chosen({
                width: '100%',
                placeholder_text_multiple: this.getAttribute('data-placeholder') || 'Select...',
            });
        });

        document.querySelectorAll('select[name*="[widget]"]').forEach(function (select) {
            var item = select.closest('.field-item');
            if (!item) {
                return;
            }
            item.classList.toggle('is-choice', select.value.indexOf('Choice') === 0);
            select.addEventListener('change', function () {
                item.classList.toggle('is-choice', select.value.indexOf('Choice') === 0);
            });
        });
    }

    var modal = document.getElementById('field-settings-modal');
    if (modal) {
        modal.addEventListener('show.bs.modal', function (event) {
            var item = event.relatedTarget && event.relatedTarget.closest('.field-item');
            if (!item) {
                return;
            }
            var label = item.querySelector('[name*="[label]"]');
            var field = item.querySelector('[name*="[field]"]');
            this.querySelector('.modal-title').textContent = (label && label.value) || 'Field';
            this.querySelector('.field-key').textContent = (field && field.value) || '';
        });
    }

    mount(root, root.getAttribute('data-schema-url')).then(enhance).catch(function (error) {
        root.innerHTML = '<div class="alert alert-danger mb-0">' + error.message + '</div>';
    });
})($);
