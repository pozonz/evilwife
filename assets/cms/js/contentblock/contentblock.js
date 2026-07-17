require('../orm/orm');

(function () {

    render();

    $(document).on('click', '.js-contentblock-remove', function () {
        let data = JSON.parse($('#orm_items').val() ? $('#orm_items').val() : '[]');
        let tbody = $(this).closest('tbody.js-row');
        let uuid = $(tbody).data('uuid');
        data = window._deleteObjectFromArray(uuid, data, 'uuid');
        $('#orm_items').val(JSON.stringify(data));
        render();
        return false;
    });

    $(document).on('click', '.js-contentblock-add', function () {
        let data = JSON.parse($('#orm_items').val() ? $('#orm_items').val() : '[]');
        data.push({
            uuid: window._uuidv4(),
            id: 'id',
            title: 'Title:',
            widget: 'Text',
            sql: '',
        });
        $('#orm_items').val(JSON.stringify(data));
        render();
    });

}());


function render() {
    const _template = function (options = {}) {
        let widgets = typeof options.widgets !== 'undefined' ? options.widgets : [];
        let dataItem = typeof options.dataItem !== 'undefined' ? options.dataItem : [];

        let optionsHtml = '';
        for (let idx in widgets) {
            let itm = widgets[idx];
            optionsHtml += `<option ${dataItem.widget == itm ? 'selected' : ''} value="${itm}">${idx}</option>`;
        }

        return `<tbody class="js-row" data-uuid="${dataItem.uuid}">
                    <tr>
                        <td>
                            <select class="form-control js-contentblock-item js-contentblock-widgets" data-field="widget">
                                ${optionsHtml}
                            </select>
                        </td>
                        <td>
                            <input type="text" class="form-control js-contentblock-item" data-field="title" value="${dataItem.title}" />
                        </td>
                        <td>
                            <input type="text" class="form-control js-contentblock-item" data-field="id" value="${dataItem.id}" />
                        </td>
                        <td><a href="#" class="js-contentblock-remove text-danger"><i class="ti-close"></i></a></td>
                    </tr>
                    <tr id="js-sql" style="${window._relationalWidgets.indexOf(dataItem.widget) === -1 ? 'display: none;' : ''}">
                        <td></td>
                        <td colspan="2"><textarea data-gramm_editor="false" class="form-control js-contentblock-item" data-field="sql" placeholder="SQL statement">${dataItem.sql}</textarea></td>
                        <td></td>
                    </tr>
                </tbody>`;
    };

    $(".js-contentblock-table tbody.js-row").remove();

    let data = JSON.parse($('#orm_items').val() ? $('#orm_items').val() : '[]');
    if (data.length > 0) {
        $('.js-contentblock-table').show();
        $('.js-contentblock-noresult').hide();
    } else {
        $('.js-contentblock-table').hide();
        $('.js-contentblock-noresult').show();
    }

    for (let idx in data) {
        let dataItem = data[idx];
        $(".js-contentblock-table").append(_template({
            widgets: window._blockWidgets,
            dataItem: dataItem,
            idx: idx,
        }));
    }

    $('.js-contentblock-table').sortable({
        items: 'tbody.js-row',
        stop: function (event, ui) {
            let data = JSON.parse($('#orm_items').val() ? $('#orm_items').val() : '[]');
            let result = [];
            $.each($(".js-contentblock-table tbody.js-row"), function(idx, itm) {
                let uuid = $(itm).data('uuid');
                let dataItem = window._getObjectFromArray(uuid, data, 'uuid');
                if (dataItem) {
                    result.push(dataItem);
                }
            });
            $('#orm_items').val(JSON.stringify(result));
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

    $('.js-contentblock-widgets').chosen();

    $('.js-contentblock-item').on('keyup change', function () {
        let tbody = $(this).closest('tbody.js-row');
        let uuid = $(tbody).data('uuid');
        let data = JSON.parse($('#orm_items').val() ? $('#orm_items').val() : '[]');
        let dataItem = window._getObjectFromArray(uuid, data, 'uuid');
        if (dataItem) {
            let field = $(this).data('field');
            let value = $(this).val();
            dataItem[field] = value;
            $('#orm_items').val(JSON.stringify(data));
        }

        if ($(this).hasClass('js-contentblock-widgets')) {
            render();
        }
    });

    $.each($('.js-contentblock-table td'), function (key, value) {
        $(value).css('width', $(value).outerWidth() + 'px');
    });
};
