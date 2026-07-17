require('./app.js');

const $ = require('jquery');
window.jQuery = $;

$(document).ready(function ($) {
    $(document).on('keyup', '.js-cart-promo-code', function (ev) {
        if (ev.keyCode === 13) {
            ev.preventDefault();
            $('.js-cart-promo-code-apply').trigger('click');
            return false;
        }
    });
    $(document).on('click', '.js-cart-promo-code-apply', function (ev) {
        var id = $(this).data('id');
        var code = $('.js-cart-promo-code').val();
        $('.js-cart-promo-code').val('');

        $.ajax({
            type: 'GET',
            url: '/checkout/post/order/promo-code',
            data: {
                id: id,
                code: code,
            },
            success: function (data) {
                if ($('.js-checkout-button--toggle-summary__total').length) {
                    $('.js-checkout-button--toggle-summary__total').html('$' + data.orderTotalFormatted);
                }

                if (data.cart.discountValue === null) {
                    $(".js-promo-validate").removeClass("visuallyhidden");
                    setTimeout( () => {
                        $(".js-promo-validate").addClass("visuallyhidden");
                    }, 2500);
                }

                if ($('.js-checkout-sidebar-subtotal').length) {
                    $('.js-checkout-sidebar-subtotal').html(data.checkoutSidebarSubtotalHtml);
                }
            }
        });
        return false;
    });

    $(document).on('change', '#cart_shipping_pickupFirstName', function () {
        $('#cart_shipping_shippingFirstName').val($('#cart_shipping_pickupFirstName').val());
    });
    $(document).on('change', '#cart_shipping_pickupLastName', function () {
        $('#cart_shipping_shippingLastName').val($('#cart_shipping_pickupLastName').val());
    });
    $(document).on('change', '#cart_shipping_shippingFirstName', function () {
        $('#cart_shipping_pickupFirstName').val($('#cart_shipping_shippingFirstName').val());
    });
    $(document).on('change', '#cart_shipping_shippingLastName', function () {
        $('#cart_shipping_pickupLastName').val($('#cart_shipping_shippingLastName').val());
    });

    //Tabs
    $(document).on('click', '.js-is-pickup .js-tab input', function () {
        var id = $(this).closest('form').data('id');
        $('.js-tab').removeClass('active');
        $('.js-tab-content').hide();
        $(this).addClass('active');
        $('#js-tab-content-' + $(this).val()).show();

        updateShippingOptions();
    });

    //Tabs
    $(document).on('click', '.js-shipping-methods input', function () {
        var shipping = $(this).val();
        $('#cart_shipping_shippingId').val(shipping);

        $.ajax({
            type: 'GET',
            url: '/checkout/post/order/delivery',
            data: {
                shipping: shipping,
            },
            success: function (data) {
                if ($('.js-checkout-sidebar-subtotal').length) {
                    $('.js-checkout-sidebar-subtotal').html(data.checkoutSidebarSubtotalHtml);
                }
            }
        });
    });

    //Mobile aside toggle
    $(document).on('click', '.js-checkout-button--toggle-summary', function () {
        $(this).toggleClass('active');
        $('#order-summary').toggleClass('active');
        $('.js-checkout-button--toggle-summary__show').toggle();
        $('.js-checkout-button--toggle-summary__hide').toggle();
    });
    $(document).on("keypress", '.js-shipping-form', function (e) {
        var code = e.keyCode || e.which;
        if (code == 13) {
            e.preventDefault();
            return false;
        }
    });

    if ($('#cart_shipping_shippingAddress').length) {
        const mapsUrl = `//maps.googleapis.com/maps/api/js?callback=init&libraries=places&key=${window._googleApiKey}`;
        const mapsScript = document.createElement('script');
        mapsScript.async = true;
        mapsScript.src = mapsUrl;
        document.querySelector('head').appendChild(mapsScript);
    }

    $(document).on('change', '.js-shipping-regions', function () {
        $('#cart_shipping_shippingState').val($(this).val());
        updateShippingOptions();
    });
    $(document).on('change', '#cart_shipping_shippingPostcode', function () {
        updateShippingOptions();
    });
    $(document).on('change', '#cart_shipping_shippingCountry', function () {
        $('#cart_shipping_shippingState').val('');
        updateShippingOptions(0);
    });

    if ($('#cart_shipping_shippingAddress').length) {
        updateShippingOptions(0);
    }
});

