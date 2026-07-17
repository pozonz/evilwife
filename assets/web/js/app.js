/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
// import './styles/app.css';

// start the Stimulus application
import '../../../../../../../assets/bootstrap';

var $ = require( "jquery" );
window.jQuery = $;
import LazyLoad from "vanilla-lazyload";

var Flickity = require('flickity');
require('flickity-bg-lazyload');
require('flickity-imagesloaded');
require('flickity-fade');
window.Flickity = Flickity;

import Cookies from 'js-cookie';

var autocomplete = require('jquery-ui/ui/widgets/autocomplete');

const fancybox = require('@fancyapps/fancybox');

const initLazyLoad = () => {
    var lazyLoadInstance = new LazyLoad({
        // Your custom settings go here
    });
}
window.initLazyLoad = initLazyLoad;

$(document).ready(function () {
    $(document).on('click', '.js-alert-banner-dismiss', function(ev) {
        var cookieKey = $(this).data('cookie')
        Cookies.set(cookieKey, 1, { expires: 3 });
        $(this).closest('.js-alert-banner').remove();
    });

    if($('.g-recaptcha').length > 0) {

        var jsUrl = `//www.google.com/recaptcha/api.js?onload=callbackRecaptcha&render=explicit`;
        var jsScript = document.createElement('script');
        jsScript.async = true;
        jsScript.src = jsUrl;
        document.querySelector('head').appendChild(jsScript);

        const callbackRecaptcha = () => {
            $.each($('.g-recaptcha'), function(idx, itm) {
                grecaptcha.render($(itm).attr('id'), {
                    'sitekey' : $(itm).data('sitekey'),
                    'theme' : 'light'
                });
            });
        };
        window.callbackRecaptcha = callbackRecaptcha;

    }

    //----------------------------------------------------------------------------
    //Lazy load
    //----------------------------------------------------------------------------
   initLazyLoad();

    
    //----------------------------------------------------------------------------
    //Main nav toggle
    //----------------------------------------------------------------------------
    $(".js-mainnav-open").on('click', function (e) {
        $(this).toggleClass('active');
        $('body').toggleClass('mainnav-active');
        $('.js-mainnav-close').focus();
        return false;
    });
    $(".js-mainnav-close").on('click', function (e) {
        $(this).toggleClass('active');
        $('body').removeClass('mainnav-active');
        $('.js-mainnav-open').removeClass('active');
        return false;
    });
    $(".js-mainnav-overlay").on('click', function (e) {
        $(this).removeClass('active');
        $('body').removeClass('mainnav-active');
        $('.js-mainnav').removeClass('active');
        $('.js-mainnav-open').removeClass('active');
        $('.js-nav-toggle').removeClass('active');
        return false;
    });


    //----------------------------------------------------------------------------
    //Header scroll
    //----------------------------------------------------------------------------
    var didScroll;
    var lastScrollTop = 0;
    var delta = 5;
    var navbarHeight = $('.js-site-header').outerHeight();

    $(window).scroll(function (event) {
        didScroll = true;
        var lastScrollTop = $(window).scrollTop();

        if (lastScrollTop < 250) {
        $('.js-site-header').removeClass('scrolling');
        } else {
        $('.js-site-header').addClass('scrolling');
        }
    });

    setInterval(function () {
        if (didScroll) {
        hasScrolled();
        didScroll = false;
        }
    }, 250);

    function hasScrolled() {
        var st = $(window).scrollTop();

        if (Math.abs(lastScrollTop - st) <= delta) {
        return;
        }

        if (st > lastScrollTop && st > navbarHeight) {
        // Scroll Down
        $('body').removeClass('nav-down').addClass('nav-up');

        } else {
        // Scroll Up
        if (st + $(window).height() < $(document).height()) {
            $('body').removeClass('nav-up').addClass('nav-down');
        }
        }
        lastScrollTop = st;
    }

    //----------------------------------------------------------------------------
    //Main nav - level 2 toggle
    //----------------------------------------------------------------------------
    $(document).on('click', '.js-main-nav-level2-toggle', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();

        const $this = $(this);
        const $nav = $this.parent().find('.js-mainnav-level2');
        $('.js-mainnav-level2').not($nav).removeClass('open');

        $('.js-mainnav-level2-toggle').not($this).removeClass('active');
        $this.toggleClass('active');
        $nav.toggleClass('open');
    });

    //----------------------------------------------------------------------------
    //Proportional iframe embed
    //----------------------------------------------------------------------------    
    $(".wysiwyg iframe").wrap("<div class='wysiwyg-iframe'/>");

    //----------------------------------------------------------------------------
    //Donate prototyping - remove!
    //----------------------------------------------------------------------------
    $(document).on('click', '.js-form--donate__amount-other', function (ev) {
        $('.js-form--donate__amount--other-input-wrap').removeClass('hidden');
        $('.js-form--donate__amount--other').addClass('hidden');
        $('.js-form--donate__amount--other-input').focus();
    });    
    $(document).on('click', '.js-form--donate-toggle-step2', function (ev) {
        $('.js-form--donate__step-2').removeClass('hidden');
        $('.js-form--donate__step-1').addClass('hidden');
    });       
    $(document).on('click', '.js-form--donate-toggle-step3', function (ev) {
        $('.js-form--donate__step-3').removeClass('hidden');
        $('.js-form--donate__step-2').addClass('hidden');
    });   
    
    //Step back
    $(document).on('click', '.js-form--donate-toggle-step1', function (ev) {
        $('.js-form--donate__step-1').removeClass('hidden');
        $('.js-form--donate__step-2').addClass('hidden');
        $('.js-form--donate__step-3').addClass('hidden');
    });    
    $(document).on('click', '.js-form--donate-toggle-step2', function (ev) {
        $('.js-form--donate__step-2').removeClass('hidden');
        $('.js-form--donate__step-3').addClass('hidden');
    });

    //----------------------------------------------------------------------------
    //Cart count
    //----------------------------------------------------------------------------   
    initCart();

    if ($('.js-site-search-input').length) {
        $('.js-site-search-input').autocomplete({
            appendTo: $('.js-site-search-preview'),
            autoFocus: true,
            source: function (request, response) {
                $.ajax({
                    url: '/site-search',
                    data: {
                        q: request.term
                    },
                    dataType: 'json',
                    success: function (data) {
                        if (!data.length) {
                            response([{
                                noResultsFound: 1
                            }]);
                        } else {
                            response($.map(data, function (item) {
                                return item;
                            }));
                        }
                    },
                });
            },
            minLength: 1,
            select: function (event, ui) {
                event.preventDefault();
                $(this).val('');
                if (typeof ui.item.noResultsFound === 'undefined') {
                    if (ui.item.url.indexOf('/assets') !== -1) {
                        window.open(ui.item.url);
                    } else {
                        location.href = ui.item.url;
                    }
                }
            },
        }).data('ui-autocomplete')._renderItem = function (ul, item) {
            $(ul).addClass('site-search-preview__inner');
            $(ul).attr('role', 'listbox');
            var html = null;
            if (typeof item.noResultsFound !== 'undefined') {
                html = `
					<li class="autocomplete-search-option autocomplete-search-option--no-results">
						Sorry, we can't find anything with your search query.
					</li>
					`;
            } else {
                if (item.image) {
                    html = `
					<li class="site-search-preview__block">
						<a ${item.url.indexOf('/assets') !== -1 ? 'target="_blank"' : ''} class="site-search__event" href="${item.url}" role="option">
							<div class="thumb">
								<div class="content-placeholder content-placeholder--media"></div>
								<img class="object-fit object-cover lazyload" src="/images/assets/${item.image}/small" alt="">
							</div>
							<div class="text">
								<h5>${String(item.title).replace(new RegExp(this.term, 'gi'), '<span class="highlight">$&</span>')}</h5>
								<div class="details">${displaySiteSearchSubtitle(item.description, this.term)}</div>
							</div>
						</a>
					</li>
						`;
                } else {
                    html = `
					<li class="site-search-preview__block">
						<a ${item.url.indexOf('/assets') !== -1 ? 'target="_blank"' : ''} href="${item.url}" class="site-search__result site-search__result--article" role="option">
							<div class="h">${item.category}</div>
							<div class="text">
								<h5>${String(item.title).replace(new RegExp(this.term, 'gi'), '<span class="highlight">$&</span>')}</h5>
								${item.description ? ('<div class="excerpt">' + displaySiteSearchSubtitle(item.description, this.term) + '</div>') : ''}
							</div>
						</a>
					</li>
					`;
                }
            }

            return $(html).appendTo(ul);
        };
    }
});

