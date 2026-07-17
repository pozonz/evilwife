require('../orm/orm');

function _getVariants() {
    $('.js-product-variants-table').find('tbody').remove();
    $('.js-product-variants-table').append('');

    var templateProductVariantListItemHtml = function (options = []) {
        let variant = typeof options.variant !== 'undefined' ? options.variant : null;

        let stockValue = variant.stock != null ? variant.stock : '';
        if (variant.stockEnabled != 1) {
            stockValue = '-';
        } else {
            if (!stockValue || stockValue == 0) {
                stockValue = 'Out of stock';
            } else {
                if (stockValue <= variant.alertIfLessThan) {
                    stockValue += ' (Low)';
                }
            }
        }

        return `<tbody class="js-sortable-item js-data-item-container" id="${variant.id}" data-id="${variant.id}" data-value="${variant._status}" >
                    <tr class="column">
                        <td>${variant.title != null ? variant.title : ''}</td>
                        <td>${variant.sku != null ? variant.sku : ''}</td>
                        <td>${variant.price ? '$' : ''}${window._formatMoney(variant.price)}</td>
                        <td>${variant.salePrice ? '$' : ''}${window._formatMoney(variant.salePrice)}</td>
                        <td class="">${stockValue}</td>
                        <td>
                            <a class="js-data-item-button-status btn btn-simple btn-icon table-action edit ${variant._status == 1 ? 'btn-success' : 'btn-danger'}" href="#" title="Enable / Disable"><i class="fa fa-circle"></i></a>
                            <a class="js-edit-variant btn btn-simple btn-default btn-icon table-action edit" href="#" title="Edit"><i class="ti-pencil"></i></a>
                            <a class="js-copy-variant btn btn-simple btn-default btn-icon table-action copy" href="#" title="Copy"><i class="ti-files"></i></a>
                            <a class="js-data-item-button-delete btn btn-simple btn-danger btn-icon table-action remove" href="#" title="Remove"><i class="ti-close"></i></a>
                        </td>
                    </tr>
                </tbody>`;
    };

    $('.js-product-variants-table').hide();
    $('.js-product-variants-no-result').hide();
    $('.js-product-variants-loading').show();
    $.ajax({
        type: 'GET',
        url: '/manage/product/variants',
        data: {
            uniqid: $('#orm_productUniqid').val()
        },
        success: function (data) {
            $('.js-product-variants-loading').hide();

            $('.js-product-variants-table').find('tbody').remove();
            for (var idx in data) {
                var itm = data[idx];
                $('.js-product-variants-table').append(templateProductVariantListItemHtml({
                    variant: itm,
                }));
            }

            if (data.length == 0) {
                $('.js-product-variants-table').hide();
                $('.js-product-variants-no-result').show();
            } else {
                $('.js-product-variants-table').show();
                $('.js-product-variants-no-result').hide();
                window._initSortable('.js-product-variants-container');
            }
        }
    });
};
window._getVariants = _getVariants;

(function () {
    //hide variants editing for versions
    if ($('.js-orm-version-container').data('version')) {
        $('.js-product-variants-container').hide();
    }

    window._getVariants();

    var productUniqid = $('#orm_productUniqid').val();
    $(document).on('click', '.js-add-variant', function () {
        $.fancybox.open({
            href: '/manage/section/shop/orms/ProductVariant/new?productUniqid=' + productUniqid,
            type: 'iframe',
            width: 1300,
            beforeClose: function () {
                window._getVariants();
            }
        });
        return false;
    });

    $(document).on('click', '.js-edit-variant', function () {
        var ormInfo = $(this).closest('.js-data-item-container');
        $.fancybox.open({
            href: '/manage/section/shop/orms/ProductVariant/' + $(ormInfo).attr('id'),
            type: 'iframe',
            width: 1300,
            beforeClose: function () {
                window._getVariants();
            }
        });
        return false;
    });

    $(document).on('click', '.js-copy-variant', function () {
        var ormInfo = $(this).closest('.js-data-item-container');
        $.fancybox.open({
            href: '/manage/section/shop/orms/ProductVariant/copy/' + $(ormInfo).attr('id'),
            type: 'iframe',
            width: 1300,
            beforeClose: function () {
                window._getVariants();
            }
        });
        return false;
    });

})();

