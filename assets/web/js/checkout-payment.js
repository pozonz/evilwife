require('./checkout.js');

const $ = require('jquery');
window.jQuery = $;

import {loadStripe} from '@stripe/stripe-js';

$(document).ready(async function ($) {

    if ($('.js-stripe-secret').length) {
        window.stripe = await loadStripe($('.js-stripe-secret').data('key'));
        setStripe(stripe);
    }

    $(document).on('click', '.js-payment-gateway-button', function () {
        $('.js-payment-gateway-form').hide();
        $(this).closest('.js-payment-gateway-container').find('.js-payment-gateway-form').show();
        $('#cart_payment_payType').val($(this).attr('id').replace('payment-', ''));

        $.ajax({
            data: {
                id: $('form[name=cart_payment]').data('id'),
                type: $('#cart_payment_payType').val(),
            },
            method: 'get',
            url: '/checkout/post/order/change-pay-type',
        }).done(function (data) {

        });
    });

    $(document).on('click', '.js-checkout-button', function () {
        $.ajax({
            data: {
                id: $('form[name=cart_payment]').data('id'),
                type: $('#cart_payment_payType').val(),
                note: $('#cart_payment_note').val(),
            },
            method: 'get',
            url: '/checkout/post/order/send-to-payment-gateway',
        }).done(function (data) {

            $('.js-checkout-aside').html(data.checkoutSidebarHtml);

            if ($('[name=shipping-method]:checked').closest('li').find('form').length) {
                $('[name=shipping-method]:checked').closest('li').find('form').find('button').click();
            } else {
                $('form[name=cart_payment]').submit();
            }

        });
    });
});