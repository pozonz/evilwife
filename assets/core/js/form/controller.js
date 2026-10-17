import { render } from './view';
import { render as errors } from './render/error';
import { fieldId } from './data';

function keysFromName(name, root) {
    const keys = [];
    const base = name.split('[', 1)[0];
    if (base && base !== root) {
        keys.push(base);
    }
    const re = /\[([^\]]*)\]/g;
    let match;
    while ((match = re.exec(name))) {
        if (match[1] !== '') {
            keys.push(match[1]);
        }
    }
    return keys;
}

function read(el) {
    if (el.type === 'checkbox') {
        return el.checked;
    }
    if (el.type === 'number') {
        return el.value === '' ? null : Number(el.value);
    }
    if (el.multiple) {
        return Array.from(el.selectedOptions).map(function (option) {
            return option.value;
        });
    }
    return el.value;
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

function apply(el, container, schema, data) {
    if (!el || !container.contains(el)) {
        return;
    }

    const keys = keysFromName(el.name, schema.name);
    if (keys.length) {
        set(data, keys, read(el));
        validate(container, schema, data);
    }
}

function validate(container, schema, data) {
    $.ajax({
        url: '/manage/model/validate',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (xhr) {
            errors(container, xhr.errors, schema.name);
        },
    });
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

function rowPrefix(item) {
    var named = item.querySelector('[name*="[widget]"], [name*="[label]"], [name*="[field]"]');
    return named ? named.name.replace(/\[[^\]]+\]$/, '') : '';
}

export function mount(container, schema, data) {
    render(container, schema, data);

    var modal = document.getElementById('field-settings-modal');
    var settings = ['showInListingTable', 'listingWidth', 'listingTitle', 'queryableInCmsSearch'];

    if (modal) {
        container.appendChild(modal);

        modal.addEventListener('show.bs.modal', function (event) {
            var item = event.relatedTarget && event.relatedTarget.closest('.field-item');
            if (!item) {
                return;
            }
            var prefix = rowPrefix(item);
            var index = Number((prefix.match(/\[(\d+)\]$/) || [])[1]);
            var row = (data && data.fields && data.fields[index]) || {};

            console.log(row);

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

            validate(container, schema, data);
        });
    }

    container.addEventListener('input', (event) => apply(event.target.closest('[name]'), container, schema, data));
    container.addEventListener('change', (event) => apply(event.target.closest('[name]'), container, schema, data));

    enhance();
}
