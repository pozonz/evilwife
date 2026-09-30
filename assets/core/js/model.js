import $ from 'jquery';
import 'jquery-ui/dist/jquery-ui';
import 'jquery-ui/dist/themes/base/jquery-ui.css';
import 'chosen-js';
import 'chosen-js/chosen.css';
import './main.js';
import '../css/model.less';

(function ($) {
    var $table = $('.field-table');
    if (!$table.length) {
        return;
    }

    $table.sortable({
        items: '.field-item',
        placeholder: 'field-item-placeholder',
        forcePlaceholderSize: true,
        update: function () {
            var items = $(this).sortable('serialize');
            console.log(items);
        }
    });

    $('#accesses').chosen({
        width: '100%',
        placeholder_text_multiple: 'Select accesses...'
    });

    $('.constraints-select').chosen({
        width: '100%',
        placeholder_text_multiple: 'Select constraints...'
    });

    function syncChoiceSource(select) {
        select.closest('.field-item').classList.toggle('is-choice', select.value.indexOf('Choice') === 0);
    }

    document.querySelectorAll('.widget-select').forEach(function (select) {
        syncChoiceSource(select);
        select.addEventListener('change', function () {
            syncChoiceSource(select);
        });
    });

    var settingsModal = document.getElementById('field-settings-modal');
    if (settingsModal) {
        settingsModal.addEventListener('show.bs.modal', function (event) {
            var item = event.relatedTarget.closest('.field-item');
            this.querySelector('.modal-title').textContent = item.querySelector('.field-label-input').value;
            this.querySelector('.field-key').textContent = item.querySelector('.field-name-input').value;
        });
    }
})($);