function updateCartCount(length) {
    $('.js-cart-count').text(length);
    if (length > 0) {
        $('.js-products-no-results').hide();
        $('.js-products-with-results').show();
    } else {
        $('.js-products-no-results').show();
        $('.js-products-with-results').hide();
    }
};

//----------------------------------------------------------------------------
//Cart
//----------------------------------------------------------------------------    
function initCart() {
    $.ajax({
        method: 'get',
        url: '/cart/get',
    }).done(function (data) {
        updateCartCount(data.cart._jsonOrderItems.length);
    });

    $(document).on('click', '.js-cart-close, .js-cart-bg', function(){
        $('body').removeClass('cart-is-open');
    });

    $(document).on('click', '.js-add-to-cart', function(ev) {

        var container = $(this).closest('.js-product-cart-wrapper');
        var qty = $(container).find('.js-qty').val();
        var id = $(container).find('.js-variant').val();

        $.ajax({
            data: {
                id: id,
                qty: qty,
            },
            method: 'get',
            url: '/cart/post/cart-item/add',
        }).done(function (data) {

            if (data.isOutOfStock) {
                $('#out-of-stock-message').find('.js-message').html(data.outOfStockMessage);
                $.fancybox.open({
                    src: '#out-of-stock-message',
                    type: 'inline',
                    touch: false,
                });
            } else {
                $('.js-cart-added').addClass('visible');
            }

            updateCartCount(data.cart._jsonOrderItems.length);
            $('.js-cart-mini').html(data.miniCartHtml);
            $('.js-cart-count').text(data.cart._jsonOrderItems.length);
            $('body').addClass('cart-is-open');
        });
    });

    $(document).on('click', '.js-cart-remove', function(ev) {
        var orderItemContainer = $(this).closest('.js-cart-item');
        var id = $(orderItemContainer).data('id');
        $(orderItemContainer).remove();
        if ($('.js-cart-item').length == 0) {
            $('.js-products-no-results').show();
            $('.js-products-with-results').hide();
        }

        $.ajax({
            type: 'GET',
            url: '/cart/post/cart-item/delete',
            data: {
                id: id,
            },
            success: function(data) {
                updateCartCount(data.cart._jsonOrderItems.length);
                $('.js-cart-footer').html(data.cartSubtotalHtml);
                $('.js-cart-mini-footer').html(data.miniCartSubtotalHtml);
            }
        });
        return false;
    });

    $(document).on('click', '.js-cart-qty-btn', function (ev) {
        var orderItemContainer = $(this).closest('.js-cart-item');
        var oldValue =  $(orderItemContainer).find('.js-cart-qty').val();
        if ($(this).hasClass('plus')) {
            var newVal = parseFloat(oldValue) + 1;
        } else {
            // Don't allow decrementing below zero
            if (oldValue > 1) {
                var newVal = parseFloat(oldValue) - 1;
            } else {
                newVal = 1;
            }
        }

        $(orderItemContainer).find('.js-cart-qty').val(newVal);
        $(orderItemContainer).find('.js-cart-qty').trigger('change');
    });

    $(document).on('change', '.js-cart-qty', function(ev) {
        var orderItemContainer = $(this).closest('.js-cart-item');
        var id = $(orderItemContainer).data('id');
        var qty = $(this).val();
        var price = $(this).data('price');

        if (typeof window._ajaxCartQty != 'undefined') {
            window._ajaxCartQty.abort();
        }
        window._ajaxCartQty = $.ajax({
            type: 'GET',
            url: '/cart/post/cart-item/qty',
            data: {
                id: id,
                qty: qty,
            },
            success: function(data) {
                if (data.isOutOfStock) {
                    $('#out-of-stock-message').find('.js-message').html(data.outOfStockMessage);
                    $.fancybox.open({
                        src: '#out-of-stock-message',
                        type: 'inline',
                        touch: false,
                    });
                    $(orderItemContainer).find('.js-cart-qty').val(data.stock);
                    $('.js-cart-mini').html(data.miniCartHtml);

                } else {
                    $(`.js-cart-item[data-id=${id}] .js-subtotal`).html(data.cartItemSubtotalHtml)
                    $('.js-cart-footer').html(data.cartSubtotalHtml);
                    $('.js-cart-mini-footer').html(data.miniCartSubtotalHtml);
                }
            }
        });
        return false;
    });
};

