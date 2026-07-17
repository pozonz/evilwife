require('../orm/orm');

(function () {

    render();

    $(document).on('click', '.js-contentblock-default-remove', function () {
        let data = JSON.parse($('#orm_content').val() ? $('#orm_content').val() : '[]');
        let tbody = $(this).closest('tbody.js-row');
        let uuid = $(tbody).data('uuid');
        data = window._deleteObjectFromArray(uuid, data, 'uuid');
        $('#orm_content').val(JSON.stringify(data));
        render();
        return false;
    });

    $(document).on('click', '.js-contentblock-default-add', function () {
        let data = JSON.parse($('#orm_content').val() ? $('#orm_content').val() : '[]');
        data.push({
            uuid: window._uuidv4(),
            id: 'content',
            title: 'Content',
            tags: [],
        });
        $('#orm_content').val(JSON.stringify(data));
        render();
    });

}());


function render() {
    const _template = function (options = {}) {
        let tags = typeof options.tags !== 'undefined' ? options.tags : [];
        let dataItem = typeof options.dataItem !== 'undefined' ? options.dataItem : [];
        return `<tbody class="js-row" data-uuid="${dataItem.uuid}">
                    <tr>
                        <td>
                            <input type="text" class="form-control js-contentblock-default-item" data-field="title" value="${dataItem.title}" />
                        </td>
                        <td>
                            <input type="text" class="form-control js-contentblock-default-item" data-field="id" value="${dataItem.id}" />
                        </td>
                        <td>
                            <select class="form-control js-contentblock-default-item js-contentblock-default-tags" multiple data-field="tags">
                                ${tags.map(tag => `<option ${dataItem.tags.indexOf(tag.id) !== -1 ? 'selected' : ''} value="${tag.id}">${tag.title}</option>`)}
                            </select>
                        </td>
                        <td><a href="#" class="js-contentblock-default-remove text-danger"><i class="ti-close"></i></a></td>
                    </tr>
                </tbody>`;
    };

    $(".js-contentblock-default-table tbody.js-row").remove();

    let data = JSON.parse($('#orm_content').val() ? $('#orm_content').val() : '[]');
    if (data.length > 0) {
        $('.js-contentblock-default-table').show();
        $('.js-contentblock-default-noresult').hide();
    } else {
        $('.js-contentblock-default-table').hide();
        $('.js-contentblock-default-noresult').show();
    }

    for (let idx in data) {
        let dataItem = data[idx];
        $(".js-contentblock-default-table").append(_template({
            tags: window._blockTags,
            dataItem: dataItem,
            idx: idx,
        }));
    }

    $('.js-contentblock-default-table').sortable({
        items: 'tbody.js-row',
        stop: function (event, ui) {
            let data = JSON.parse($('#orm_content').val() ? $('#orm_content').val() : '[]');
            let result = [];
            $.each($(".js-contentblock-default-table tbody.js-row"), function(idx, itm) {
                let uuid = $(itm).data('uuid');
                let dataItem = window._getObjectFromArray(uuid, data, 'uuid');
                if (dataItem) {
                    result.push(dataItem);
                }
            });
            $('#orm_content').val(JSON.stringify(result));
        },
        placeholder: {
           element: function(currentItem) {
               return `<tr><td colspan="4" style="background: lightyellow; height: ${$(currentItem).height()}px">&nbsp;</td></tr>`;
           },
           update: function(container, p) {
               return;
           }
        }
    });

    $('.js-contentblock-default-tags').chosen();

    $('.js-contentblock-default-item').on('keyup change', function () {
        let tbody = $(this).closest('tbody.js-row');
        let uuid = $(tbody).data('uuid');
        let data = JSON.parse($('#orm_content').val() ? $('#orm_content').val() : '[]');
        let dataItem = window._getObjectFromArray(uuid, data, 'uuid');
        if (dataItem) {
            let field = $(this).data('field');
            let value = $(this).val();
            dataItem[field] = value;
            $('#orm_content').val(JSON.stringify(data));
        }

    });

    $.each($('.js-contentblock-default-table td'), function (key, value) {
        $(value).css('width', $(value).outerWidth() + 'px');
    });
};
