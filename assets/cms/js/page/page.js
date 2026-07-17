require('../orm/orm');

function _changePageType() {
    let redirectFields = ['orm_redirectTo'];
    let commonFields = ['orm_title', 'orm_type', 'orm_url', 'orm_hideFromFrontendNav', 'orm_hideFromCmsNav', 'orm_allowExtra', 'orm_maxParams'];

    if ($('#orm_type').val() == 2) {
        $('.orm-widget').hide();

        let redirectAndCommonFields = redirectFields.concat(commonFields);
        for (let idx in redirectAndCommonFields) {
            let itm = redirectAndCommonFields[idx];
            if ($('#' + itm).length) {
                $('#' + itm).closest('.orm-widget').show();
            }
        }

    } else {

        $('.orm-widget').show();

        for (let idx in redirectFields) {
            let itm = redirectFields[idx];
            if ($('#' + itm).length) {
                $('#' + itm).closest('.orm-widget').hide();
            }
        }
    }
}
window._changePageType = _changePageType;

(function() {
    $.each($('.js-page-template-widget'), function (idx, itm) {
        $(itm).on('change', 'select', function () {
            var value = $(this).val();
            $(itm).find('.js-template-id').val(value);
            if (value) {
                $(itm).find('.js-template-new').hide();
            } else {
                $(itm).find('.js-template-new').show();
                var templateName = $(itm).find('.js-template-name').val();
                var templateFile = $(itm).find('.js-template-file').val();
                if (templateName && templateFile) {
                    $(itm).find('.js-template-id').val(JSON.stringify({
                        name: templateName,
                        file: templateFile,
                    }));
                }
            }
        });

        $(itm).on('keyup', '.js-template-name, .js-template-file', function () {
            var templateName = $(itm).find('.js-template-name').val();
            var templateFile = $(itm).find('.js-template-file').val();
            if (templateName && templateFile) {
                $(itm).find('.js-template-id').val(JSON.stringify({
                    name: templateName,
                    file: templateFile,
                }));
            }
        });

        var value = $(itm).find('select').val();
        if (!value) {
            $(itm).find('.js-template-new').show();
            var templateName = $(itm).find('.js-template-name').val();
            var templateFile = $(itm).find('.js-template-file').val();
            if (templateName && templateFile) {
                $(itm).find('.js-template-id').val(JSON.stringify({
                    name: templateName,
                    file: templateFile,
                }));
            }
        }
    });

    window._changePageType();
    $(document).on('change', '#orm_type', function () {
        window._changePageType();
    });

})();