function displaySiteSearchSubtitle(description, term) {
    const DOTDOTDOT = '...';
    const LIMIT = 50;
    const CONTEXT_LENGTH = LIMIT - term.length;
    const HALF_LENGTH = CONTEXT_LENGTH / 2;

    var pos = description.toLowerCase().indexOf(term.toLowerCase());
    if (pos == -1) {
        return description.substr(0, LIMIT) + (description.length > LIMIT ? DOTDOTDOT : '');
    } else {
        term = description.substr(pos, term.length);

        var leftSideText = null;
        var rightSideText = null;
        var leftSideLength = HALF_LENGTH;
        var rightSideLength = HALF_LENGTH;
        var leftSideDotDotDot = DOTDOTDOT;
        var rightSideDotDotDot = DOTDOTDOT;

        var leftSideStart = pos - leftSideLength;
        if (leftSideStart <= 0) {
            leftSideStart = 0;
            leftSideDotDotDot = '';
            leftSideLength = pos;
            rightSideLength = rightSideLength + (HALF_LENGTH - pos);
            if ((pos + term.length + rightSideLength) >= description.length) {
                rightSideDotDotDot = '';
            }
        }

        leftSideText = leftSideDotDotDot + description.substr(leftSideStart, leftSideLength);
        rightSideText = description.substr(pos + term.length, rightSideLength) + rightSideDotDotDot;
        var result = leftSideText + term + rightSideText;
        return `${String(result).replace(new RegExp(term, 'gi'), '<span class="highlight">$&</span>')}`;
    }
};
