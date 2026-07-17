require('../orm/orm');

$(function() {
    window.formFieldsId = 'orm_formFields';
    window._templateFormField = function (options = []) {
        let dataIdx = typeof options.dataIdx !== 'undefined' ? options.dataIdx : null;
        let dataItm = typeof options.dataItm !== 'undefined' ? options.dataItm : null;

        let widgetHtml = '';
        for (let idx in window._formFieldWidgets) {
            let itm = window._formFieldWidgets[idx];
            widgetHtml += `<option ${idx == dataItm.widget ? 'selected' : ''} value="${idx}">${itm}</option>`;
        }

        return `<tbody class="js-row js-row-${dataIdx}" data-idx="${dataIdx}">
                    <tr>
                        <td>
                            <select class="wgt form-control" data-dataIdx="${dataIdx}">
                                ${widgetHtml}
                            </select>
                        </td>
                        <td><input class="lbl form-control" type="text" value="${dataItm.label}"/></td>
                        <td><input class="id form-control" type="text" value="${dataItm.id}"/></td>
                        <td>
                            <div class="checkbox">
                                <input id="required-${dataIdx}" type="checkbox" class="js-req req form-control" ${dataItm.required == 1 ? 'checked' : ''}/>
                                <label for="required-${dataIdx}"></label>
                            </div>
                        </td>
                        <td>
                            <a href="#" class="js-formbuilderfield-delete text-danger"><i class="ti-close"></i></a>
                        </td>
                    </tr>
                    <tr id="err${dataIdx}" ${dataItm.required != 1 ? 'style="display: none;' : ''}>
                        <td></td>
                        <td colspan="3"><input type="text" value="${dataItm.errorMessage}" class="js-error-message error-message form-control" placeholder="Error message for mandatory field"></input></td>
                        <td></td>
                    </tr>
                    <tr style="display: none;"></tr>
                    <tr id="sql${dataIdx}" ${window._formFieldWidgetsNeedQuery.indexOf(dataItm.widget) === -1 ? 'style="display: none;"' : ''}>
                        <td></td>
                        <td colspan="3">
                            <div class="option-type">
                                <div class="row">
                                    <div class="col-lg-4">
                                        <div class="radio">
                                            <input id="option-database-${dataIdx}" type="radio" value="1" name="optType${dataIdx}" class="js-optiontype optiontype" ${dataItm.optionType == 1 ? 'checked' : ''}>
                                            <label for="option-database-${dataIdx}">Database&nbsp;options</label>
                                        </div>
                                    </div>
                                    
                                    <div class="col-lg-4">
                                        <div class="radio">
                                            <input id="option-type-${dataIdx}" type="radio" value="2" name="optType${dataIdx}" class="js-optiontype optiontype" ${dataItm.optionType == 2 ? 'checked' : ''}>
                                            <label for="option-type-${dataIdx}">Custom&nbsp;options</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="js-sql" ${dataItm.optionType != 1 ? 'style="display: none;"' : ''}>
                                <textarea data-gramm_editor="false" class="sql form-control" placeholder="SQL statement">${dataItm.sql}</textarea>
                            </div>
                            <div class="js-custom" ${dataItm.optionType != 2 ? 'style="display: none;"' : ''}>
                                <button type="button" class="mt-1 option-add btn btn-sm js-option-add">Add an option</button>
            
                                <div class="js-custom-options custom-options row mt-1">
                                    ${dataItm.options.map((option, idx) => {
                                        return `<div class="js-custom-option col-lg-6 mb-1">
                                                    <div class="row">
                                                        <div class="col-lg-5 px-1"><input type="text" class="option-key js-option-key form-control" value="${option.key}"></div>
                                                        <div class="col-lg-5 px-1"><input type="text" class="option-val js-option-val form-control" value="${option.val}"></div>
                                                        <div class="col-lg-2 pt-1"><a class="remove option-remove text-danger js-option-remove" title="Remove" data-optidx="${idx}" href="#"><i class="ti-close"></i></a></div>
                                                    </div>
                                                </div>`;
                                    }).join('')}
                                </div>
                            </div>
                        </td>
                        <td></td>
                    </tr>
                </tbody>`;
    };

    $(document).on('keydown', '#' + window.formFieldsId + '_formbuilder .form-control', function(ev) {
        if(ev.keyCode == 13) {
            ev.preventDefault();
            return false;
        }
    });

    $(document).on('keyup', '#' + window.formFieldsId + '_formbuilder .form-control', function(ev) {
        assemble();
    });

    //Add field
    $(document).on('change', '#' + window.formFieldsId + '_add', function(ev) {
        var json = JSON.parse($('#' + window.formFieldsId).val() ? $('#' + window.formFieldsId).val() : '[]');
        var itm = {
            widget: $(this).val(),
            label: 'Title:',
            id: 'id',
            required: 0,
            sql: '',
            errorMessage: '',
            optionType: 1,
            options: [],
        };
        json.push(itm);
        $('#' + window.formFieldsId).val(JSON.stringify(json));
        repaint_add(itm, json.length - 1);
        setUpSortable();
    });

    //Delete field
    $(document).on('click', '#' + window.formFieldsId + '_formbuilder .js-formbuilderfield-delete', function(ev) {
        var idx = $(this).closest('tbody.js-row').data('idx');
        var json = JSON.parse($('#' + window.formFieldsId).val() ? $('#' + window.formFieldsId).val() : '[]');
        json.splice(idx, 1);
        $('#' + window.formFieldsId).val(JSON.stringify(json));
        repaint();
        return false;
    });

    //Change whether the field is mandatory
    $(document).on('change', '#' + window.formFieldsId + '_formbuilder .js-req', function(ev) {
        var idx = $(this).closest('tbody.js-row').data('idx');
        var json = JSON.parse($('#' + window.formFieldsId).val() ? $('#' + window.formFieldsId).val() : '[]');
        json[idx].required = $(this).is(':checked') ? 1 : 0;
        $('#' + window.formFieldsId).val(JSON.stringify(json));
        repaint_update(json[idx], idx);
        setUpSortable();
        return false;
    });

    //Change widget type
    $(document).on('change', '#' + window.formFieldsId + '_formbuilder .wgt', function(ev) {
        var idx = $(this).closest('tbody.js-row').data('idx');
        var json = JSON.parse($('#' + window.formFieldsId).val() ? $('#' + window.formFieldsId).val() : '[]');
        json[idx].widget = $(this).val();
        $('#' + window.formFieldsId).val(JSON.stringify(json));
        repaint_update(json[idx], idx);
        setUpSortable();
        return false;
    });

    //Change choice option type
    $(document).on('change', '#' + window.formFieldsId + '_formbuilder .js-optiontype', function(ev) {
        var idx = $(this).closest('tbody.js-row').data('idx');
        var json = JSON.parse($('#' + window.formFieldsId).val() ? $('#' + window.formFieldsId).val() : '[]');
        json[idx].optionType = $(this).val() == 1 && $(this).is(':checked') ? 1 : 2;
        $('#' + window.formFieldsId).val(JSON.stringify(json));
        repaint_update(json[idx], idx);
        setUpSortable();
        return false;
    });

    //Delete an choice option
    $(document).on('click', '#' + window.formFieldsId + '_formbuilder .js-option-remove', function(ev) {
        var idx = $(this).closest('tbody.js-row').data('idx');
        var json = JSON.parse($('#' + window.formFieldsId).val() ? $('#' + window.formFieldsId).val() : '[]');
        json[idx].options.splice($(this).data('optidx'), 1);
        $('#' + window.formFieldsId).val(JSON.stringify(json));
        repaint_update(json[idx], idx);
        setUpSortable();
        return false;
    });

    //Add choice choice option
    $(document).on('click', '#' + window.formFieldsId + '_formbuilder .js-option-add', function(ev) {
        var idx = $(this).closest('tbody.js-row').data('idx');
        var json = JSON.parse($('#' + window.formFieldsId).val() ? $('#' + window.formFieldsId).val() : '[]');
        json[idx].options.push({
            key: '',
            val: '',
        });
        $('#' + window.formFieldsId).val(JSON.stringify(json));
        repaint_update(json[idx], idx);
        setUpSortable();
        return false;
    });

    repaint();
});

