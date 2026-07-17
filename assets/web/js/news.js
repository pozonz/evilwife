require('./app.js');

const $ = require('jquery');
window.jQuery = $;

$(document).ready(function ($) {

    $(document).on('click', '.js-pagination-anchor', function (ev) {
        $('.js-pagination-anchor').parent().removeClass('is-active');
        $('.js-pagination').find('[data-page=' + $(this).data('page') + ']').parent().addClass('is-active');
        $('.js-filter-paginator').val($(this).data('page'));
        filterNews();
        return false;
    });

    $(document).on('click', '.js-filter-category', function (ev) {
        $('.js-filter-category').removeClass('active');
        $(this).addClass('active');

        $('.js-filter-paginator').val(1);
        $('.js-filter-form').attr('action', $(this).attr('href'));
        filterNews();
        return false;
    });
});

function filterNews() {

    // $('html,body').animate({
    //     scrollTop : $('.js-news-results').position().top - 100,
    // }, 400);

    $(".js-news-no-results").addClass("hidden"); // hide no result found block
    $(".js-news-results").removeClass("hidden"); // show products
    var filters = [];
    $.each($('.js-filter-form').serializeArray(), function (idx, itm) {
        filters.push(itm.name + '=' + encodeURIComponent(itm.value));
    });

    var url = $('.js-filter-form').attr('action');
    history.pushState(null, null, url + '?' + filters.join('&'));

    $('.js-news-results').html('<span class="loading">Loading</span>');

    if (typeof window._ajaxFilterProduct != 'undefined') {
        window._ajaxFilterProduct.abort();
    }

    window._ajaxFilterProduct = $.ajax({
        url: '/news/filter' + url,
        data: filters.join('&'),
        method: 'get',
    }).done(function (data) {

        $('html,body').animate({
            scrollTop: $('.js-news-results').position().top - 100,
        }, 400);

        $('.js-loading').addClass("hidden");
        $('.js-total').text(data.total.count);
        $('.js-filter-count').html(data.filterCount);

        // if there is not any news we will need to show no result found block
        if (data.html != "") {
            $('.js-news-results').html(data.html);

            if (data.total.count > 0) {
                $('.js-products-toolbar').show();
            }

            // $('html,body').animate({
            //     scrollTop : $('.js-news-results').position().top - 100,
            // }, 400);
        } else {
            $('.js-news-results').html(''); // remove loading
            $(".js-news-no-results").removeClass("hidden"); // show no result block
            $(".js-news-results").addClass("hidden"); // hide products
            // $('html,body').animate({
            //     scrollTop : $('.js-news-no-results').position().top - 100,
            // }, 400);
        }

        window.initLazyLoad();
    });
};
