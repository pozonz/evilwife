import '../cms';

require('datetimepicker-jquery/build/jquery.datetimepicker.min.css');
require('datetimepicker-jquery');

require('selectize/dist/css/selectize.default.css');
require('selectize');

require('./redactor/redactor.min.css');
require('./redactor/redactor.min.js');
require('./redactor/_plugins/table/table.js');
require('./redactor/_plugins/video/video.js');
require('./redactor/_plugins/counter/counter.js');
require('./redactor/_plugins/alignment/alignment.js');
require('./redactor/_plugins/fontsize/fontsize');
require('./redactor/_plugins/fontcolor/fontcolor');
require('./redactor/_plugins/fontfamily/fontfamily');

require('./includes/redactor.plugins');

function _filespicker(selectedFiles, callback) {
    if (selectedFiles.length > 0) {
        $.ajax({
            type: 'GET',
            url: '/manage/file/current/folder',
            data: 'currentAssetId=' + selectedFiles[0].id,
            success: function (data) {
                $('#currentFolderId').val(data.currentFolderId)

                $.fancybox.open([
                    {
                        href: '#orm-popup-container',
                        type: 'inline',
                        minWidth: 1200,
                        minHeight: 600,
                        maxWidth: 1200,
                        maxHeight: 600,
                        beforeClose: function () {
                            callback()
                        }
                    },
                ]);

                fileManager.init({
                    mode: 2,
                    selectedFiles: selectedFiles,
                });
            }
        });
    } else {
        $.fancybox.open([
            {
                href: '#orm-popup-container',
                type: 'inline',
                minWidth: 1200,
                minHeight: 600,
                maxWidth: 1200,
                maxHeight: 600,
                beforeClose: function () {
                    callback()
                }
            },
        ]);

        fileManager.init({
            mode: 2,
            selectedFiles: selectedFiles,
        });
    }
};
window._filespicker = _filespicker;

function _filepicker(currentAssetId) {
    if (!currentAssetId) {
        $.fancybox.open([
            {
                href: '#orm-popup-container',
                type: 'inline',
                touch: false,
                minWidth: 1200,
                minHeight: 600,
                maxWidth: 1200,
                maxHeight: 600,
                afterShow: function () {
                }
            },
        ]);

        fileManager.init({
            mode: 1,
        });

    } else {
        $.ajax({
            type: 'GET',
            url: '/manage/file/current/folder',
            data: 'currentAssetId=' + currentAssetId,
            success: function (data) {
                $('#currentFolderId').val(data.currentFolderId)

                $.fancybox.open([
                    {
                        href: '#orm-popup-container',
                        type: 'inline',
                        minWidth: 1200,
                        minHeight: 600,
                        maxWidth: 1200,
                        maxHeight: 600,
                        touch: false,
                    },
                ]);

                fileManager.init({
                    mode: 1,
                });
            }
        });
    }
};
window._filepicker = _filepicker;

function _getNewSection(container) {
    let fieldId = $(container).data('id');
    let contentBlockData = window._isJson($(container).find('#' + fieldId).val()) ? JSON.parse($(container).find('#' + fieldId).val()) : [];

    return {
        id: window._uuidv4(),
        title: 'Section' + (contentBlockData.length + 1),
        attr: 'section' + (contentBlockData.length + 1),
        status: 1,
        tags: [],
        blocks: [],
    };
};
window._getNewSection = _getNewSection;

function _getContentBlockData(container) {
    let fieldId = $(container).data('id');
    let contentBlockData = window._isJson($(container).find('#' + fieldId).val()) ? JSON.parse($(container).find('#' + fieldId).val()) : [];

    if (!contentBlockData.length && window._optionDefault) {
        let jsonOptionDefaultContent = JSON.parse(window._optionDefault.content);
        for (let idx in jsonOptionDefaultContent) {
            let itm = jsonOptionDefaultContent[idx];
            contentBlockData.push({
                id: window._uuidv4(),
                title: itm.title,
                attr: itm.id,
                status: 1,
                tags: itm.tags,
                blocks: [],
            });
        }
    } else if (!contentBlockData.length) {
        contentBlockData.push(window._getNewSection(container));
    }

    window._saveContentBlockData(container, contentBlockData);

    for (let sectionIdx in contentBlockData) {
        let section = contentBlockData[sectionIdx];
        for (let blockIdx in section.blocks) {
            let block = section.blocks[blockIdx];
            let dataBlk = window._getObjectFromArray(block.block, window._optionBlocks);
            block.items = dataBlk.items;
        }
    }
    return contentBlockData;
}
window._getContentBlockData = _getContentBlockData;

function _getTreeNodeTextFromBlock(block) {
    let textFields = window._getTreeNodeTextFields();
    for (let idx in textFields) {
        let itm = textFields[idx];
        if (typeof block.values[itm] !== 'undefined' && block.values[itm]) {
            return block.values[itm];
        }
    }
    return block.title;
}
window._getTreeNodeTextFromBlock = _getTreeNodeTextFromBlock;

function _getTreeNodeTextFields() {
    return ['title', 'heading', 'header'];
}
window._getTreeNodeTextFields = _getTreeNodeTextFields;

function _saveContentBlockData(container, contentBlockData) {
    let fieldId = $(container).data('id');

    contentBlockData = JSON.parse(JSON.stringify(contentBlockData));
    for (let idxSection in contentBlockData) {
        let section = contentBlockData[idxSection];
        for (let idxBlock in section.blocks) {
            let block = section.blocks[idxBlock];
            delete block.items;
        }
    }
    contentBlockData = JSON.stringify(contentBlockData)
    $(container).find('#' + fieldId).val(contentBlockData);

}
window._saveContentBlockData = _saveContentBlockData;

function _closeFancybox() {
    $.fancybox.close();
}
window._closeFancybox = _closeFancybox;