function repaint() {
    $('#' + window.formFieldsId + '_formbuilder').find('tbody').remove();
    var json = JSON.parse($('#' + window.formFieldsId).val() ? $('#' + window.formFieldsId).val() : '[]');
    if (json.length === 0) {
        var itm = {
            widget: '\\Symfony\\Component\\Form\\Extension\\Core\\Type\\EmailType',
            label: 'Email:',
            id: 'email',
            required: 1,
            sql: '',
            errorMessage: 'Please leave a valid email address',
            optionType: 1,
            options: [],
        };
        json.push(itm);
    }
    for (var idx in json) {
        var itm = json[idx];
        //Fix old data model
        if (!itm.errorMessage) {
            itm.errorMessage = '';
        }
        if (!itm.optionType) {
            itm.optionType = 1;
        }
        if (!itm.options) {
            itm.options = [];
        }
        repaint_add(itm, idx);
    }
    $('#' + window.formFieldsId).val(JSON.stringify(json));
    setUpSortable();
};

function repaint_add(itm, idx) {

    $('#' + window.formFieldsId + '_formbuilder').append(window._templateFormField({
        dataItm: itm,
        dataIdx: idx,
    }));
    $.each($('#' + window.formFieldsId + '_formbuilder td'), function (key, value) {
        $(value).css('width', $(value).outerWidth() + 'px');
    });
    $('#' + window.formFieldsId + '_add').val('');
    $('#' + window.formFieldsId + '_add').trigger("chosen:updated");
    $('#' + window.formFieldsId + '_formbuilder .wgt').chosen({
        allow_single_deselect: true
    });
};

