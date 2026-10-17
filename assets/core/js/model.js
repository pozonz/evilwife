import $ from 'jquery';
import 'jquery-ui/dist/jquery-ui';
import 'jquery-ui/dist/themes/base/jquery-ui.css';
import 'chosen-js';
import 'chosen-js/chosen.css';
import './main.js';
import '../css/model.less';
import { mount } from './mvc/controller/form';
import { fieldId } from './mvc/util';

(function () {
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
    var settings = ['showInListingTable', 'listingWidth', 'listingTitle', 'queryableInCmsSearch'];
    var form;

    function rowPrefix(item) {
        var named = item.querySelector('[name*="[widget]"], [name*="[label]"], [name*="[field]"]');
        return named ? named.name.replace(/\[[^\]]+\]$/, '') : '';
    }

    if (modal) {
        modal.addEventListener('show.bs.modal', function (event) {
            var item = event.relatedTarget && event.relatedTarget.closest('.field-item');
            if (!item) {
                return;
            }
            var prefix = rowPrefix(item);
            var index = Number((prefix.match(/\[(\d+)\]$/) || [])[1]);
            var row = (form && form.data && form.data.fields && form.data.fields[index]) || {};
            var label = item.querySelector('[name*="[label]"]');
            var field = item.querySelector('[name*="[field]"]');
            this.querySelector('.modal-title').textContent = (label && label.value) || 'Field';
            this.querySelector('.field-key').textContent = (field && field.value) || '';
            settings.forEach(function (name) {
                var el = modal.querySelector('[data-setting="' + name + '"]');
                if (!el) {
                    return;
                }
                var path = prefix + '[' + name + ']';
                el.name = path;
                el.id = fieldId(path);
                var labelEl = el.closest('.form-check, .mb-3');
                labelEl = labelEl && labelEl.querySelector('label');
                if (labelEl) {
                    labelEl.htmlFor = el.id;
                }
                if (el.type === 'checkbox') {
                    el.checked = !!row[name];
                } else {
                    el.value = row[name] ?? '';
                }
            });
            form.validate();
        });
    }

    $.ajax({
        url: root.getAttribute('data-schema-url'),
        success: function (payload) {
            form = mount(root, payload.form, payload.data);
            enhance();
        },
        error: function () {
            root.innerHTML = '<div class="alert alert-danger mb-0">Could not load form schema.</div>';
        },
    });
})();