function init() {
    var container = $('.js-shipping-form');

    $(container).find('.js-shipping-address-autocomplete-container').html(
        `<input type="text" id="js-shipping-address-autocomplete" class="checkout-input--text pac-target-input" value="${$(container).find('.js-shipping-address').val()}" placeholder="Start typing your address...">`
    );

    var placeToObj = function (place) {
        var componentForm = {
            street_number: 'short_name',
            route: 'long_name',
            sublocality_level_1: 'short_name',
            locality: 'long_name',
            postal_code: 'short_name',
            administrative_area_level_1: 'short_name',
            country: 'short_name',
        };
        var obj = {};
        for (var i = 0; i < place.address_components.length; i++) {
            var addressType = place.address_components[i].types[0];
            if (componentForm[addressType]) {
                var val = place.address_components[i][componentForm[addressType]];
                obj[addressType] = val;
            }
        }
        return obj;
    };

    var country = $('#cart_shipping_shippingCountry').val();
    window._autocompleteAddress = new google.maps.places.Autocomplete(document.getElementById('js-shipping-address-autocomplete'), {
        componentRestrictions: {'country': country.toLowerCase()}
    });
    window._autocompleteLsr = window._autocompleteAddress.addListener('place_changed', function () {
        var obj = placeToObj(this.getPlace())

        if (obj.street_number && obj.route) {
            $(container).find('.js-shipping-address').val(obj.street_number + ' ' + obj.route + (obj.sublocality_level_1 ? ', ' + obj.sublocality_level_1 : ''));
        } else if (obj.street_number) {
            $(container).find('.js-shipping-address').val(obj.street_number + (obj.sublocality_level_1 ? ', ' + obj.sublocality_level_1 : ''));
        } else if (obj.route) {
            $(container).find('.js-shipping-address').val(obj.route + (obj.sublocality_level_1 ? ', ' + obj.sublocality_level_1 : ''));
        }
        $(container).find('#js-shipping-address-autocomplete').val($(container).find('.js-shipping-address').val());
        $(container).find('.js-shipping-city').val(obj.locality);
        $(container).find('.js-shipping-postcode').val(obj.postal_code);
        $(container).find('#cart_shipping_shippingState').val('');
        updateShippingOptions(0);
    });

    var seconds = [0, 200, 1000, 2000, 5000];
    for (var idx in seconds) {
        var second = seconds[idx];
        setTimeout(function () {
            $('#js-shipping-address-autocomplete').attr('autocomplete', 'one-time-password');
        }, second);
    }
};
window.init = init;

function setStripe(stripe) {
    var data = {
        clientSecret: $('.js-stripe-secret').data('secret')
    }

// Disable the button until we have Stripe set up on the page
    document.querySelector("button").disabled = true;

    var elements = stripe.elements();

    var style = {
        base: {
            color: "#32325d",
            fontFamily: 'Arial, sans-serif',
            fontSmoothing: "antialiased",
            fontSize: "16px",
            "::placeholder": {
                color: "#32325d"
            }
        },
        invalid: {
            fontFamily: 'Arial, sans-serif',
            color: "#fa755a",
            iconColor: "#fa755a"
        }
    };

    var card = elements.create("card", {style: style});
    // Stripe injects an iframe into the DOM
    card.mount("#card-element");

    card.on("change", function (event) {
        // Disable the Pay button if there are no card details in the Element
        document.querySelector("button").disabled = event.empty;
        document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
    });

    var form = document.getElementById("payment-form");
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        // Complete payment when the submit button is clicked
        payWithCard(stripe, card, data.clientSecret);
    });

// Calls stripe.confirmCardPayment
// If the card requires authentication Stripe shows a pop-up modal to
// prompt the user to enter authentication details without leaving your page.
    var payWithCard = function (stripe, card, clientSecret) {
        loading(true);
        stripe
            .confirmCardPayment(clientSecret, {
                payment_method: {
                    card: card
                }
            })
            .then(function (result) {
                if (result.error) {
                    // Show error to your customer
                    showError(result.error.message);
                } else {
                    // The payment succeeded!
                    orderComplete(result.paymentIntent.id);
                }
            });
    };

    /* ------- UI helpers ------- */

