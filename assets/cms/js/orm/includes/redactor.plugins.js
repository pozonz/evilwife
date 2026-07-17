(function() {
    var templateCropImageRedactorInsertedHtml = function (imageData) {
        if (imageData.url) {
            return `<a href="${imageData.url}" ${imageData.target == 1  ? `target="_blank"` : ''}>
                        <img src="${imageData.src}" alt="${imageData.alt}">
                    </a>
                    ${imageData.caption ? `<figcaption>${imageData.caption}</figcaption>` : ''}`;
        } else {
            return `<img src="${imageData.src}" alt="${imageData.alt}">
                    ${imageData.caption ? `<figcaption>${imageData.caption}</figcaption>` : ''}`;
        }
    };

    var templateCropImageRedactor = function (options = {}) {
        let code = options.code;
        let width = options.width;
        let height = options.height;
        let imageSizes = options.imageSizes;
        let size = options.size;
        let alt = options.alt;
        let caption = options.caption;
        let align = options.align;
        let url = options.url;
        let target = options.target;

        return `<header id="redactor_modal_header" style="text-align: center;"><h2>Edit image</h2></header>
                <div id="redactor_modal_inner" class="js-crop-container" data-width="${width}" data-height="${height}" data-code="${code}">
                    <table class="image-cropper">
                        <tbody>
                        <tr valign="top">
                            <td>
                                <form action="" class="redactor-modal-area js-redactor-edit-image">
                                    <section class="image-settings">
                                        <label>Choose a size</label>
                                        <select id="redactor_image_size" name="size" class="form-control">
                                            <option data-code="">All sizes</option>
                                            ${imageSizes.map(imageSize => `<option ${imageSize.code == size ? 'selected' : ''} value="${imageSize.id}" data-code="${imageSize.code}">${imageSize.title}</option>`)}
                                        </select>
                                    </section>
            
                                    <section class="image-settings alt-settings" style="padding-top: 15px;">
                                        <label>Alt</label>
                                        <input type="text" name="alt" value="${alt}" class="form-control">
                                    </section>
            
                                    <section class="image-settings caption-settings" style="padding-top: 15px;">
                                        <label>Caption</label>
                                        <input type="text" name="caption" value="${caption}" class="form-control">
                                    </section>
            
                                    <section class="image-settings position-settings" style="padding-top: 15px;">
                                        <label>Position</label>
                                        <select name="align" class="form-control">
                                            <option value="none">None</option>
                                            <option ${align == 'left' ? 'selected' : ''} value="left">Left</option>
                                            <option ${align == 'center' ? 'selected' : ''} value="center">Center</option>
                                            <option ${align == 'right' ? 'selected' : ''} value="right">Right</option>
                                        </select>
                                    </section>
            
                                    <section class="image-settings link-settings" style="padding-top: 15px;">
                                        <label>Link</label>
                                        <input type="text" name="url" value="${url}" class="form-control">
                                    </section>
            
                                    <section class="image-settings link-settings" style="padding-top: 15px;">
                                        <div class="checkbox">
                                            <input id="redactor-plugin-image-edit-newtab" type="checkbox" name="target" ${target == 1 ? 'checked' : ''} />
                                            <label for="redactor-plugin-image-edit-newtab" class=""> Open link in a new tab</label>
                                        </div>
                                    </section>
                                </form>
                            </td>
                            <td width="750">
                                <table>
                                    <tbody>
                                    <tr>
                                        <td colspan="2">
                                            <div class="presets" id="preset_show">
                                                <div id="preset_crop_custom" class="js-preset-ratio" data-x="0" data-y="0"><span><i></i></span>Custom</div>
                                                <div id="preset_crop_square" class="js-preset-ratio" data-x="1" data-y="1"><span><i></i></span><b>Square</b></div>
                                                <div id="preset_crop_20_9" class="js-preset-ratio" data-x="20" data-y="9"><span><i></i></span><b>20:9</b></div>
                                                <div id="preset_crop_4_3" class="js-preset-ratio" data-x="4" data-y="3"><span><i></i></span><b>4:3</b></div>
                                                <div id="preset_crop_6_4" class="js-preset-ratio" data-x="6" data-y="4"><span><i></i></span><b>6:4</b></div>
                                                <div id="preset_crop_16_9" class="js-preset-ratio" data-x="16" data-y="9"><span><i></i></span><b>16:9</b></div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width="50%" height="350">
                                            ${fileCropping.templateLoading()}
                                            <div class="crop_area" style="display: none; height: 350px;"><label>Original</label>
                                                <div id="imageSize" class="image-size">${width}x${height}</div>
                                                <img id="image_crop" src="/images/assets/${code}">
                                            </div>
                                        </td>
                                        <td width="50%" height="350">
                                            ${fileCropping.templateLoading()}
                                            <div class="crop_area" style="display: none; height: 350px;"><label>Actual preview</label>
                                                <div id="imageSizeCrop" class="image-size"><span class="js-crop-preivew-width"></span>x<span class="js-crop-preivew-height"></span></div>
                                                <img id="previewCrop" src="" style="max-width: 320px; max-height: 350px">
                                            </div>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <footer>
                        <a href="#" class="btn btn-success btn-default js-crop-close">Close</a>
                        <input type="button" name="save" class="btn btn-success btn-fill js-crop-apply" style="background: #82ad1d;" value="Crop">
                        <input type="button" name="save" class="btn btn-primary btn-fill js-redactor-save" style="background: orange;" value="Save">
                    </footer>
                </div>`;
    }

    $R.add('plugin', 'filePicker', {
        init: function (app) {
            this.app = app;
            this.toolbar = app.toolbar;
        },
        start: function () {
            var buttonData = {
                title: 'File picker',
                api: 'plugin.filePicker.toggle'
            };
            var $button = this.toolbar.addButton('my-button', buttonData);
            $button.setIcon('<i class="re-icon-file"></i>');
        },
        toggle: function () {
            window._redactor = this;
            window._callback = function () {
                window._redactor.app.insertion.insertHtml('<a id="download-' + window._uuidv4() + '" target="_blank" href="/downloads/assets/' + $(this).closest('.js-data-item-container').data('code') + '/' + encodeURIComponent($(this).closest('.js-data-item-container').data('filename')) + '">' + $(this).closest('.js-data-item-container').find('a').attr('title') + '</a>');
                $.fancybox.close();
            };
            window._filepicker(null);
        }
    });

    $R.add('plugin', 'imagePicker', {
        init: function (app) {
            this.app = app;
            this.toolbar = app.toolbar;
        },
        start: function () {
            var buttonData = {
                title: 'Image picker',
                api: 'plugin.imagePicker.toggle'
            };
            var $button = this.toolbar.addButton('my-button', buttonData);
            $button.setIcon('<i class="re-icon-image"></i>');
        },
        toggle: function () {
            window._redactor = this;
            window._callback = function () {
                window._redactor.app.insertion.insertHtml('<img src="/images/assets/' + $(this).closest('.js-data-item-container').data('code') + '/default" alt="' + $(this).closest('.js-data-item-container').find('a').attr('title') + '">');
                $.fancybox.close();
            };
            window._filepicker(null);
        }
    });

    $R.add('module', 'image', {
        modals: {
            'image': '',
            'imageedit': ''
        },
        init: function(app)
        {
            this.app = app;
            this.opts = app.opts;
            this.lang = app.lang;
            this.caret = app.caret;
            this.utils = app.utils;
            this.editor = app.editor;
            this.storage = app.storage;
            this.component = app.component;
            this.inspector = app.inspector;
            this.insertion = app.insertion;
            this.selection = app.selection;

            // local
            this.justResized = false;
        },
        // messages
        oninsert: function()
        {
            this._observeImages();
        },
        onstarted: function()
        {
            // storage observe
            this.storage.observeImages();

            // resize
            if (this.opts.imageResizable)
            {
                this.resizer = $R.create('image.resize', this.app);
            }

            // observe
            this._observeImages();
        },
        ondropimage: function(e, files, clipboard)
        {
            if (!this.opts.imageUpload) return;

            var options = {
                url: this.opts.imageUpload,
                event: (clipboard) ? false : e,
                files: files,
                name: 'imagedrop',
                data: this.opts.imageData,
                paramName: this.opts.imageUploadParam
            };

            this.app.api('module.upload.send', options);
        },
        onstop: function()
        {
            if (this.resizer) this.resizer.stop();
        },
        onbottomclick: function()
        {
            this.insertion.insertToEnd(this.editor.getLastNode(), 'image');
        },
        onimageresizer: {
            stop: function()
            {
                if (this.resizer) this.resizer.hide();
            }
        },
        onsource: {
            open: function()
            {
                if (this.resizer) this.resizer.hide();
            },
            closed: function()
            {
                this._observeImages();
                if (this.resizer) this.resizer.rebuild();
            }
        },
        onupload: {
            complete: function()
            {
                this._observeImages();
            },
            image: {
                complete: function(response)
                {
                    this._insert(response);
                },
                error: function(response)
                {
                    this._uploadError(response);
                }
            },
            imageedit: {
                complete: function(response)
                {
                    this._change(response);
                },
                error: function(response)
                {
                    this._uploadError(response);
                }
            },
            imagedrop: {
                complete: function(response, e)
                {
                    this._insert(response, e);
                },
                error: function(response)
                {
                    this._uploadError(response);
                }
            },
            imagereplace: {
                complete: function(response)
                {
                    this._change(response, false);
                },
                error: function(response)
                {
                    this._uploadError(response);
                }
            }
        },
        onmodal: {
            image: {
                open: function($modal, $form)
                {
                    this._setUpload($modal, $form);
                }
            },
            imageedit: {
                open: function($modal, $form)
                {
                    this._setFormData($modal, $form);
                },
                opened: function($modal, $form)
                {
                    this._setFormFocus($form);
                },
                remove: function()
                {
                    this._remove(this.$image);
                },
                save: function($modal, $form)
                {
                    this._save($modal, $form);
                }
            }
        },
        onimage: {
            observe: function()
            {
                this._observeImages();
            },
            resized: function()
            {
                this.justResized = true;
            }
        },
        oncontextbar: function(e, contextbar)
        {
            if (this.justResized)
            {
                this.justResized = false;
                return;
            }

            var current = this.selection.getCurrent();
            var data = this.inspector.parse(current);
            var $img = $R.dom(current).closest('img');

            if (!data.isFigcaption() && data.isComponentType('image') || $img.length !== 0)
            {
                var node = ($img.length !== 0) ? $img.get() : data.getComponent();
                var buttons = {
                    "edit": {
                        title: this.lang.get('edit'),
                        api: 'module.image.open'
                    },
                    "remove": {
                        title: this.lang.get('delete'),
                        api: 'module.image.remove',
                        args: node
                    }
                };

                contextbar.set(e, node, buttons);
            }
        },

        // public
        open: function()
        {
            this.$image = this._getCurrent();
            this._pzImageEdit.call(this);
            // this.app.api('module.modal.build', this._getModalData());
        },
        insert: function(data)
        {
            this._insert(data);
        },
        remove: function(node)
        {
            this._remove(node);
        },

        // private
        _getModalData: function()
        {
            var modalData;
            if (this._isImage() && this.opts.imageEditable)
            {
                modalData = {
                    name: 'imageedit',
                    width: '800px',
                    title: this.lang.get('edit'),
                    handle: 'save',
                    commands: {
                        save: { title: this.lang.get('save') },
                        remove: { title: this.lang.get('delete'), type: 'danger' },
                        cancel: { title: this.lang.get('cancel') }
                    }
                };
            }
            else
            {
                modalData = {
                    name: 'image',
                    title: this.lang.get('image')
                };
            }

            return modalData;
        },
        _isImage: function()
        {
            return this.$image;
        },
        _getCurrent: function()
        {
            var current = this.selection.getCurrent();
            var data = this.inspector.parse(current);
            var $img = $R.dom(current).closest('img');

            if ($img.length !== 0) {
                return this.component.create('image', $img);
            }
            else {
                return (data.isComponentType('image') && data.isComponentActive()) ? this.component.create('image', data.getComponent()) : false;
            }
        },
        _insert: function(response, e)
        {
            this.app.api('module.modal.close');

            if (Array.isArray(response))
            {
                var obj = {};
                for (var i = 0; i < response.length; i++)
                {
                    obj = $R.extend(obj, response[i]);
                }

                response = obj;
            }
            else if (typeof response === 'string')
            {
                response = { "file": { url: response }};
            }

            if (typeof response === 'object')
            {

                var multiple = 0;
                for (var key in response)
                {
                    if (typeof response[key] === 'object') multiple++;
                }

                if (multiple > 1)
                {
                    this._insertMultiple(response, e);
                }
                else
                {
                    this._insertSingle(response, e);
                }
            }
        },
        _insertSingle: function(response, e)
        {
            for (var key in response)
            {
                if (typeof response[key] === 'object')
                {
                    var $img = this._createImageAndStore(response[key]);
                    var inserted = (e) ? this.insertion.insertToPoint(e, $img, false, false) : this.insertion.insertHtml($img, false);

                    this._removeSpaceBeforeFigure(inserted[0]);

                    // set is active
                    this.component.setActive(inserted[0]);
                    this.app.broadcast('image.uploaded', inserted[0], response);
                }
            }
        },
        _insertMultiple: function(response, e)
        {
            var z = 0;
            var inserted = [];
            var last;
            for (var key in response)
            {
                if (typeof response[key] === 'object')
                {
                    z++;

                    var $img = this._createImageAndStore(response[key]);

                    if (z === 1)
                    {
                        inserted = (e) ? this.insertion.insertToPoint(e, $img, false, false) : this.insertion.insertHtml($img, false);
                    }
                    else
                    {
                        var $inserted = $R.dom(inserted[0]);
                        $inserted.after($img);
                        inserted = [$img.get()];

                        this.app.broadcast('image.inserted', $img);
                    }

                    last = inserted[0];

                    this._removeSpaceBeforeFigure(inserted[0]);
                    this.app.broadcast('image.uploaded', inserted[0], response);
                }
            }

            // set last is active
            this.component.setActive(last);
        },
        _createImageAndStore: function(item)
        {
            var $img = this.component.create('image');

            $img.addClass('redactor-uploaded-figure');
            $img.setData({
                src: item.url,
                id: (item.id) ? item.id : this.utils.getRandomId()
            });

            // add to storage
            this.storage.add('image', $img.getElement());

            return $img;
        },
        _removeSpaceBeforeFigure: function(img)
        {
            if (!img) return;

            var prev = img.previousSibling;
            var next = img.nextSibling;
            var $prev = $R.dom(prev);
            var $next = $R.dom(next);

            if (this.opts.breakline) {
                if (next && $next.attr('data-redactor-tag') === 'br') {
                    $next.find('br').first().remove();
                }
                if (prev && $prev.attr('data-redactor-tag') === 'br') {
                    $prev.find('br').last().remove();
                }
            }

            if (prev)
            {
                this._removeInvisibleSpace(prev);
                this._removeInvisibleSpace(prev.previousSibling);
            }
        },
        _removeInvisibleSpace: function(el)
        {
            if (el && el.nodeType === 3 && this.utils.searchInvisibleChars(el.textContent) !== -1)
            {
                el.parentNode.removeChild(el);
            }
        },
        _save: function($modal, $form)
        {
            var data = $form.getData();
            var imageData = {
                title: data.title
            };

            if (this.opts.imageLink) imageData.link = { url: data.url, target: data.target };
            if (this.opts.imageCaption) imageData.caption = data.caption;
            if (this.opts.imagePosition) imageData.align = data.align;

            this.$image.setData(imageData);
            if (this.resizer) this.resizer.rebuild();

            this.app.broadcast('image.changed', this.$image);
            this.app.api('module.modal.close');
        },
        _change: function(response, modal)
        {
            if (typeof response === 'string')
            {
                response = { "file": { url: response }};
            }

            if (typeof response === 'object')
            {
                var $img;
                for (var key in response)
                {
                    if (typeof response[key] === 'object')
                    {
                        $img = $R.dom('<img>');
                        $img.attr('src', response[key].url);

                        this.$image.changeImage(response[key]);

                        this.app.broadcast('image.changed', this.$image, response);
                        this.app.broadcast('image.uploaded', this.$image, response);

                        this.app.broadcast('hardsync');

                        break;
                    }
                }

                if (modal !== false)
                {
                    $img.on('load', function() { this.$previewBox.html($img); }.bind(this));
                }
            }
        },
        _uploadError: function(response)
        {
            this.app.broadcast('image.uploadError', response);
        },
        _remove: function(node)
        {
            this.app.api('module.modal.close');
            this.component.remove(node);
        },
        _observeImages: function()
        {
            var $editor = this.editor.getElement();
            var self = this;
            $editor.find('img').each(function(node)
            {
                var $node = $R.dom(node);

                $node.off('.drop-to-replace');
                $node.on('dragover.drop-to-replace dragenter.drop-to-replace', function(e)
                {
                    e.preventDefault();
                    return;
                });

                $node.on('drop.drop-to-replace', function(e)
                {
                    if (!self.app.isDragComponentInside())
                    {
                        return self._setReplaceUpload(e, $node);
                    }
                });
            });
        },
        _setFormData: function($modal, $form)
        {
            this._buildPreview($modal);
            this._buildPreviewUpload();

            var imageData = this.$image.getData();
            var data = {
                title: imageData.title
            };

            // caption
            if (this.opts.imageCaption) data.caption = imageData.caption;
            else $modal.find('.form-item-caption').hide();

            // position
            if (this.opts.imagePosition) data.align = imageData.align;
            else $modal.find('.form-item-align').hide();

            // link
            if (this.opts.imageLink)
            {
                if (imageData.link)
                {
                    data.url = imageData.link.url;
                    if (imageData.link.target) data.target = true;
                }
            }
            else $modal.find('.form-item-link').hide();

            $form.setData(data);
        },
        _setFormFocus: function($form)
        {
            $form.getField('title').focus();
        },
        _setReplaceUpload: function(e, $node)
        {
            e = e.originalEvent || e;
            e.stopPropagation();
            e.preventDefault();

            if (!this.opts.imageUpload) return;

            this.$image = this.component.create('image', $node);

            var options = {
                url: this.opts.imageUpload,
                files: e.dataTransfer.files,
                name: 'imagereplace',
                data: this.opts.imageData,
                paramName: this.opts.imageUploadParam
            };

            this.app.api('module.upload.send', options);

            return;
        },
        _setUpload: function($modal, $form)
        {
            if (!this.opts.imageUpload) {
                var $body = $modal.getBody();
                var $tab = $body.find('.redactor-modal-tab-upload');
                $tab.remove();
            }

            var options = {
                url: this.opts.imageUpload,
                element: $form.getField('file'),
                name: 'image',
                data: this.opts.imageData,
                paramName: this.opts.imageUploadParam
            };

            this.app.api('module.upload.build', options);
        },
        _buildPreview: function($modal)
        {
            this.$preview = $modal.find('#redactor-modal-image-preview');

            var imageData = this.$image.getData();
            var $previewImg = $R.dom('<img>');
            $previewImg.attr('src', imageData.src);

            this.$previewBox = $R.dom('<div>');
            this.$previewBox.append($previewImg);

            this.$preview.html('');
            this.$preview.append(this.$previewBox);
        },
        _buildPreviewUpload: function()
        {
            if (!this.opts.imageUpload) return;

            var $desc = $R.dom('<div class="desc">');
            $desc.html(this.lang.get('upload-change-label'));

            this.$preview.append($desc);

            var options = {
                url: this.opts.imageUpload,
                element: this.$previewBox,
                name: 'imageedit',
                data: this.opts.imageData,
                paramName: this.opts.imageUploadParam
            };

            this.app.api('module.upload.build', options);
        },
        _pzImageEdit: function()
        {
            const schemeAndHttpHost = (location.protocol === 'https:' ? 'https://' : 'http://') + window.location.host;

            var _this = this;
            var imageCode = null;
            var imageSize = null;
            var parsedUrl = null;

            var data = this.$image.getData();
            var link = data.link;
            var url = typeof link == 'object' && typeof link.url !== "undefined" ? link.url : '';
            var target = typeof link == 'object' && typeof link.url !== "undefined" ? link.target : 0;

            var src = data.src;
            try {
                parsedUrl = new URL(src);
            } catch (ex) {

            }

            if (parsedUrl) {
                alert('Can not crop external linked image');
                return;
            }

            try {
                parsedUrl = new URL(src, schemeAndHttpHost);
            } catch (ex) {
            }

            if (!parsedUrl) {
                alert('Can not recognise the image URL');
                return;
            }

            var srcFragments = parsedUrl.pathname.split('/');
            if (srcFragments.length >= 4) {
                imageCode = srcFragments[3];
            }

            if (srcFragments.length >= 5) {
                imageSize = srcFragments[4];
            }

            $.ajax({
                type: 'GET',
                url: '/manage/file/size',
                data: {
                    code: imageCode,
                    size: imageSize,
                },
            }).done(function (msg) {
                if (msg.id) {
                    $('#crop-image-modal').html(templateCropImageRedactor({
                        code: msg.id,
                        width: msg.width,
                        height: msg.height,
                        imageSizes: window._imageSizes,
                        size: msg.size,
                        alt: data.title,
                        caption: data.caption,
                        align: data.align,
                        url: url,
                        target: target,
                    }));
                    fileCropping.setUpCropModal();

                    $('.js-redactor-save').on('click', function () {
                        var formData = $('.js-redactor-edit-image').serializeArray();
                        var imageData = {};
                        for (var idx in formData) {
                            var itm = formData[idx];
                            imageData[itm.name] = itm.value;
                        }

                        imageData.target = (typeof imageData.target != "undefined" && imageData.target == 'on') ? 1 : 0;

                        if (typeof imageData.align != "undefined" && imageData.align) {
                            imageData.align = 'img-' + imageData.align;
                        } else {
                            imageData.align = ''
                        }

                        var selectedImageSize = 1;
                        if (imageData.size) {
                            selectedImageSize = $('#redactor_image_size option:selected').data('code');
                        }

                        imageData.src = '/images/assets/' + imageCode + '/' + selectedImageSize + '?v=' + Math.random();
                        var current = _this.selection.getCurrent();
                        $(current).removeClass('img-left');
                        $(current).removeClass('img-right');
                        $(current).removeClass('img-center');
                        $(current).addClass(imageData.align);

                        // $(current).html('<h2>fdafsd</h2>');
                        $(current).html(templateCropImageRedactorInsertedHtml(imageData))
                        $.fancybox.close();
                    });

                } else {
                    alert('Can not crop this image');
                }
            });


        },
    });
})();
