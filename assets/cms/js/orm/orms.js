require('../cms');

import 'nestable';

require('datetimepicker-jquery/build/jquery.datetimepicker.min.css');
require('datetimepicker-jquery');

// import (`../${window._theme}/custom/css/nestable1.css`);

(function() {
    window._ajax = null;

    $(document).on('click', '.js-model-note-save', function (ev) {
        ev.preventDefault();

        var noteElem = $('.js-model-note-content');

        $.ajax({
            type: 'POST',
            url: '/manage/model/note',
            data: {
                className: $(noteElem).data('model'),
                note: $(noteElem).val(),
            },
            success : function(msg) {
                if (msg.note) {
                    $('.js-model-note-display').show();
                } else {
                    $('.js-model-note-display').hide();
                }
                $('.js-model-note-display > div').text(msg.note);
                $('#js-model-note-dialog').modal('hide');
            }
        });

        return false;
    });

    //init
    if ($('.js-datepicker input').length) {
        $('.js-datepicker input').datetimepicker({
            timepicker: false,
            format: 'd F Y',
            scrollInput: false,
        });
    }

    if ($('#nestable').length) {
        $('#nestable').nestable({ group: 1 }).on('change', update);

        $.each($('.dd-item'), function (idx, itm) {
            if ($(itm).hasClass('dd-collapsed')) {
                $(itm).find('button[data-action="collapse"]').hide();
                $(itm).find('button[data-action="expand"]').show();
            } else {
                $(itm).find('button[data-action="collapse"]').show();
                $(itm).find('button[data-action="expand"]').hide();
            }
        });

        //what?
        $(document).on('click', '.dd-empty', function() {
            $('#' + $(this).parent().attr('for')).click();
        });

        //closed
        $(document).on('click', '.dd-item button', function () {
            var dataContaienr = $(this).closest('.js-data-container');
            var className = $(dataContaienr).data('class');

            $.ajax({
                type: 'POST',
                url: '/manage/tree/closed',
                data: 'id=' + $(this).parent().data('id') + '&closed=' + ($(this).parent().hasClass('dd-collapsed') ? 1 : 0) + '&className=' + className,
                success : function(msg) {

                }
            });
        });
    }

})();


function update() {
    if (_ajax) _ajax.abort();

    var dataContaienr = $(this).closest('.js-data-container');
    var className = $(dataContaienr).data('class');

    var root = {
        id: 0,
        children: $('#nestable').nestable('serialize'),
    }
    var data = toArray(root);

    window._ajax = $.ajax({
        type: 'POST',
        url: '/manage/tree/sort',
        data: '&data=' + encodeURIComponent(JSON.stringify(data)) + '&className=' + className,
        success : function(msg) {
        }
    });
};

function toArray(node) {
    var result = [];
    for (var idx in node.children) {
        var itm = node.children[idx];
        result.push({
            id: itm.id,
            parentId: node.id,
            rank: idx,
        });
        result = result.concat(toArray(itm));
    }
    return result;
};