import 'jquery-ui/dist/jquery-ui';
import 'jquery-ui/dist/themes/base/jquery-ui.css';
import 'chosen-js';
import 'chosen-js/chosen.css';

import { render } from './view';
import { render as errors } from './render/error';
import { fieldId, keysFromName } from './data';

function read($el) {
    if ($el.is(':checkbox')) {
        return $el.prop('checked');
    }
    if ($el.is('[type=number]')) {
        const value = $el.val();
        return value === '' ? null : Number(value);
    }
    if ($el.prop('multiple')) {
        return $el.val() || [];
    }
    return $el.val();
}

function set(data, keys, value) {
    let cur = data;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (cur[key] == null || typeof cur[key] !== 'object') {
            cur[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
        }
        cur = cur[key];
    }
    cur[keys[keys.length - 1]] = value;
}

function apply($el, $container, schema, data) {
    const keys = keysFromName($el.attr('name') || '', schema.name);
    if (keys.length) {
        set(data, keys, read($el));
        validate($container, schema, data);
    }
}

function validate($container, schema, data) {
    $.ajax({
        url: '/manage/model/validate',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (xhr) {
            errors($container, xhr.errors, schema.name);
        },
    });
}

function enhance($container) {
    $container.find('.field-table').sortable({
        items: '.field-item',
        placeholder: 'field-item-placeholder',
        forcePlaceholderSize: true,
    });

    $container.find('select[multiple]').each(function () {
        const $select = $(this);
        $select.chosen({
            width: '100%',
            placeholder_text_multiple: $select.attr('data-placeholder') || 'Select...',
        });
    });

    $container.find('select[name*="[widget]"]').on('change', function () {
        const $select = $(this);
        $select.closest('.field-item').toggleClass('is-choice', String($select.val()).indexOf('Choice') === 0);
    });
}

function rowPrefix($item) {
    const name = $item.find('[name*="[widget]"], [name*="[label]"], [name*="[field]"]').attr('name') || '';
    return name.replace(/\[[^\]]+\]$/, '');
}

function setModal($container, schema, data) {
    const settings = ['showInListingTable', 'listingWidth', 'listingTitle', 'queryableInCmsSearch'];
    const $modal = $('#field-settings-modal');
    if (!$modal.length) {
        return;
    }

    $container.append($modal);

    $modal.on('show.bs.modal', function (event) {
        const $item = $(event.relatedTarget).closest('.field-item');
        if (!$item.length) {
            return;
        }

        const prefix = rowPrefix($item);
        const index = Number((prefix.match(/\[(\d+)\]$/) || [])[1]);
        const row = (data.fields && data.fields[index]) || {};

        $modal.find('.modal-title').text($item.find('[name*="[label]"]').val() || 'Field');
        $modal.find('.field-key').text($item.find('[name*="[field]"]').val() || '');

        settings.forEach(function (name) {
            const $el = $modal.find('[data-setting="' + name + '"]');
            if (!$el.length) {
                return;
            }
            const id = fieldId(prefix + '[' + name + ']');
            $el.attr({ name: prefix + '[' + name + ']', id: id });
            $el.closest('.form-check, .mb-3').find('label').attr('for', id);
            if ($el.is(':checkbox')) {
                $el.prop('checked', !!row[name]);
            } else {
                $el.val(row[name] ?? '');
            }
        });

        validate($container, schema, data);
    });
}

function mount($container, schema, data) {
    render($container, schema, data);
    setModal($container, schema, data);
    $container.on('input change', '[name]', function () {
        apply($(this), $container, schema, data);
    });
    enhance($container);
}

export function load($container) {
    if (!$container.length) {
        return;
    }

    $.ajax({
        url: $container.attr('data-schema-url'),
        success: function (response) {
            mount($container, response.schema, response.data);
        },
        error: function () {
            $container.html('<div class="alert alert-danger mb-0">Could not load form schema.</div>');
        },
    });
}
