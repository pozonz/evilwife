require('../cms');

import 'nestable';

// import (`../${window._theme}/custom/css/nestable1.css`);

(function() {

    window._ajax = null;
    window._cat = $('[name="category"]:checked').data('id');

    //init
    $('#nestable').nestable({ group: 1 }).on('change', update);

    //...
    $('.other').nestable({ group: 1 });
    $(document).on('mouseout', '.other', function() {
        setTimeout(function() {
            $.each($('.other'), function(key, value) {
                if ($(value).children().length == 0) {
                    $(value).html('<div class="dd-empty"></div>');
                }
            });
        }, 1500);
    });

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

    //category
    $(document).on('click', '[name=category]', function() {
        $('label.dd').css('cursor', 'wait');
        $('label.dd').attr('disabled', 'disabled');
        $('#nestable').html('Loading...');
        location.href = '?cat=' + $(this).data('id');
    });

    //closed
    $(document).on('click', '.dd-item button', function () {
        $.ajax({
            type: 'POST',
            url: '/manage/page/closed',
            data: 'id=' + $(this).parent().data('id') + '&closed=' + ($(this).parent().hasClass('dd-collapsed') ? 1 : 0) + '&cat=' + _cat,
            success : function(msg) {

            }
        });
    });

    countCat();

})();

function countCat() {
    $.ajax({
        type: 'GET',
        url: '/manage/page/category/count',
        success : function(msg) {
            var reuslt = msg;
            $.each($('.other'), function(key, value) {
                var count = reuslt['cat' + $(value).data('id')] ?  reuslt['cat' + $(value).data('id')] : 0;
                $(value).parent().find('span.number').html('(' + count + ')');
            });
        }
    });
};

function update() {
    if (_ajax) _ajax.abort();

    var ignoreMe = false;
    $.each($('.other'), function(key, value) {
        var items = $(value).nestable('serialize');
        if (items.length > 0) {
            if (_cat != $(value).data('id')) {
                $.ajax({
                    type: 'POST',
                    url: '/manage/page/change',
                    data: 'oldCat=' + _cat + '&newCat=' + $(value).data('id') + '&id=' + items[0].id,
                    success : function(msg) {
                        $(value).html('<div class="dd-empty"></div>');
                        countCat();
                    }
                });
                ignoreMe = true;
            } else {
                $(value).html('<div class="dd-empty"></div>');
                $('#nestable').html('Loading...');
                location.reload();
            }
        }
    });

    if (!ignoreMe) {
        var root = {
            id: 0,
            children: $('#nestable').nestable('serialize'),
        }
        var data = toArray(root);

        window._ajax = $.ajax({
            type: 'POST',
            url: '/manage/pages/sort',
            data: 'cat=' + _cat + '&data=' + encodeURIComponent(JSON.stringify(data)),
            success : function(msg) {
            }
        });
    }
};

function toArray(node) {
    var result = [];
    for (var idx in node.children) {
        var itm = node.children[idx];
        result.push({
            id: itm.id,
            parentId: node.id,
            rank: idx,
            cat: _cat
        });
        result = result.concat(toArray(itm));
    }
    return result;
};