import $ from 'jquery';
import { propertyPathToId } from '../data';

export function render($container, errors, root) {
    $container.find('.is-invalid').removeClass('is-invalid');
    $container.find('.invalid-feedback').remove();

    (errors || []).forEach(function (error) {
        const $field = $('#' + propertyPathToId(root, error.path));
        if (!$field.length) {
            return;
        }
        $field.addClass('is-invalid');
        $('<div class="invalid-feedback d-block"></div>').text(error.message).insertAfter($field);
    });
}
