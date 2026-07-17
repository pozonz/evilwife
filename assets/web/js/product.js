require('./app.js');

const $ = require('jquery');
window.jQuery = $;

$(document).ready(function ($) {

    $(document).on('change', '.js-variant', function () {
        if (typeof window._ajaxCartQty != 'undefined') {
            window._ajaxCartQty.abort();
        }
        window._ajaxCartQty = $.ajax({
            type: 'GET',
            url: '/product/variant/price',
            data: {
                uniqid: $(this).find('option:selected').data('uniqid'),
            },
            success: function(data) {
                $('.js-product-price').html(data.html);
            }
        });
    });

    let productGallery = document.querySelector('.js-product-gallery');
    if (productGallery) {
        let productSlides = new Flickity(productGallery, {
            pageDots: false,
            prevNextButtons: false,
            imagesLoaded: true,
            setGallerySize: false,
            bgLazyLoad: true,
            cellAlign: "left",
            fade: true
        });
        let productSlidesData = Flickity.data(productGallery);
    }

    //Slider arrows
    if ($('.js-product-gallery-nav-lateral').length) {
        $('.product__gallery-nav__lateral-button').on('click', function () {
            let slideDirection = $(this).data('direction');
            if (slideDirection == 'prev') {
                productSlides.previous();
            } else {
                productSlides.next();
            }

            $('.product__gallery-nav__lateral-button.is-disabled').removeClass('is-disabled');

            if ((productSlidesData.selectedIndex + 1) == 1 || (productSlidesData.selectedIndex + 1) == productSlidesData.slides.length) {
                $(this).addClass('is-disabled');
            }
        });
    }

    //Slider thumbs
    if ($('.js-product-gallery-thumbs').length) {
        let $productSlidesNav = $('.js-product-gallery-thumbs');
        let $productSlidesNavItems = $productSlidesNav.find('.product__gallery-thumb');

        productSlides.on('select', function() {
            $productSlidesNav.find('.is-selected').removeClass('is-selected');
            $productSlidesNavItems.eq(productSlidesData.selectedIndex).addClass('is-selected');
        });

        $productSlidesNav.on('click', '.product__gallery-thumb', function () {
            let index = $(this).index();
            productSlides.select(index);
        });
    }
});

