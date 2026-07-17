require('./app.js');

const $ = require('jquery');
window.jQuery = $;

$(document).ready(function ($) {

    $(document).on('click', '.js-pagination-anchor', function (ev) {
        $('.js-pagination-anchor').parent().removeClass('is-active');
        $('.js-pagination').find('[data-page=' + $(this).data('page') + ']').parent().addClass('is-active');
        $('.js-filter-paginator').val($(this).data('page'));
        filterProducts();
        return false;
    });

    $(document).on('click', '.js-filter-category', function (ev) {
        $('.js-filter-category').removeClass('active');

        var elm = this;
        $(elm).addClass('active');
        do {
            $(elm).closest('ul').prev('li').find('a').addClass('active');
            elm = $(elm).closest('ul').prev('li')
        } while (elm.length);

        $('.js-filter-paginator').val(1);
        $('.js-filter-form').attr('action', $(this).attr('href'));
        filterProducts();
        return false;
    });

    $(document).on('change', '.js-filter-keyword', function (ev) {
        $('.js-filter-paginator').val(1);
        filterProducts();
    });

    $(document).on('click', '.js-filter-submit-button', function (ev) {
        $('.js-filter-paginator').val(1);
        filterProducts();
    });

    $(document).on('click', '.js-filter-option', function (ev) {
        $('.js-filter-paginator').val(1);
        filterProducts();
    });

    $(document).on('change', '.js-sort', function (ev) {
        $('.js-sort').val($(this).val());
        $('.js-filter-sortby').val($(this).val());
        filterProducts();
    });
});

function filterProducts() {

    // $('html,body').animate({
    //     scrollTop : $('.js-product-results').position().top - 100,
    // }, 400);

    $(".js-product-no-results").addClass("hidden"); // hide no result found block
    $(".js-product-results").removeClass("hidden"); // show products
    var filters = [];
    $.each($('.js-filter-form').serializeArray(), function (idx, itm) {
        filters.push(itm.name + '=' + encodeURIComponent(itm.value));
    });

    var url = $('.js-filter-form').attr('action');
    history.pushState(null, null, url + '?' + filters.join('&'));

    // $('.js-products-toolbar').hide();
    // $('.js-loading').removeClass("hidden");
    // $('.js-product-results').html('<span class="loading">Loading</span>');

    $('.js-product-results').addClass('product-loading');

    if (typeof window._ajaxFilterProduct != 'undefined') {
        window._ajaxFilterProduct.abort();
    }
    window._ajaxFilterProduct = $.ajax({
        url: '/products/filter' + url,
        data: filters.join('&'),
        method: 'get',
    }).done(function (data) {
        $('.js-product-results').removeClass('product-loading');

        $('html,body').animate({
            // scrollTop: $('.js-product-results').position().top - 100,
            scrollTop: 0,
        }, 400);

        $('.js-loading').addClass("hidden");
        $('.js-total').text(data.total.count);
        $('.js-filter-count').html(data.filterCount);

        // if there is not any product we will need to show no result found block
        if (data.html != "") {
            $('.js-product-results').html(data.productHtml);
            $('.js-filter-brands').html(data.brandHtml);

            if (data.total.count > 0) {
                $('.js-products-toolbar').show();
            }

            // $('html,body').animate({
            //     scrollTop : $('.js-product-results').position().top - 100,
            // }, 400);
        } else {
            $('.js-product-results').html(''); // remove loading
            $(".js-product-no-results").removeClass("hidden"); // show no result block
            $(".js-product-results").addClass("hidden"); // hide products
            // $('html,body').animate({
            //     scrollTop : $('.js-product-no-results').position().top - 100,
            // }, 400);
        }

        window.initLazyLoad();
    });
};