// Shows a success message when the payment is complete
    var orderComplete = function (paymentIntentId) {
        location.href = `/checkout/finalise?id=${paymentIntentId}`;
    };

// Show the customer the error from Stripe if their card fails to charge
    var showError = function (errorMsgText) {
        loading(false);
        var errorMsg = document.querySelector("#card-error");
        errorMsg.textContent = errorMsgText;
        setTimeout(function () {
            errorMsg.textContent = "";
        }, 4000);
    };

// Show a spinner on payment submission
    var loading = function (isLoading) {
        if (isLoading) {
            $('[name=shipping-method]:checked').closest('li').find('form').prop('disabled', 'disabled');
            $('.js-checkout-button').prop('disabled', 'disabled');
        } else {
            $('[name=shipping-method]:checked').closest('li').find('form').removeAttr('disabled', 'disabled');
            $('.js-checkout-button').removeAttr('disabled', 'disabled');
        }
    };
};
window.setStripe = setStripe;

function updateShippingOptions(doNotUpdateRegions = 1) {
    var address = $('#cart_shipping_shippingAddress').val();
    var city = $('#cart_shipping_shippingCity').val();
    var country = $('#cart_shipping_shippingCountry').val();
    var region = $('#cart_shipping_shippingState').val();
    var postcode = $('#cart_shipping_shippingPostcode').val();
    var pickup = $('.js-is-pickup :radio:checked').val();

    $.ajax({
        type: 'GET',
        url: '/checkout/post/order/shipping',
        data: {
            address: address,
            city: city,
            country: country,
            region: region,
            postcode: postcode,
            pickup: pickup,
        },
        success: function (data) {
            $('#cart_shipping_shippingId').val(data.cart.shippingId);

            if (doNotUpdateRegions !== 1) {
                $('.js-shipping-regions').html(`<option></option>`);
                var val = $('#cart_shipping_shippingState').val();
                $('.js-shipping-regions').append(data.regions.map(region => {
                    return `<option ${val == region ? 'selected' : ''} value="${region}">${region}</option>`
                }));
            }

            if ($('.js-checkout-sidebar-subtotal').length) {
                $('.js-checkout-sidebar-subtotal').html(data.checkoutSidebarSubtotalHtml);
            }

            $('.js-shipping-methods-container').hide();
            if (data.shippingPriceMode == 1 && $('.js-shipping-regions').val()) {
                $('.js-shipping-methods-container').show();
            } else if (data.shippingPriceMode == 2 && $('.js-shipping-postcode').val()) {
                $('.js-shipping-methods-container').show();
            }
            
            if (data.deliveryOptions.length > 0) {
                $('.js-shipping-methods').html(`<ul class="checkout-data-rows"></ul>`);
                $('.js-shipping-methods ul').html(data.deliveryOptions.map(deliveryOption => {
                    if (deliveryOption.valid) {
                        return `<li class="checkout-data-row">
                                <input class="checkout-data-row__input" id="payment-${deliveryOption.deliveryOption.id}" value="${deliveryOption.deliveryOption.id}" ${data.cart.shippingId == deliveryOption.deliveryOption.id? 'checked' : ''} type="radio" name="shipping-method" autoComplete="off">
                                <label class="checkout-data-row__inner checkout-data-row__label" for="payment-${deliveryOption.deliveryOption.id}">
                                    ${deliveryOption.deliveryOption.title}
                                    <span>$${deliveryOption.fee}</span>
                                </label>
                            </li>`;
                    } else {
                        return `<li class="checkout-data-row">
                                <input class="checkout-data-row__input" id="payment-${deliveryOption.deliveryOption.id}" value="${deliveryOption.deliveryOption.id}" ${data.cart.shippingId == deliveryOption.deliveryOption.id? 'checked' : ''} type="radio" name="shipping-method" autoComplete="off" disabled>
                                <label class="checkout-data-row__inner checkout-data-row__label" for="payment-${deliveryOption.deliveryOption.id}">
                                    ${deliveryOption.deliveryOption.title}
                                </label>
                            </li>`;
                    }

                }));
            } else {
                $('.js-shipping-methods').html(`<div>Sorry, there are no delivery options available.</div>`);
            }

            init();
        }
    });
};
window.updateShippingOptions = updateShippingOptions;
