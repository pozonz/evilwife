"use strict";


var fileCropping = {}

fileCropping = {
    init: function (options = {}) {
        window._fcCallback = null;

        fileCropping.templateLoading = function () {
            return `<img class="ajax-load" src="${window._getThickSpinner()}"/>`;
        };

        fileCropping.templateHtml = function (code, width, height, sizes) {
            return `<header id="redactor_modal_header" style="text-align: center;"><h2>Crop image</h2></header>
                        <div id="redactor_modal_inner" class="js-crop-container" data-width="${width}" data-height="${height}" data-code="${code}">
                            <table class="image-cropper">
                                <tbody>
                                <tr valign="top">
                                    <td>
                                        <section class="image-settings">
                                            <label>Choose a size</label>
                                            <select id="redactor_image_size" class="form-control">
                                                <option>All sizes</option>
                                                ${sizes.map(size => `<option value="${size.id}" data-code="${size.code}">${size.title}</option>`)}
                                            </select>
                                        </section>
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
                                                        <img id="previewCrop" src="${window._getThickSpinner()}" style="max-width: 320px; max-height: 300px">
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
                            </footer>
                        </div>`;
        }

        //Setup image crop
        $(document).on('click', '.js-cropping-options', function () {
            var ormInfo = $(this).closest('.js-data-item-container');
            $('#crop-image-modal').html(fileCropping.templateHtml(
                ormInfo.data('code'),
                ormInfo.data('width'),
                ormInfo.data('height'),
                window._imageSizes));
            fileCropping.setUpCropModal();
            return false;
        });
    },

    setUpCropModal: function () {
        $('.js-preset-ratio').click(function (e) {
            var x = $(this).data('x');
            var y = $(this).data('y');
            var width = $(this).closest('.js-crop-container').data('width');
            var height = $(this).closest('.js-crop-container').data('height');

            if (x != 0 && y != 0) {
                var ratio = x / y;
                window._jcrop_api.setOptions({
                    aspectRatio: ratio,
                });

                var w = ratio * height;
                var h = (1 / ratio) * width;

                window._jcrop_api.animateTo([0, 0, Math.min(w, width), Math.min(h, height)]);
            } else {
                window._jcrop_api.setOptions({
                    aspectRatio: 0,
                });

                window._jcrop_api.animateTo([0, 0, width, height]);
            }

            return false;
        });

        $('.js-crop-close').click(function () {
            $.fancybox.close();
        });

        $('.js-crop-apply, .js-crop-apply-close').click(function () {
            $('#previewCrop').closest('td').find('.crop_area').hide();
            $('#previewCrop').closest('td').find('.ajax-load').show();

            var width = $(this).closest('.js-crop-container').data('width');
            var height = $(this).closest('.js-crop-container').data('height');
            var assetId = $(this).closest('.js-crop-container').data('code');

            var _this = this;
            var select = window._jcrop_api.tellSelect();
            if (select) {
                var x = Math.max(0, parseInt(select.x, 10));
                var y = Math.max(0, parseInt(select.y, 10))
                var width = Math.min(width, parseInt(select.w, 10));
                var height = Math.min(height, parseInt(select.h, 10));

                var data = 'x=' + x;
                data += '&y=' + y;
                data += '&width=' + width;
                data += '&height=' + height;
                data += '&assetId=' + assetId;
                data += '&assetSizeId=' + $('#redactor_image_size').val();
                $.ajax({
                    type: 'POST',
                    url: '/manage/file/crop',
                    data: data,
                    success: function (msg) {
                        fileCropping.setCropPreview();
                        if ($(_this).hasClass('js-crop-apply-close')) {
                            if (window._fcCallback) {
                                window._fcCallback();
                            }
                            $.fancybox.close();
                        }
                    }
                });
            }
        });

        $('#redactor_image_size').change(function () {
            fileCropping.setCropPreview();
        });

        $.fancybox.open({
            href: '#crop-image-modal',
            type: 'inline',
            touch: false,
            afterShow: function () {
                var x = $('#image_crop').Jcrop({
                    boxWidth: 320,
                    boxHeight: 300,
                    allowSelect: true,
                    allowMove: true,
                    allowResize: true,
                }, function () {
                    window._jcrop_api = this;
                    fileCropping.setCropPreview();
                });
            },
            beforeClose: function () {
                if (window._fcCallback) {
                    window._fcCallback();
                }
            }
        });

        setTimeout(function () {
            $('#crop-image-modal').find('.crop_area').show();
            $('#crop-image-modal').find('.ajax-load').hide();
            $.fancybox.update();
        }, 2000);
    },

    setCropPreview: function () {
        var assetCode = $('.js-crop-container').data('code');
        var sizeCode = $('#redactor_image_size option:selected').data('code');
        $('#previewCrop').attr('src', '/images/assets/' + assetCode + (sizeCode ? '/' + sizeCode : '/1') + '?v=' + Math.random());

        $('#imageSizeCrop').find('.js-crop-preivew-width').html('...');
        $('#imageSizeCrop').find('.js-crop-preivew-height').html('...');

        var timeOuts = [2000, 5000];
        for (var idx in timeOuts) {
            var itm = timeOuts[idx];
            setTimeout(function () {
                $('#previewCrop').closest('td').find('.crop_area').show();
                $('#previewCrop').closest('td').find('.ajax-load').hide();

                var width = $('#previewCrop')[0].naturalWidth;
                var height = $('#previewCrop')[0].naturalHeight;
                $('#imageSizeCrop').find('.js-crop-preivew-width').html(width != 0 ? width : '...');
                $('#imageSizeCrop').find('.js-crop-preivew-height').html(height != 0 ? height : '...');
            }, itm);
        }
    },
};
window.fileCropping = fileCropping;