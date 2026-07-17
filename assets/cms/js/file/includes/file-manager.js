"use strict";

var callbackAfterDeleteFile = function (dataItemContaienr) {
    let id = $(dataItemContaienr).data('id');
    for (let idx in fileManager.files) {
        let itm = fileManager.files[idx];
        if (itm.id == id) {
            fileManager.files.splice(idx, 1);
            fileManager.renderFiles();
        }
    }
};
window.callbackAfterDeleteFile = callbackAfterDeleteFile;

var fileManager = {}
fileManager = {
    init: function (options = {}) {
        window.__currentFolderId = $('#currentFolderId').length ? $('#currentFolderId').val() : 0;
        window.__keyword = $('#currentKeyword').length ? $('#currentKeyword').val() : '';
        window.__pageNum = $('#currentPageNum').length ? $('#currentPageNum').val() : 1;

        fileManager.currentFolderId = window.__currentFolderId;
        fileManager.currentFolderId = isNaN(fileManager.currentFolderId) ? 0 : fileManager.currentFolderId;
        fileManager.keyword = window.__keyword;
        fileManager.filesPageNum = window.__pageNum;

        window.__returnUrl = location.pathname + '?currentFolderId=' + fileManager.currentFolderId;
        if (fileManager.keyword) {
            window.__returnUrl = location.pathname + '?keyword=' + fileManager.keyword;
        }

        fileManager.options = options;
        fileManager.mode = options.mode;
        fileManager.selectedFiles = typeof options.selectedFiles !== 'undefined' ? options.selectedFiles : [];
        fileManager.selectedFileIds = fileManager.selectedFiles.map(itm => itm.id);

        window.callbackAfterDeleteFolder = (dataItemContaienr) => {
            fileManager.selectFolder($(dataItemContaienr).data('parent'));
            $('.js-nav .addForm').html('');
            fileManager.getNav();
            fileManager.getFiles();
            fileManager.getFolders();
        };

        fileManager.templateLoading = () => {
            return `<img height="20" width="20" src="${window._getThinSpinner()}" />`;
        };

        fileManager.templateFolder = function (keyword) {

            var treeHtml = `<div class="jstree"></div>`;
            var searchHtml = `<a href="#" class="js-reset">&#10096; Browse by folders</a>`;

            return `<form novalidate method="get" autocomplete="off">
                        <div class="input-group">
                            <input type="text" class="form-control js-search pz-search" name="keyword" value="${keyword}">
                            <span class="input-group-btn">
                                <button type="button" class="btn btn-default js-search-button"><i class="fa fa-search"></i></button>
                            </span>
                        </div>
                    </form>
                    ${keyword ? searchHtml : treeHtml}
                    <div class="clearfix"></div>`;
        };

        fileManager.templateFile = function (file, options = []) {
            var mode = typeof options['mode'] != 'undefined' ? options['mode'] : 1;
            var returnUrl = typeof options['returnUrl'] != 'undefined' ? options['returnUrl'] : '';
            var keyword = typeof options['keyword'] != 'undefined' ? options['keyword'] : '';
            var status = typeof options['status'] != 'undefined' ? options['status'] : 1;

            return `<li class="file-box tableContent js-data-item-container js-sortable-item" id="${file.id}" data-id="${file.id}" data-code="${file.code}" data-width="${file.width}" data-height="${file.height}" data-value="${file._status}" data-title="${file.title}" data-filename="${file.fileName}" data-callback="callbackAfterDeleteFile" data-class="Asset">
                        <div class="asset-img">
                            ${mode == 0 && file.isImage == 1 ? `<a class="js-cropping-options cropping-options" href="#" title="Crop this image ›">Cropping Options</a>` : ''}
                            ${mode == 0 ? `<a href="/manage/section/files/orms/Asset/${file.id}?returnUrl=${window.__returnUrl}" title="${file.title}"><img src="/images/assets/${file.code}/cms_small?v=${encodeURIComponent(file._modified)}" alt="${file.title}" class="mceImage" border="0"></a>` : ''}
                            ${mode == 1 ? `<a class="js-image-select" href="#" title="${file.title}"><img src="/images/assets/${file.code}/cms_small?v=${encodeURIComponent(file._modified)}" alt="${file.title}" class="mceImage" border="0"></a>` : ''}
                            ${mode == 2 ? `<a class="js-image-select-multi" href="#" title="${file.title}"><img src="/images/assets/${file.code}/cms_small?v=${encodeURIComponent(file._modified)}" alt="${file.title}" class="mceImage" border="0"></a>` : ''}                           
                        </div>
                        <div class="details">
                            <a href="/downloads/assets/${file.id}/${encodeURIComponent(file.fileName)}" title="${file.title}" target="_blank">${window._highlight(file.title, keyword)}</a>
                
                            <div class="asset-controls">
                                <a class="js-data-item-button-status icon btn btn-simple ${file._status == 1 ? 'btn-success' : 'btn-danger'} btn-icon table-action edit" href="#" data-original-title="Enable / Disable"><i class="fa fa-circle"></i></a>
                                ${mode == 0 ? `<a class="icon btn btn-simple btn-default btn-icon table-action edit" href="/manage/section/files/orms/Asset/${file.id}?returnUrl=${window.__returnUrl}" title="${file.title}"><i class="ti-pencil"></i></a>` : ''}
                                <a class="js-data-item-button-delete icon btn btn-simple btn-danger btn-icon table-action remove" href="#"><i class="ti-close"></i></a>
                
                                <div class="doc-code-meta">
                                    ${mode == 2 ? 
                                        `<div class="checkbox"><input id="file${file.id}" class="js-image-select-multi-checkbox" type="checkbox" ${fileManager.selectedFileIds.indexOf(file.id) !== -1 ? 'checked' : ''}><label for="file${file.id}">${window._highlight(file.code, keyword)}</label></div>` 
                                        : `<label for="file${file.id}">${window._highlight(file.code, keyword)}</label>`}                                                   
                                </div>
                            </div>
                        </div>
                    </li>`;
        };

        fileManager.templateFiles = function (keyword) {
            return `<ul id="filesImageList" class="contentListTable assets-images ui-sortable js-data-container js-sortable-container" data-sortable-options='{"cursorAt":{"right":170}}' data-class="Asset">
                        ${keyword ? '' : '<li class="dropzone-wrap" id="dropzone-wrap"><div><form class="dropzone-custom dz-clickable dropzone" action="/manage/file/upload" id="cmsFormDropzone"></form></div></li>'}
                    </ul>`;
        };

        fileManager.templateNav = function (keyword, currentFolder, path) {
            var pathItemsHtml = '';
            if (!keyword) {
                var pathHtml = path.map(itm =>
                    currentFolder.id != itm.id ?
                        `<li><a href="#" data-id=${itm.id} title="${itm.title}">${itm.title}</a></li>`
                        : `<li class="active"><strong title="${itm.title}">${itm.title}</strong></li>`)
                pathItemsHtml = `<div><ol class="breadcrumb pull-left">${pathHtml.join('')}</ol></div>`;
            } else {
                pathItemsHtml = `<div style="padding: 8px 15px;">Search results for <strong class="">${keyword}</strong></div>`;
            }

            var buttonsHtml = '';
            if (!keyword) {
                var buttonsSelectAllHtml = `<button class="js-select-all btn btn-sm btn-simple"><i class="fa fa-toggle-on"></i>&nbsp;Select all</button>`;
                var buttonsDeselectAllHtml = `<button class="js-deselect-all btn btn-sm btn-simple"><i class="fa fa-toggle-off"></i>&nbsp;Deselect all</button>`;
                var buttonsChangeHtml = `<button class="js-change-folder-name btn btn-primary" data-toggle="modal" data-target="#js-change-folder-name-dialog">Rename folder</button>`;
                var buttonsAddHtml = `<button class="js-add-subfolder btn btn-primary" data-toggle="modal" data-target="#js-add-subfolder-dialog">Add subfolder</button>`;
                var buttonsDeleteHtml = `<button class="js-data-item-button-delete btn btn-primary">Delete folder</button>`;
                buttonsHtml = `<div class="addForm pull-right js-data-container js-data-item-container" id="${currentFolder.id}" data-class="Asset" data-id="${currentFolder.id}" data-title="${currentFolder.title}" data-callback="callbackAfterDeleteFolder" data-parent="${currentFolder.parentId}">
                                    ${fileManager.mode == 2 ? buttonsSelectAllHtml : ''}
                                    ${fileManager.mode == 2 ? buttonsDeselectAllHtml : ''}
                                    ${currentFolder.id != 0 ? buttonsChangeHtml : ''}
                                    ${buttonsAddHtml}
                                    ${currentFolder.id != 0 ? buttonsDeleteHtml : ''}
                                </div>`
            }


            return `<div id="h1">
                        ${pathItemsHtml}
                        ${buttonsHtml}
                    </div>
                    <div class="clearfix"></div>`;
        };

        fileManager.ajaxFile = null;
        fileManager.ajaxFolder = null;
        fileManager.ajaxNav = null;

        // fileManager.keyword = '';
        fileManager.files = [];
        fileManager.folders = [];
        fileManager.currentFolder = null;
        fileManager.path = [];

        fileManager.getFolders();
        fileManager.getFiles();
        fileManager.getNav();

        //Remove previous events
        $('#file-manager-container').off();

        //Setup select folder events
        $('#file-manager-container').find('.jstree-anchor').off();
        $('#file-manager-container').on('click', '.jstree-anchor', function () {
            fileManager.selectFolder($(this).parent().attr('id'));

            $('.js-nav .addForm').html('');
            fileManager.filesPageNum = 1;

            fileManager.getFiles();
            fileManager.getNav();
            return false;
        });

        //Setup breadcrumb events
        $('#file-manager-container').find('.js-nav .breadcrumb a').off();
        $('#file-manager-container').on('click', '.js-nav .breadcrumb a', function () {
            fileManager.selectFolder($(this).data('id'));
            $('.js-nav .addForm').html('');
            fileManager.getNav();
            fileManager.getFiles();
            fileManager.getFolders();

            return false;
        });

        //Setup search events
        $('#file-manager-container').find('.js-search').off();
        $('#file-manager-container').on('change', '.js-search', function () {
            fileManager.keyword = $(this).val();
            fileManager.filesPageNum = 1;
            fileManager.renderFolders();
            fileManager.renderNav();
            fileManager.getFiles();
        });
        $('#file-manager-container').find('.js-search-button').off();
        $('#file-manager-container').on('click', '.js-search-button', function () {
            fileManager.keyword = $('.js-search').val();
            fileManager.renderFolders();
            fileManager.renderNav();
            fileManager.getFiles();
        });

        //Setup reset search events
        $('#file-manager-container').find('.js-reset').off();
        $('#file-manager-container').on('click', '.js-reset', function () {
            fileManager.keyword = '';
            fileManager.renderFolders();
            fileManager.renderNav();
            fileManager.getFiles();
            return false;
        });
        //Setup move file events
        $('#file-manager-container').mousedown(function (ev) {
            fileManager.currentFileId = $(ev.target).data('id');
            if (!fileManager.currentFileId) {
                var parentLi = $(ev.target).closest('.js-data-item-container');
                fileManager.currentFileId = $(parentLi).data('id');
            }
        });
        $('#file-manager-container').mouseup(function (ev) {
            if ($(ev.target).closest('li.jstree-node').attr('aria-selected') != 'true') {
                var targetFolderId = $(ev.target).closest('li.jstree-node').attr('id')
                if (fileManager.currentFileId && targetFolderId) {
                    for (var idx in fileManager.files) {
                        var itm = fileManager.files[idx];
                        if (itm.id == fileManager.currentFileId) {
                            fileManager.files.splice(idx, 1)
                        }
                    }
                    fileManager.renderFiles();
                    $.ajax({
                        type: 'POST',
                        url: '/manage/file/move',
                        data: 'parentId=' + targetFolderId + '&id=' + fileManager.currentFileId,
                        success: function (data) {
                        }
                    });
                }
            }
            fileManager.currentFileId = null;
        });

        $('#js-change-folder-name-dialog form').validate({
            rules: {
                name: "required",
            },
        });
        $('#js-change-folder-name-dialog form').submit(function (ev) {
            ev.preventDefault();
            if ($(this).valid()) {
                $.ajax({
                    type: 'POST',
                    url: '/manage/file/edit/folder',
                    data: {
                        id: fileManager.currentFolderId,
                        title: $(this).find('input[name=name]').val(),
                    },
                    success: function (data) {
                        $('#js-change-folder-name-dialog').find('input[name=name]').val(''),
                            $('#js-change-folder-name-dialog').modal('hide');
                        fileManager.getFolders();
                        fileManager.getNav();
                    }
                });
            }
            return false;
        });

        $('#js-add-subfolder-dialog form').validate({
            rules: {
                name: "required",
            },
        });
        $('#js-add-subfolder-dialog form').submit(function (ev) {
            ev.preventDefault();
            if ($(this).valid()) {
                $.ajax({
                    type: 'POST',
                    url: '/manage/file/add/folder',
                    data: {
                        title: $(this).find('input[name=name]').val(),
                        parentId: fileManager.currentFolderId,
                    },
                    success: function (data) {
                        $('#js-add-subfolder-dialog').find('input[name=name]').val(''),
                            $('#js-add-subfolder-dialog').modal('hide');
                        fileManager.getFolders();
                        fileManager.getNav();
                    }
                });
            }
            return false;
        });

        $('#file-manager-container').on('click', '.js-files-pagenum', function () {
            fileManager.filesPageNum = $(this).data('pagenum');
            fileManager.getFiles();
            return false;
        });
    },

    getFolders: function () {
        $('#js-folders').html(fileManager.templateLoading());

        if (fileManager.ajaxFolder) {
            fileManager.ajaxFolder.abort();
        }
        fileManager.ajaxFolder = $.ajax({
            type: 'GET',
            url: '/manage/file/folders',
            data: 'currentFolderId=' + fileManager.currentFolderId,
            success: function (data) {
                fileManager.folders = data.folders;
                fileManager.renderFolders()
            }
        });
    },

    getFiles: function () {
        // $('.file-manager').css('position', '')
        $('.js-extra-stuff').hide();
        $('.js-files-pagination').hide();

        // $('#js-files').html(fileManager.templateFiles(fileManager.keyword));
        $('#js-files').html(`
            <img src="${window._getThickSpinner()}" style="max-width: 320px; max-height: 300px">
        `);

        window.__returnUrl = location.pathname + '?currentFolderId=' + fileManager.currentFolderId;
        if (fileManager.keyword) {
            window.__returnUrl = location.pathname + '?keyword=' + fileManager.keyword;
        }

        if (fileManager.ajaxFile) {
            fileManager.ajaxFile.abort();
        }
        fileManager.ajaxFile = $.ajax({
            type: 'GET',
            url: '/manage/file/files',
            data: 'currentFolderId=' + fileManager.currentFolderId + '&keyword=' + fileManager.keyword + '&pageNum=' + fileManager.filesPageNum,
            success: function (data) {
                fileManager.files = data.files;
                fileManager.filesTotal = data.total;
                fileManager.filesPageNum = data.pageNum;
                fileManager.renderFiles();
            }
        });
    },

    getNav: function () {
        // $('.js-nav > div').css('opacity', '.1');

        if (fileManager.ajaxNav) {
            fileManager.ajaxNav.abort();
        }
        fileManager.ajaxNav = $.ajax({
            type: 'GET',
            url: '/manage/file/nav',
            data: 'currentFolderId=' + fileManager.currentFolderId,
            success: function (data) {
                fileManager.currentFolder = data.currentFolder;
                fileManager.path = data.path;
                fileManager.renderNav();

                if (fileManager.path.length > 1) {
                    $('#js-change-folder-name-dialog').find('input[name=name]').val(fileManager.path[fileManager.path.length - 1].title);
                }
            }
        });
    },

    renderFolders: function () {
        $('#js-folders').html(fileManager.templateFolder(fileManager.keyword));

        $('#js-folders .jstree').jstree({
            core: {
                check_callback: function (operation, node, node_parent, node_position, more) {
                    if (!node_parent.parent) {
                        return false;
                    }
                    return true;
                },
                data: [fileManager.folders],
            },
            search: {
                show_only_matches: true
            },
            plugins: ['types', 'dnd', 'search'],
            types: {
                default: {
                    'icon': 'fa fa-folder-open-o'
                },
            }
        });
        $('#js-folders .jstree').bind("move_node.jstree", function (e, data) {
            var nodes = $(this).jstree().get_json('#', {
                flat: true
            });
            var data = [];
            for (var idx in nodes) {
                var itm = nodes[idx];
                if (itm.parent != '#') {
                    data.push({
                        id: itm.id,
                        parentId: itm.parent,
                        _rank: idx,
                    });
                }
            }
            $.ajax({
                type: 'POST',
                url: '/manage/file/folders/update',
                data: 'data=' + encodeURIComponent(JSON.stringify(data)),
                success: function (data) {
                }
            });
        });
    },

    renderFiles: function () {
        $('#js-files').html(fileManager.templateFiles(fileManager.keyword));

        // let myDropzone = new Dropzone("#cmsFormDropzone");

        $("#cmsFormDropzone").dropzone({
            url: "/manage/file/upload",
            params: {
                parentId: fileManager.currentFolderId,
            },
            previewTemplate: '<div></div>',
            complete: function (file, done) {
                var result = jQuery.parseJSON(file.xhr.responseText);
                fileManager.files.unshift(result.asset);

                if (this.getUploadingFiles().length === 0 && this.getQueuedFiles().length === 0) {
                    fileManager.renderFiles();
                    return;
                }

                $('#dropzone-wrap').after(fileManager.templateFile(result.asset, {
                    mode: fileManager.mode,
                    returnUrl: encodeURI(window.__returnUrl),
                    keyword: fileManager.keyword
                }));
            }
        });

        for (var idx in fileManager.files) {
            var itm = fileManager.files[idx];
            $('#js-files > ul').append(fileManager.templateFile(itm, {
                mode: fileManager.mode,
                returnUrl: encodeURI(window.__returnUrl),
                keyword: fileManager.keyword
            }));
        }

        window._initSortable();

        if (fileManager.filesTotal > 1) {
            var whole = 11;
            var half = (whole - 1) / 2;

            fileManager.filesPageNum = parseInt(fileManager.filesPageNum, 10);

            if (fileManager.filesTotal > (fileManager.filesPageNum + half)) {
                var start = Math.max(fileManager.filesPageNum - half, 1);
                var end = Math.min(start + whole - 1, fileManager.filesTotal);
            } else {
                var start = Math.max(fileManager.filesTotal - whole + 1, 1);
                var end = fileManager.filesTotal;
            }

            $('.js-files-pagination ul').empty()
            for (var i = start, il = end; i <= il; i++) {
                $('.js-files-pagination ul').append('<li ' + (fileManager.filesPageNum == i ? 'class="active"' : '') + '><a href="#" class="js-files-pagenum" data-pagenum="' + i + '">' + i + '</a></li>')
            }

            $('.js-files-pagination').show()
        } else {
            $('.js-files-pagination').hide()
        }

        if ($('#file-manager-container').parent().attr('id') === 'orm-popup-container') {
            $.fancybox.update()
        } else {
            $('html, body').animate({
                scrollTop: 0
            }, 1000, 'easeInOutQuint');
        }

        if (fileManager.mode == 2) {
            // $('.file-manager').css('position', 'absolute')
            $('.js-extra-stuff').show();
        }
    },

    renderNav: function () {
        $('.js-nav').html(fileManager.templateNav(
            fileManager.keyword,
            fileManager.currentFolder,
            fileManager.path
        ));
    },

    selectFolder: function (folderId) {
        fileManager.currentFolderId = folderId;
        fileManager.currentFolderId = isNaN(fileManager.currentFolderId) ? 0 : fileManager.currentFolderId;
        window.__currentFolderId = fileManager.currentFolderId;
        $('#currentFolderId').val(window.__currentFolderId);
    },

    getById: function (data, id) {
        for (var idx in data) {
            var itm = data[idx];
            if (itm.id == id) {
                return itm;
            }
        }
        return null;
    },
};
window.fileManager = fileManager;