(function () {
    $(document).on('click', '.js-orm-form-preview', function () {
        $(this).closest('form').prop('target', '_blank');
    });

    $(document).on('click', '.js-orm-form-non-preview', function () {
        $(this).closest('form').removeAttr('target');
    });

    if ($('#orm-modal-submitted').length) {
        parent._closeFancybox();
    }

    $(document).on('click', '.js-orm-modal-close', function () {
        parent._closeFancybox();
    });

    window._selectedFiles = [];
    window._selectedFile = [];
    if (typeof window._optionBlocks !== 'undefined') {
        window._optionBlocks = window._optionBlocks.map(blockOption => {
            blockOption.items = JSON.parse(blockOption.items);
            return blockOption;
        });
    }

    let templateGalleryFile = function (file) {
        return `<li class="tableContent js-tableContent js-data-item-container file-box gallery-file-box" id="${file.id}" data-id="${file.id}" data-code="${file.code}" data-width="${file.width}" data-height="${file.height}" data-callback="callbackAfterDeleteFile" data-class="Asset">
                    <div class="asset-img">
                        <a class="js-cropping-options cropping-options" href="#" title="Crop this image ›">Cropping Options</a>
                        <img src="/images/assets/${file.code}/cms_small?v=${Math.random()}" alt="${file.title}" class="mceImage" border="0">
                    </div>
                    <div class="details">
                        <div class="gallery-file-title" title="${file.title}">${file.title}</div>
            
                        <div class="asset-controls">
                            <a class="js-file-delete pz-file-delete icon btn btn-simple btn-danger btn-icon table-action remove" href="#"><i class="ti-close"></i></a>
                            <div class="doc-code-meta">
                                <label>
                                    ${file.code}
                                </label>
                            </div>
                        </div>
                    </div>
                </li>`;
    };

    let templateSectionModal = function (section, isNewSection = 1) {
        return `<form>
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 class="modal-title">${isNewSection ? 'Add' : 'Edit'} section</h4>
                            </div>
                            <div class="modal-body">
                                <div class="orm-widgets">
                                    <div class="orm-widget orm-widget-full form-group" style="display: none;">
                                        <label>ID:</label>
                                        <input type="text" name="id" class="form-control" value="${section.id}">
                                    </div>
                                    
                                    <div class="orm-widget orm-widget-full form-group">
                                        <label>Section name:</label>
                                        <input type="text" name="title" placeholder="Enter a name" class="form-control" value="${section.title}">
                                    </div>
    
                                    <div class="orm-widget orm-widget-full form-group">
                                        <label>Section ID:</label>
                                        <input type="text" name="attr" placeholder="Enter a ID" class="form-control" value="${section.attr}">
                                    </div>
    
                                    <div class="orm-widget orm-widget-full form-group">
                                        <label>Tags:</label>
                                        <select name="tags" class="form-control js-chosen" multiple>
                                            <option></option>
                                            ${window._optionTags.map(tag => `<option ${section.tags.indexOf(tag.id) !== -1 ? 'selected' : ''} value="${tag.id}">${tag.title}</option>`)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="submit" class="btn btn-primary">${isNewSection ? 'Add' : 'Update'}</button>
                                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </form>`;
    };

    let templateContentBlockSection = function (options = {}) {

        let blockOptions = typeof options.blockOptions !== 'undefined' ? options.blockOptions : [];
        let section = typeof options.section !== 'undefined' ? options.section : null;
        let idx = typeof options.idx !== 'undefined' ? options.idx : null;
        let total = typeof options.total !== 'undefined' ? options.total : null;

        return `<div class="js-section js-section-${section.id}" data-id="${section.id}">
                    <h2 class="section-title section-first">
                        <span class="section-id">Section:</span>
                        <span class="js-title">${section.title}</span>
                        <span class="js-id-container">ID: <span class="section-id-number js-id">${section.attr}</span></span>
                    </h2>
            
                    <div class="section-toolbar">
                        <div class="block-add-container">
                            <select class="no-chosen js-add-block form-control">
                                <option value="">Add a block</option>
                                ${blockOptions.map(blockOption => `<option value="${blockOption.id}">${blockOption.title}</option>`)}
                            </select>
                        </div>
            
                        ${idx > 0 ? `<button type="button" class="section-move section-move-up section-edit-button js-up" data-idxsec="0" title="Move section up"></button>` : ''}
                        ${idx < total ? `<button type="button" class="section-move section-move-down section-edit-button js-down" data-idxsec="0" title="Move section down"></button>` : ''}
<!--                        <a href="#" class="js-status-section section-status section-edit-button ${section.status == 1 ? 'text-success' : 'text-danger'}" data-status="${section.status}" title="Enable / disable section"><i class="fa fa-circle"></i></a>-->
                        <a href="#" class="js-edit-section section-edit section-edit-button text-primary" title="Edit section"><i class="ti-pencil"></i></a>
                        <a href="#" class="js-delete-section section-delete section-edit-button text-danger" title="Delete section"><i class="ti-close"></i></a>
                    </div>
            
                    <div style="clear: both;"></div>
                    <div class="js-blocks section-blocks">
                        <div class="content-block block-placeholder js-no-blocks" style="display: block;"></div>
                    </div>
                </div>`;
    };

    let templateContentBlockBlock = function (options = {}) {

        let block = typeof options.block !== 'undefined' ? options.block : null;

        return `<div class="content-block pb-2 js-block js-block-${block.id}" data-id="${block.id}">
                    <div class="block-file js-heading">
                        <h4 class="block-title">${block.title}</h4>
                        <a href="#" class="delete-block active-block ${block.status == 1 ? 'text-success' : 'text-danger'} js-status-block" data-status="${block.status}" title="Enable / disable block"><i class="fa fa-circle"></i></a>
                        <a href="#" class="delete-block text-danger js-delete-block" title="Delete block"><i class="ti-close"></i></a>
                    </div>
                    <div class="clear"></div>
                    <div class="block-widgets">
                        ${block.items.map((blockItem) => {
                            let value = typeof block.values[blockItem.id] !== 'undefined' ? block.values[blockItem.id] : '';
                
                            if (blockItem.widget == 'Text') {
                                return `<div class="orm-widget form-group">
                                            <label for="${block.id}-${blockItem.id}">${blockItem.title}</label>
                                            <input id="${block.id}-${blockItem.id}" class="js-contentblock-elem form-control" data-id="${blockItem.id}" type="text" value="${value}">
                                        </div>`;
                            }
                
                            if (blockItem.widget == 'Textarea') {
                                return `<div class="orm-widget orm-widget-full form-group">
                                            <label for="${block.id}-${blockItem.id}">${blockItem.title}</label>
                                            <textarea id="${block.id}-${blockItem.id}" class="js-contentblock-elem form-control" data-id="${blockItem.id}" rows="6">${value}</textarea>
                                        </div>`;
                            }
                
                            if (blockItem.widget == 'Asset picker') {
                                return `<div class="orm-widget form-group assetpicker">
                                            <label for="${block.id}-${blockItem.id}">${blockItem.title}</label>
                                            <div class="filePickWrap js-filePickWrap js-data-item-container" data-id="${value}">
                                                <input id="${block.id}-${blockItem.id}" class="js-contentblock-elem js-fileId form-control" data-id="${blockItem.id}" type="hidden" value="${value}">
                                                <div class="filePickPreviewWrap">
                                                    <img src="" class="js-filePickFile filePickFile">
                                                    <a href="#" class="js-asset-delete text-danger" style="display: none;"><i class="ti-close"></i></a>
                                                </div>
                                                <a href="#" class="filePickButton js-asset-change" style="display: none">Pick file ›</a>
                                                <a href="#" class="cropImagePickButton js-cropping-options mr-1" style="display: none;">Crop ›</a>
                                            </div>
                                        </div>`;
                            }
                
                            if (blockItem.widget == 'Asset files picker') {
                                return `<div class="orm-widget form-group assetfilespicker">
                                            <label for="${block.id}-${blockItem.id}" class="required" style="display: inline-block;">Gallery</label>
                                            <div style="display: inline-block; margin-left: 10px;">
                                                <a href="#" class="btn btn-sm button-galery change" data-id="#orm_gallery"><i class="ti-image"></i> Manage</a>
                                                <a href="#" class="ml-1 btn btn-sm button-galery delete" data-id="#orm_gallery"><i class="fa fa-trash-o"></i> Empty</a>
                                            </div>
                                            <div class="widget style1 js-gallery-widget ibox mode-asset" style="padding: 0; margin: 1em 0 0 0;">
                                                <textarea style="display: none;" class="js-contentblock-elem form-control" data-id="${blockItem.id}" id="${block.id}-${blockItem.id}">${value}</textarea>
                                                <div class="ibox-content" style="border: none">
                                                    <div class="alert alert-info js-loading" style="display: none;">
                                                        Loading images, please wait...
                                                    </div>
                                                    <div class="alert gray-bg js-no-results" style="display: none;">
                                                        No images selected
                                                    </div>
                                                    <div class="gallery-widget">
                                                        <ul class="contentListTable assets-images ui-sortable js-gallery-container"></ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>`
                            }
                
                            if (blockItem.widget == 'Checkbox') {
                                return `<div class="orm-widget form-group checkbox">
                                            <div class="checkbox">
                                                <input id="${block.id}-${blockItem.id}" ${value == 1 ? 'checked' : ''} class="js-contentblock-elem" data-id="${blockItem.id}" type="checkbox">
                                                <label for="${block.id}-${blockItem.id}">${blockItem.title}</label>
                                            </div>
                                        </div>`;
                            }
                
                            if (blockItem.widget == 'Wysiwyg') {
                                return `<div class="orm-widget orm-widget-full form-group wysiwyg">
                                            <label for="${block.id}-${blockItem.id}">${blockItem.title}</label>
                                            <textarea id="${block.id}-${blockItem.id}" class="js-contentblock-elem form-control" data-id="${blockItem.id}">${value}</textarea>
                                        </div>`;
                            }
                
                            if (blockItem.widget == 'Date picker') {
                                return `<div class="orm-widget form-group datepicker">
                                            <label for="${block.id}-${blockItem.id}">${blockItem.title}</label>
                                            <input id="${block.id}-${blockItem.id}" class="js-contentblock-elem form-control" data-id="${blockItem.id}" type="text" value="${value}">
                                        </div>`;
                            }
                
                            if (blockItem.widget == 'Date & time picker') {
                                return `<div class="orm-widget form-group datetimepicker">
                                            <label for="${block.id}-${blockItem.id}">${blockItem.title}</label>
                                            <input id="${block.id}-${blockItem.id}" class="js-contentblock-elem form-control" data-id="${blockItem.id}" type="text" value="${value}">
                                        </div>`;
                            }
                
                            if (blockItem.widget == 'Time picker') {
                                return `<div class="orm-widget form-group timepicker">
                                            <label for="${block.id}-${blockItem.id}">${blockItem.title}</label>
                                            <input id="${block.id}-${blockItem.id}" class="js-contentblock-elem form-control" data-id="${blockItem.id}" type="text" value="${value}">
                                        </div>`;
                            }
                
                            if (blockItem.widget == 'Choice') {
                                let optionsHtml = '';
                                for (let idx in blockItem.choices) {
                                    let itm = blockItem.choices[idx];
                                    optionsHtml += `<option ${itm == value ? 'selected' : ''} value="${itm}">${idx}</option>`;
                                }
                                
                                return `<div class="orm-widget form-group choice">
                                            <label for="${block.id}-${blockItem.id}">${blockItem.title}</label>
                                            <select id="${block.id}-${blockItem.id}" class="js-contentblock-elem form-control js-elem-chosen" data-id="${blockItem.id}">
                                                ${optionsHtml}
                                            </select>
                                        </div>`;
                            }
                
                            if (blockItem.widget == 'Choice multi') {
                                value = value ? value : [];
                                let optionsHtml = '';
                                for (let idx in blockItem.choices) {
                                    let itm = blockItem.choices[idx];
                                    optionsHtml += `<option ${value.indexOf(itm) !== -1 ? 'selected' : ''} value="${itm}">${idx}</option>`;
                                }
                                
                                return `<div class="orm-widget form-group choice_multiple">
                                            <label for="${block.id}-${blockItem.id}">${blockItem.title}</label>
                                            <select id="${block.id}-${blockItem.id}" class="js-contentblock-elem form-control js-elem-chosen" data-id="${blockItem.id}" multiple>
                                                ${optionsHtml}
                                            </select>
                                        </div>`;
                            }
                
                            if (blockItem.widget == 'Placeholder') {
                                return `<div class="orm-widget form-group placeholder"></div>`;
                            }
                
                            if (blockItem.widget == 'Choice tree') {
                                return `<div class="orm-widget form-group choice">
                                            <label for="${block.id}-${blockItem.id}">${blockItem.title}</label>
                                            <select id="${block.id}-${blockItem.id}" class="js-contentblock-elem form-control js-elem-chosen" data-id="${blockItem.id}">
                                                ${blockItem.choices.map(choice => `<option style="padding-left: ${choice.level * 20}px" value="${choice.value}" ${choice.value == value ? 'selected' : ''}>${choice.label}</option>`)}
                                            </select>
                                        </div>`;
                            }
                
                            if (blockItem.widget == 'Choice tree multi') {
                                value = value ? value : [];

                                return `<div class="orm-widget form-group choice">
                                            <label for="${block.id}-${blockItem.id}">${blockItem.title}</label>
                                            <select id="${block.id}-${blockItem.id}" class="js-contentblock-elem form-control js-elem-chosen" data-id="${blockItem.id}" multiple>
                                                ${blockItem.choices.map(choice => `<option style="padding-left: ${choice.level * 20}px" value="${choice.value}" ${value.indexOf(choice.value) !== -1 ? 'selected' : ''}>${choice.label}</option>`)}
                                            </select>
                                        </div>`;
                            }
                
                            if (blockItem.widget == 'Choice sortable') {
                                let optionsHtml = '';
                                for (let idx in blockItem.choices) {
                                    let itm = blockItem.choices[idx];
                                    optionsHtml += `<div style="display: none;" class="${block.id}-${blockItem.id}-choice" data-id="${itm}" data-name="${idx}"></div>`;
                                }

                                return `<div class="orm-widget form-group choice_sortable">
                                            <label for="${block.id}-${blockItem.id}">${blockItem.title}</label>
                                            <input id="${block.id}-${blockItem.id}" class="js-contentblock-elem js-elem-selectize" data-id="${blockItem.id}" type="text" value="${value}">
                                            ${optionsHtml}
                                        </div>`;
                            }
                
                            if (blockItem.widget == 'Multiple key value pair') {
                                return `<div class="orm-widget orm-widget-full form-group mkvp">
                                            <a href="#" class="insertKVP js-add mkvp-add btn btn-default btn-sm pull-right">Add a row</a>
                                            <label for="${block.id}-${blockItem.id}">${blockItem.title}</label>
                                            <div class="pt-1">
                                                <textarea style="display: none;" class="js-contentblock-elem" data-id="${blockItem.id}">${value}</textarea>
                                                <table class="table table-bordered" style="display: none;">
                                                    <tbody></tbody>
                                                </table>
                                                <div class="alert alert-default js-no-data" style="display: none;">No data added</div>
                                            </div>
                                        </div>`;
                            }
                        }).join('')}
                    </div>
                    <div class="clear"></div>
                </div>`;
    };

    let templateDraftNameModal = function (name = '', id = '') {
        return `<form>
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 class="modal-title">${id ? 'Edit draft name' : 'Save a new draft'}</h4>
                            </div>

                            <div class="modal-body">
                                <div class="orm-widgets">      
                                    <div class="orm-widget orm-widget-full form-group" style="display: none;">
                                        <label>ID:</label>
                                        <input type="text" name="id" class="form-control" value="${id}">
                                    </div>
                             
                                    <div class="orm-widget orm-widget-full form-group">
                                        <label>Draft name:</label>
                                        <input type="text" name="title" placeholder="Enter a name" class="form-control" value="${name}">
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="submit" class="btn btn-primary">${id ? 'Update' : 'Save'}</button>
                                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </form>`;
    };

    $('#draft-name-modal').on('shown.bs.modal', function (e) {
        $('#draft-name-modal form').validate({
            rules: {
                title: "required",
            },
        });
        $('#draft-name-modal form').submit(function (ev) {
            ev.preventDefault();
            if ($(this).valid()) {
                let id = $(this).find('[name=id]').val();
                let name = $(this).find('[name=title]').val();

                if (id === '') {
                    $('#orm___draftName').val(name);
                    $('.js-save-as-draft-submit').click();
                } else {
                    let dataContaienr = $('.js-data-container');
                    let className = $(dataContaienr).data('class');
                    $.ajax({
                        type: 'GET',
                        url: '/manage/data/draft',
                        data: {
                            className: className,
                            id: id,
                            name: name,
                        },
                        success: function (data) {
                            location.reload();
                        }
                    });
                    $('#draft-name-modal').modal('hide');
                }
            }
            return false;
        });
    });

    $(document).on('click', '.js-save-as-draft-modal', function () {
        $('#draft-name-modal').html(templateDraftNameModal());
        $('#draft-name-modal').modal('show');
        return false;
    });

    $(document).on('click', '.js-draft-item-edit', function () {
        var dataItemContaienr = $(this).closest('.js-data-item-container');
        $('#draft-name-modal').html(templateDraftNameModal($(dataItemContaienr).data('draft'), $(dataItemContaienr).data('id')));
        $('#draft-name-modal').modal('show');
        return false;
    });

    $(document).on('switchChange.bootstrapSwitch change', '.js-orm-form-checkbox', function () {
        let field = $(this).data('field');
        let value = $(this).is(':checked') ? 0 : 1;

        let elemId = '#orm_' + field + '_' + value;
        $(elemId).prop('checked', 'checked')
    });

    $(document).on('click', '#orm-popup-container #file-manager-container a.js-image-select', function () {
        window._callback.call(this);
        return false;
    });

    $(document).on('click', '#orm-popup-container #file-manager-container .js-image-select-multi', function () {
        $(this).closest('li').find('.js-image-select-multi-checkbox').click();
        return false;
    });

    $(document).on('click', '#orm-popup-container #file-manager-container .js-select-all', function () {
        $.each($(this).closest('#file-manager-container').find('.js-data-item-container :checkbox').toArray().reverse(), function (idx, itm) {
            if (!$(itm).is(':checked')) {
                $(itm).prop('checked', 'checked');
                window._callback.call(itm);
            }
        });
        return false;
    });

    $(document).on('click', '#orm-popup-container #file-manager-container .js-deselect-all', function () {
        $.each($(this).closest('#file-manager-container').find('.js-data-item-container :checkbox'), function (idx, itm) {
            if ($(itm).is(':checked')) {
                $(itm).removeAttr('checked', 'checked');
                window._callback.call(itm);
            }
        });
        return false;
    });

    $(document).on('click', '#orm-popup-container #file-manager-container .js-image-select-multi-checkbox', function () {
        window._callback.call(this);
    });

    let renderElements = function (container, callback) {
        $.each($(container).find('.mkvp'), function (idx, itm) {
            var rawValue = $(itm).find('textarea').val();
            var jsonValue = window._isJson(rawValue) ? JSON.parse(rawValue) : [];

            var render = function (mkvps) {
                if (mkvps.length > 0) {
                    $(itm).find('table').show();
                    $(itm).find('.js-no-data').hide();
                } else {
                    $(itm).find('table').hide();
                    $(itm).find('.js-no-data').show();
                }

                $(itm).find('table').find('tbody').remove();
                for (var key in mkvps) {
                    var mkvp = mkvps[key];
                    $(itm).find('table').append(
                        `<tbody class="js-row"><tr>
                        <td><input class="js-key js-input form-control" type="text" value="${mkvp.key}"></td>
                        <td><input class="js-value js-input form-control" type="text" value="${mkvp.value}"></td>
                        <td><a class="js-delete text-danger" data-idx="${idx}" href="#"><i class="ti-close"></i></a></td>
                    </tr></tbody>`
                    )
                }

                $(itm).find('table').sortable({
                    items: 'tbody.js-row',
                    stop: function (event, ui) {
                        changeValue(mkvps);
                    },
                    placeholder: {
                        element: function (currentItem) {
                            return $('<tr><td colspan="3" style="background: lightyellow; height: ' + $(currentItem).height() + 'px">&nbsp;</td></tr>')[0];
                        },
                        update: function (container, p) {
                            return;
                        }
                    }
                });

                $.each($(itm).find('table').find('tbody.js-row').find('td'), function (key, td) {
                    $(td).css('width', $(td).outerWidth() + 'px');
                });

                changeValue(mkvps);
            };

            var changeValue = function (mkvps) {
                $.each($(itm).find('table').find('tbody.js-row'), function (key, tbody) {
                    mkvps[key].key = $(tbody).find('.js-key').val();
                    mkvps[key].value = $(tbody).find('.js-value').val();
                    $(tbody).find('.js-delete').data('idx', key);
                });
                $(itm).find('textarea').val(JSON.stringify(mkvps));

                if (callback) {
                    callback();
                }
            };

            $(itm).on('keyup', '.js-input', function () {
                changeValue(jsonValue);
            });

            $(itm).on('click', '.js-add', function () {
                jsonValue.push({
                    key: '',
                    value: '',
                });
                render(jsonValue);

                if (callback) {
                    callback();
                }
                return false;
            });

            $(itm).on('click', '.js-delete', function () {
                var idx = $(this).data('idx');
                jsonValue.splice(idx, 1);
                render(jsonValue);

                if (callback) {
                    callback();
                }
                return false;
            });

            render(jsonValue);
        });

        $.each($(container).find('.datepicker'), function (idx, itm) {
            $(itm).find('input').datetimepicker({
                timepicker: false,
                format: 'd F Y',
                scrollInput: false,
            });
        });

        $.each($(container).find('.datetimepicker'), function (idx, itm) {
            $(itm).find('input').datetimepicker({
                step: 5,
                format: 'd F Y H:i',
                scrollInput: false,
            });
        });

        $.each($(container).find('.timepicker'), function (idx, itm) {
            $(itm).find('input').datetimepicker({
                timepicker: true,
                datepicker: false,
                step: 5,
                format: 'H:i',
                scrollInput: false,
            });
        });

        $.each($(container).find('.choice_sortable'), function (idx, itm) {
            var id = $(itm).find('.js-elem-selectize').attr('id');
            var choiceClass = id + '-choice';
            var options = [];
            $.each($('.' + choiceClass), function (choiceIdx, choiceItm) {
                options.push({
                    id: $(choiceItm).data('id'),
                    name: $(choiceItm).data('name'),
                });
            });

            $(itm).find('.js-elem-selectize').selectize({
                plugins: ['restore_on_backspace', 'remove_button', 'drag_drop'],
                persist: false,
                maxItems: null,
                valueField: 'id',
                labelField: 'name',
                searchField: ['name'],
                options: options,
                createFilter: function (input) {
                    return false;
                },
                create: function (input) {
                    return false;
                }
            });
        });

        $.each($(container).find('.choice_tree_multi'), function (idx, itm) {
            $(itm).on('change', '.js-choice-multi', function () {
                $(this).prev('input').val(JSON.stringify($(this).val()));
            });
        });

        $.each($(container).find('.choice_multi'), function (idx, itm) {
            $(itm).on('change', '.js-choice-multi', function () {
                $(this).prev('input').val(JSON.stringify($(this).val()));
            });
        });

        $.each($(container).find('.assetfilespicker'), function (idx, itm) {
            var elemId = $(itm).find('textarea').attr('id');

            var getFiles = function () {
                var elemId = $(itm).find('textarea').attr('id');
                var value = $(itm).find('textarea').val();
                var jsonValue = window._isJson(value) ? JSON.parse(value) : [];

                $(itm).find('.js-gallery-container').removeClass('no-result');
                $(itm).find('.js-gallery-container').html(`<img src="${window._getThinSpinner()}" alt="Loading..." />`);

                $.ajax({
                    type: 'POST',
                    url: '/manage/file/files/chosen',
                    data: 'files=' + encodeURIComponent(JSON.stringify(jsonValue)),
                    success: function (data) {
                        window._selectedFiles[elemId] = data;
                        renderFiles();
                    }
                });
            };

            var renderFiles = function () {
                var elemId = $(itm).find('textarea').attr('id');
                var data = window._selectedFiles[elemId];
                $(itm).find('.js-gallery-container').empty();

                for (var idxValue in data) {
                    var itmValue = data[idxValue];
                    $(itm).find('.js-gallery-container').append(templateGalleryFile(itmValue));
                }

                if (!data.length) {
                    $(itm).find('.js-gallery-container').addClass('no-result');
                    $(itm).find('.js-gallery-container').html('<li class="no-result">No files selected</li>');
                }

                $(itm).find('.js-gallery-container').sortable({
                    stop: function () {
                        var data = $(itm).find('.js-gallery-container').sortable("toArray");
                        $(itm).find('textarea').val(JSON.stringify(data));
                        var selectedFiles = window._selectedFiles[elemId];
                        window._selectedFiles[elemId] = data.map(itm => {
                            for (var idxValue in selectedFiles) {
                                var itmValue = selectedFiles[idxValue];
                                if (itmValue.id == itm) {
                                    return itmValue;
                                }
                            }
                            return null;
                        });

                        if (callback) {
                            callback();
                        }
                    }
                });
            };

            if (typeof window._selectedFiles[elemId] !== 'undefined') {
                renderFiles();
            } else {
                getFiles();
            }

            $(itm).on('click', '.change', function (ev) {
                var _this = this;
                window._callback = function () {
                    var checked = $(this).is(':checked');

                    var textarea = $(_this).closest('.assetfilespicker').find('textarea');
                    var elemId = $(textarea).attr('id');
                    var value = $(textarea).val();
                    var jsonValue = window._isJson(value) ? JSON.parse(value) : [];

                    var ormInfo = $(this).closest('.js-data-item-container');
                    if (checked) {

                        if (jsonValue.indexOf(ormInfo.data('id')) === -1) {
                            jsonValue.unshift(ormInfo.data('id') + '');
                            window._selectedFiles[elemId].unshift({
                                id: ormInfo.data('id') + '',
                                title: ormInfo.data('title'),
                                code: ormInfo.data('code'),
                                width: ormInfo.data('width'),
                                height: ormInfo.data('height'),
                            });
                        }

                    } else {

                        for (var idxValue in jsonValue) {
                            var itmValue = jsonValue[idxValue];
                            if (itmValue == ormInfo.data('id')) {
                                jsonValue.splice(idxValue, 1);
                            }
                        }

                        for (var idxValue in window._selectedFiles[elemId]) {
                            var itmValue = window._selectedFiles[elemId][idxValue];
                            if (itmValue.id == ormInfo.data('id')) {
                                window._selectedFiles[elemId].splice(idxValue, 1);
                            }
                        }
                    }

                    textarea.val(JSON.stringify(jsonValue));

                    if (callback) {
                        callback();
                    }
                };

                var elemId = $(itm).find('textarea').attr('id');
                window._filespicker(window._selectedFiles[elemId], function () {
                    renderFiles();
                });

                return false;
            });

            $(itm).on('click', '.delete', function (ev) {
                var elemId = $(itm).find('textarea').attr('id');
                $(itm).find('textarea').val(JSON.stringify([]));
                window._selectedFiles[elemId] = [];
                renderFiles();
                return false;
            });

            $(itm).on('click', '.pz-file-delete', function () {
                var textarea = $(itm).find('textarea');
                var elemId = $(textarea).attr('id');
                var value = $(textarea).val();
                var jsonValue = window._isJson(value) ? JSON.parse(value) : [];

                var id = $(this).closest('.js-data-item-container').data('id');
                for (var idxValue in jsonValue) {
                    var itmValue = jsonValue[idxValue];
                    if (itmValue == id) {
                        jsonValue.splice(idxValue, 1);
                    }
                }
                for (var idxValue in window._selectedFiles[elemId]) {
                    var itmValue = window._selectedFiles[elemId][idxValue];
                    if (itmValue.id == id) {
                        window._selectedFiles[elemId].splice(idxValue, 1);
                    }
                }

                $(this).closest('.js-data-item-container').remove();
                textarea.val(JSON.stringify(jsonValue));
                return false;
            });
        });

        $.each($(container).find('.assetpicker'), function (idx, itm) {
            var elemId = $(itm).find('input').attr('id');
            var fileId = $(itm).find('.js-data-item-container').data('id');

            var getFile = function () {
                $.ajax({
                    type: 'GET',
                    url: '/manage/file/get/file',
                    data: 'id=' + fileId,
                    success: function (data) {
                        window._selectedFile[elemId] = data;
                        renderFile();
                    }
                });
            };
            var renderFile = function () {
                $(itm).find('.js-filePickFile').show();

                var data = window._selectedFile[elemId];
                if (data.id) {
                    $(itm).find('.js-data-item-container').data('code', data.code);
                    $(itm).find('.js-data-item-container').data('width', data.width);
                    $(itm).find('.js-data-item-container').data('height', data.height);

                    $(itm).find('.js-filePickFile').attr('src', '/images/assets/' + data.code + '/cms_small');
                    $(itm).find('.js-filePickFile').show();
                    $(itm).find('.js-asset-delete').show();
                    $(itm).find('.js-cropping-options').show();
                    $(itm).find('.js-asset-change').show();

                } else {
                    $(itm).find('.js-data-item-container').data('code', '');
                    $(itm).find('.js-data-item-container').data('width', '');
                    $(itm).find('.js-data-item-container').data('height', '');

                    $(itm).find('.js-filePickFile').attr('src', `${window._getSpacer()}`);
                    $(itm).find('.js-filePickFile').show();
                    $(itm).find('.js-asset-delete').hide();
                    $(itm).find('.js-cropping-options').hide();
                    $(itm).find('.js-asset-change').show();
                }
            };

            if (elemId && typeof window._selectedFile[elemId] !== 'undefined') {
                renderFile();
            } else {
                getFile();
            }

            $(itm).on('click', '.js-asset-change', function (ev) {
                var _this = this;
                window._callback = function () {
                    var widgetContainer = $(_this).closest('.js-filePickWrap');

                    var ormInfo = $(this).closest('.js-data-item-container');
                    widgetContainer.find('.js-fileId').val(ormInfo.data('id'));
                    widgetContainer.find('.js-filePickFile').attr('src', '/images/assets/' + ormInfo.data('code') + '/cms_small');
                    widgetContainer.data('id', ormInfo.data('id'));
                    widgetContainer.data('code', ormInfo.data('code'));
                    widgetContainer.data('width', ormInfo.data('width'));
                    widgetContainer.data('height', ormInfo.data('height'));
                    widgetContainer.find('.js-asset-delete').show();
                    widgetContainer.find('.js-cropping-options').show();
                    window._selectedFile[elemId] = {
                        id: ormInfo.data('id'),
                        code: ormInfo.data('code'),
                        width: ormInfo.data('width'),
                        height: ormInfo.data('height'),
                    };

                    if (callback) {
                        callback();
                    }

                    $.fancybox.close();
                };

                var ormInfo = $(this).closest('.js-data-item-container');
                window._filepicker(ormInfo.data('id'));
                return false;
            });

            $(itm).on('click', '.js-asset-delete', function (ev) {
                var widgetContainer = $(this).closest('.js-filePickWrap')
                widgetContainer.find('.js-fileId').val('');
                widgetContainer.find('.js-filePickFile').attr('src', `${window._getSpacer()}`);
                widgetContainer.find('.js-asset-delete').hide();
                widgetContainer.find('.js-cropping-options').hide();
                window._selectedFile[elemId] = {};
                if (callback) {
                    callback();
                }
                return false;
            });
        });

        var redactorPlugins = window._redactorPlugins ? window._redactorPlugins.split(',') : [];
        var plugins = ['counter', 'table', 'line'];
        plugins = plugins.concat(redactorPlugins);
        $.each($(container).find('.wysiwyg'), function (idx, itm) {
            $(itm).find('textarea').redactor({
                buttonsAdd: ['line'],
                plugins: plugins,
                minHeight: '300px',
                imageResizable: false,
                imageFigure: true,
                // imageEditable: false,
                imagePosition: {
                    "left": "img-left",
                    "right": "img-right",
                    "center": "img-center"
                },
                callbacks: {
                    image: {
                        changed: function (image) {
                        }
                    },
                    changed: function (e) {
                        if (callback) {
                            callback();
                        }
                    }
                },
            });
        });

        $(container).find('.js-elem-chosen:visible').chosen({
            allow_single_deselect: true,
        });
    }
    renderElements($('body'), null);

    $.each($('.js-fragment-container'), function (idx, container) {
        let sectionModalId = $(container).find('.js-section-modal').attr('href');
        $(sectionModalId).on('shown.bs.modal', function (e) {
            $(sectionModalId).find('select.js-chosen:visible').chosen({
                allow_single_deselect: true,
            });
            $(sectionModalId + ' form').validate({
                rules: {
                    title: "required",
                    attr: "required",
                },
            });
            $(sectionModalId + ' form').submit(function (ev) {
                ev.preventDefault();
                if ($(this).valid()) {
                    let contentBlockData = window._getContentBlockData(container);
                    let sectionId = $(this).find('[name=id]').val();
                    let section = window._getObjectFromArray(sectionId, contentBlockData);
                    if (section) {
                        section.title = $(this).find('[name=title]').val();
                        section.attr = $(this).find('[name=attr]').val();
                        section.tags = $(this).find('[name=tags]').val();
                    } else {
                        window._newSection.title = $(this).find('[name=title]').val();
                        window._newSection.attr = $(this).find('[name=attr]').val();
                        window._newSection.tags = $(this).find('[name=tags]').val();
                        contentBlockData.push(window._newSection);
                    }

                    window._saveContentBlockData(container, contentBlockData);
                    $(sectionModalId).modal('hide');
                    render();
                }
                return false;
            });
        });

        $(container).on('keyup', '.js-contentblock-elem', function () {
            let contentBlockData = window._getContentBlockData(container);
            contentBlockData = update(contentBlockData, this);
            window._saveContentBlockData(container, contentBlockData);
        });
        $(container).on('change', '.js-contentblock-elem', function () {
            let contentBlockData = window._getContentBlockData(container);
            contentBlockData = update(contentBlockData, this);
            window._saveContentBlockData(container, contentBlockData);

            if (window._getTreeNodeTextFields().indexOf($(this).data('id')) !== -1) {
                render_sidebar();
            }
        });

        //Set up delete section & enable/disable status
        $(container).on('change', '.js-add-block', function () {
            let contentBlockData = window._getContentBlockData(container);
            let blockOption = window._getObjectFromArray($(this).val(), window._optionBlocks);
            let section = window._getObjectFromArray($(this).closest('.js-section').data('id'), contentBlockData);
            let block = {
                id: window._uuidv4(),
                title: blockOption.title,
                status: 1,
                block: blockOption.id,
                twig: blockOption.twig,
                values: {},
            };
            for (var idx in blockOption.items) {
                var itm = blockOption.items[idx];
                block.values[itm.id] = '';
            }
            section.blocks.push(block);
            window._saveContentBlockData(container, contentBlockData);
            $(this).val('');
            render();
        });
        $(container).on('click', '.js-delete-block', function () {
            let contentBlockData = window._getContentBlockData(container);

            var blockId = $(this).closest('.js-block').data('id');
            var sectionId = $(this).closest('.js-section').data('id');

            var section = window._getObjectFromArray(sectionId, contentBlockData);
            window._deleteObjectFromArray(blockId, section.blocks);
            window._saveContentBlockData(container, contentBlockData);
            render();
            return false;
        });
        $(container).on('click', '.js-status-block', function () {
            let contentBlockData = window._getContentBlockData(container);

            var blockId = $(this).closest('.js-block').data('id');
            var sectionId = $(this).closest('.js-section').data('id');

            var section = window._getObjectFromArray(sectionId, contentBlockData);
            var block = window._getObjectFromArray(blockId, section.blocks);
            block.status = $(this).data('status') == 1 ? 0 : 1;

            $(this).data('status', block.status);
            $(this).removeClass('text-success text-danger');
            $(this).addClass(block.status == 1 ? 'text-success' : 'text-danger');

            window._saveContentBlockData(container, contentBlockData);
            render_sidebar();
            return false;
        });

        //Add / edit section
        $(container).on('click', '.js-section-modal', function () {
            window._newSection = window._getNewSection(container)
            $(sectionModalId).html(templateSectionModal(window._newSection));
            $(sectionModalId).modal('show');
        });
        $(container).on('click', '.js-status-section', function () {
            let contentBlockData = window._getContentBlockData(container);

            var sectionId = $(this).closest('.js-section').data('id');
            var section = window._getObjectFromArray(sectionId, contentBlockData);
            section.status = $(this).data('status') == 1 ? 0 : 1;

            $(this).data('status', section.status);
            $(this).removeClass('text-success text-danger');
            $(this).addClass(section.status == 1 ? 'text-success' : 'text-danger');

            window._saveContentBlockData(container, contentBlockData);
            render_sidebar();
            return false;
        });
        $(container).on('click', '.js-edit-section', function () {
            let contentBlockData = window._getContentBlockData(container);

            var sectionId = $(this).closest('.js-section').data('id');
            var section = window._getObjectFromArray(sectionId, contentBlockData);

            $(sectionModalId).html(templateSectionModal(section, 0));
            $(sectionModalId).modal('show');

            return false;
        });
        $(container).on('click', '.js-delete-section', function () {
            let contentBlockData = window._getContentBlockData(container);
            let sectionId = $(this).closest('.js-section').data('id');
            window._deleteObjectFromArray(sectionId, contentBlockData);
            window._saveContentBlockData(container, contentBlockData);
            render();
            return false;
        });

        //Set up sections sort
        $(container).on('click', '.js-section .js-down', function () {
            let contentBlockData = window._getContentBlockData(container);
            let sectionId = $(this).closest('.js-section').data('id');
            let idx = window._getIndexFromArray(sectionId, contentBlockData);
            if (contentBlockData.length > (idx + 1)) {
                let section = contentBlockData[idx];
                contentBlockData[idx] = contentBlockData[idx + 1];
                contentBlockData[idx + 1] = section;
                window._saveContentBlockData(container, contentBlockData);
                render();
            }
            return false;
        });
        $(container).on('click', '.js-section .js-up', function () {
            let contentBlockData = window._getContentBlockData(container);
            let sectionId = $(this).closest('.js-section').data('id');
            let idx = window._getIndexFromArray(sectionId, contentBlockData);
            if (idx > 0) {
                let section = contentBlockData[idx];
                contentBlockData[idx] = contentBlockData[idx - 1];
                contentBlockData[idx - 1] = section;
                window._saveContentBlockData(container, contentBlockData);
                render();
            }
            return false;
        });

        let update = function (contentBlockData, elem) {
            let blockItemId = $(elem).data('id');
            let blockId = $(elem).closest('.js-block').data('id');
            let sectionId = $(elem).closest('.js-section').data('id');

            let section = window._getObjectFromArray(sectionId, contentBlockData);
            let block = window._getObjectFromArray(blockId, section.blocks);

            let value = $(elem).val();
            if ($(elem).is(':checkbox')) {
                value = $(elem).is(':checked') ? 1 : 0;
            }

            block.values[blockItemId] = value;
            return contentBlockData;
        }
        let updateAll = function () {
            let contentBlockData = window._getContentBlockData(container);
            $.each($(container).find('.js-contentblock-elem'), function (idx, itm) {
                update(contentBlockData, itm);
            });
            window._saveContentBlockData(container, contentBlockData);
        };

        let render = function () {
            render_content();
            render_sidebar();
        };
        let render_content = function () {
            let fieldId = $(container).data('id');
            $(container).find('#' + fieldId + '_container').empty();

            let contentBlockData = window._getContentBlockData(container);
            for (let idx in contentBlockData) {
                let section = contentBlockData[idx];
                let filteredOptionBlocks = [];
                for (let idxBlk in window._optionBlocks) {
                    let dataBlk = window._optionBlocks[idxBlk];
                    dataBlk.tags = dataBlk.tags ? dataBlk.tags : '';
                    if (typeof dataBlk.tags == 'string') {
                        let tags = section.tags.filter(value => -1 !== dataBlk.tags.indexOf(`"${value}"`));
                        if (tags.length || !section.tags.length) {
                            filteredOptionBlocks.push(dataBlk);
                        }
                    }
                }

                $(container).find('#' + fieldId + '_container').append(templateContentBlockSection({
                    blockOptions: filteredOptionBlocks,
                    section: section,
                    idx: idx,
                    total: contentBlockData.length - 1,
                }));

                for (let idxBlk in section.blocks) {
                    let block = section.blocks[idxBlk];
                    $(container).find('.js-section-' + section.id + ' .js-blocks').append(templateContentBlockBlock({
                        block: block,
                    }));
                }

                if (!section.blocks.length) {
                    $(container).find('.js-section-' + section.id + ' .js-blocks .js-no-blocks').fadeIn();
                } else {
                    $(container).find('.js-section-' + section.id + ' .js-blocks .js-no-blocks').hide();
                }
            }

            $(container).find('.js-blocks').sortable({
                connectWith: ".js-blocks",
                handle: '.js-heading',
                // items: '.js-block',
                stop: function (event, ui) {
                    let contentBlockData = window._getContentBlockData(container);

                    var allBlocks = [];
                    for (var idx in contentBlockData) {
                        var itm = contentBlockData[idx];
                        allBlocks = allBlocks.concat(itm.blocks);
                    }

                    let data = [];
                    $.each($('.js-section'), function (sectionIdx, sectionItm) {
                        let section = window._getObjectFromArray($(sectionItm).data('id'), contentBlockData);
                        section.blocks = [];
                        $.each($(sectionItm).find('.js-block'), function (blockIdx, blockItm) {
                            let block = window._getObjectFromArray($(blockItm).data('id'), allBlocks);
                            section.blocks.push(block);
                        });
                        data.push(section);
                    });

                    window._saveContentBlockData(container, data);
                    render();
                },
                placeholder: {
                    element: function (currentItem) {
                        return $('<div class="panel panel-default js-block" colspan="3" style="background: lightyellow; height: ' + $(currentItem).height() + 'px">&nbsp;</div>')[0];
                    },
                    update: function (container, p) {
                        return;
                    }
                }
            });

            $(container).find('select.js-after-chosen').chosen({
                allow_single_deselect: true
            });

            renderElements($(container), function () {
                updateAll();
            });
        };
        let render_sidebar = function () {
            $('.js-sidebar-tree-container').show();
            let contentBlockData = window._getContentBlockData(container);

            var data = [];
            for (var sectionIdx in contentBlockData) {
                var section = contentBlockData[sectionIdx];
                var node = {
                    id: section.id,
                    text: section.title,
                    state: {
                        opened: true,
                        selected: false
                    },
                    children: [],
                    type: section.status == 1 ? 'section' : 'section-disabled',
                };
                for (var blockIdx in section.blocks) {
                    var block = section.blocks[blockIdx];
                    node.children.push({
                        id: block.id,
                        text: window._getTreeNodeTextFromBlock(block),
                        type: block.status == 1 ? 'block' : 'block-disabled',
                    })
                }
                data.push(node);
            }

            $('.js-sidebar-tree').html(`<div></div>`)
            $('.js-sidebar-tree div').jstree({
                core: {
                    check_callback: true,
                    data: data,
                },
                'plugins': ['types', 'dnd'],
                'types': {
                    "#": {
                        "valid_children": ["section"]
                    },
                    "section": {
                        'icon': 'fa fa-folder-open-o',
                        "valid_children": ["block"]
                    },
                    "section-disabled": {
                        'icon': 'fa fa-folder-open-o text-danger',
                        "valid_children": ["block"]
                    },
                    "block": {
                        'icon': 'fa fa-file-o',
                        "valid_children": [],
                    },
                    "block-disabled": {
                        'icon': 'fa fa-file-o text-danger',
                        "valid_children": [],
                    },
                },
            }).on('ready.jstree',
                function () {
                }
            );

            $('.js-sidebar-tree div').bind("move_node.jstree", function (e, data) {
                var nodes = $(this).jstree().get_json('#', {
                    flat: true
                });

                let contentBlockData = window._getContentBlockData(container);

                var allBlocks = [];
                for (var idx in contentBlockData) {
                    var itm = contentBlockData[idx];
                    allBlocks = allBlocks.concat(itm.blocks);
                }

                var data = [];
                for (var idx in nodes) {
                    var itm = nodes[idx];
                    if (itm.parent == '#') {
                        var section = window._getObjectFromArray(itm.id, contentBlockData);
                        section.blocks = [];
                        for (var idxBlk in nodes) {
                            var blk = nodes[idxBlk];
                            if (blk.parent == itm.id) {
                                section.blocks.push(window._getObjectFromArray(blk.id, allBlocks));
                            }
                        }
                        data.push(section);
                    }
                }

                window._saveContentBlockData(container, data);
                render_content();
            });

            $('.js-sidebar-tree div').on("select_node.jstree", function (e, data) {
                if (data.node.parent == '#') {
                    var selector = '.js-section-' + data.node.id;
                } else {
                    var selector = '.js-block-' + data.node.id;
                }
                $("html, body").animate({
                    scrollTop: $(selector).offset().top
                });
            });
        };

        render();
    });
})();