function repaint_update(itm, idx) {
    $('#' + window.formFieldsId + '_formbuilder').find('.js-row-' + idx).replaceWith(window._templateFormField({
        dataItm: itm,
        dataIdx: idx,
    }));
    $.each($('#' + window.formFieldsId + '_formbuilder td'), function (key, value) {
        $(value).css('width', $(value).outerWidth() + 'px');
    });
    $('#' + window.formFieldsId + '_formbuilder .wgt').chosen({
        allow_single_deselect: true
    });
};

function assemble() {
    var json = [];
    $.each($('#' + window.formFieldsId + '_formbuilder tbody'), function(key, value) {
        var f = {
            widget: $(value).find('.wgt').val(),
            label: $(value).find('.lbl').val(),
            id: $(value).find('.id').val(),
            required: $(value).find('.req').is(':checked') ? 1 : 0,
            sql: $(value).find('.sql').val(),
            errorMessage: $(value).find('.js-error-message').val(),
            optionType: $(value).find('.optiontype:checked').val(),
            options: [],
        };
        $.each($(value).find('.js-custom-option'), function (optIdx, optVal) {
            f.options.push({
                key: $(optVal).find('.js-option-key').val(),
                val: $(optVal).find('.js-option-val').val(),
            })
        });
        json.push(f);
    });
    $('#' + window.formFieldsId).val(JSON.stringify(json));
};

function setUpSortable() {
    $('#' + window.formFieldsId + '_formbuilder').sortable({
        items: 'tbody',
        stop: function(event, ui) {
            assemble();
            repaint();
        },
        placeholder: {
            element: function(currentItem) {
                return $('<tr><td colspan="5" style="background: lightyellow; height: ' + $(currentItem).height() + 'px">&nbsp;</td></tr>')[0];
            },
            update: function(container, p) {
                return;
            }
        }
    });
};