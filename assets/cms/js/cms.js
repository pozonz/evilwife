require('fancybox/dist/js/jquery.fancybox.js');
require('fancybox/dist/css/jquery.fancybox.css');

require('jstree/dist/jstree.min.js');
require('jstree/dist/themes/default/style.min.css');

require('dropzone/dist/dropzone.js');
require('dropzone/dist/dropzone.css');

require('jcrop-0.9.12/js/jquery.Jcrop.min');
require('jcrop-0.9.12/css/jquery.Jcrop.min.css');

var Sticky = require('sticky-js');
window.Sticky = Sticky;

import 'chosen-js'

require(`./utils.js`);
require('./file/includes/file-manager.js');
require('./file/includes/file-cropping.js');
require(`../${window._theme}/custom/js/main.js`);

import {html} from 'htm/preact';
import {autocomplete} from '@algolia/autocomplete-js';
import '@algolia/autocomplete-theme-classic';

function _initSortable(containerSelector = null) {
    $.each($((containerSelector ? containerSelector + ' ' : '') + 'table.js-sortable-container tbody td'), function (idx, itm) {
        $(itm).attr('width', $(itm).outerWidth() + 'px');
    });

    $.each($((containerSelector ? containerSelector + ' ' : '') + '.js-sortable-container'), function (idx, itm) {
        var options = $.extend({
            items: '.js-sortable-item',
            stop: function (event, ui) {
                var dataContaienr = $(event.target).closest('.js-data-container');
                var className = $(dataContaienr).data('class');

                if (window._dataStatusRequest) {
                    window._dataStatusRequest.abort();
                }
                window._dataStatusRequest = $.ajax({
                    type: 'GET',
                    url: '/manage/data/sort',
                    data: {
                        data: $(event.target).sortable("toArray"),
                        className: className,
                    },
                    success: function (response) {
                    }
                });
            }
        }, $(itm).data('sortable-options') ? $(itm).data('sortable-options') : {});

        $(itm).sortable(options);
    });
}
window._initSortable = _initSortable;

function _highlight(content, keyword) {
    if (keyword) {
        return `${String(content).replace(new RegExp(keyword, 'gi'), '<span class="bg-lightyellow">$&</span>')}`;
    }
    return content;
}
window._highlight = _highlight;

function _formatMoney(n, c, d, t, symbol, options) {
    if (n === '' || n === null) {
        return '';
    }

    var symbol = symbol == undefined ? '' : symbol;
    var c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
        j = (j = i.length) > 3 ? j % 3 : 0;

    return s + symbol + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}
window._formatMoney = _formatMoney;

(function () {
    if ($('#autocomplete').length) {
        $(document).on('click', '.aa-Item', function () {
            let link = $(this).find('a');
            if ($(link).length) {
                location.href = $(link).attr('href');
            }
        });

        autocomplete({
            container: '#autocomplete',
            openOnFocus: true,
            getSources({query}) {
                return fetch(`/manage/cms-search?q=${query}`)
                    .then(response => response.json())
                    .then(data => {
                        return [
                            {
                                sourceId: 'links',
                                getItems() {
                                    return data;
                                },
                                getItemUrl({item}) {
                                    return item.url;
                                },
                                templates: {
                                    item({item}) {
                                        return html`<a href="${item.url}">
                                        <div class="row text-primary" rel="tooltip" data-original-title="${item.modelTitle}" title="${item.modelTitle}">
                                            <div class="col-lg-2 text-lightgrey">${item.modelnitials}</div>
                                            <div class="col-lg-10">${item.title}</div>
                                        </div>
                                    </a>`;
                                    },
                                },
                                getItemInputValue({item}) {
                                    return item.label;
                                },
                            },
                        ];
                    });
            },
        });
    }

    if ($(window).width() >= 1025) {
        var sticky = new Sticky('[data-sticky-container]');
    }

    $(document).on('click', '.js-sort', function (ev) {
        var sort = $(this).data('sort');
        if (sort == $('.js-filter-sort').val()) {
            $('.js-filter-order').val($('.js-filter-order').val() == 'ASC' ? 'DESC' : 'ASC');
        } else {
            $('.js-filter-sort').val(sort);
        }
        $('.js-filter-page').val(1);
        $('.js-filter-sort').closest('form').submit();
        return false;
    });

    $(document).on('change', '.js-filter', function (ev) {
        $('.js-filter-page').val(1);
    });

    $(document).on('click', '.js-data-pagination a', function (ev) {
        var page = $(this).data('page');
        $('.js-filter-page').val(page);
        $('.js-filter-page').closest('form').submit();
        return false;
    });

    $(document).on('click', '.js-data-item-button-status', function (ev) {
        var dataContaienr = $(this).closest('.js-data-container');
        var className = $(dataContaienr).data('class');

        var dataItemContaienr = $(this).closest('.js-data-item-container');
        var id = $(dataItemContaienr).data('id');
        var value = $(dataItemContaienr).data('value') == 1 ? 0 : 1;

        $(dataItemContaienr).data('value', value);
        $(this).removeClass('btn-success btn-danger');
        $(this).addClass(value == 1 ? 'btn-success' : 'btn-danger');

        if (window._dataStatusRequest) {
            window._dataStatusRequest.abort();
        }
        window._dataStatusRequest = $.ajax({
            type: 'GET',
            url: '/manage/data/status',
            data: {
                id: id,
                className: className,
                value: value,
            },
            success: function (response) {
            }
        });
        return false
    });

    $(document).on('click', '.js-data-item-button-delete', function (ev) {
        var dataContaienr = $(this).closest('.js-data-container');
        var className = $(dataContaienr).data('class');

        var dataItemContaienr = $(this).closest('.js-data-item-container');
        var id = $(dataItemContaienr).data('id');

        confirm((success) => {
            if (window._dataStatusRequest) {
                window._dataStatusRequest.abort();
            }
            window._dataStatusRequest = $.ajax({
                type: 'POST',
                url: '/manage/data/delete',
                data: {
                    id: id,
                    className: className,
                },
                success: (response) => {
                    success();

                    var url = $(dataItemContaienr).data('redirect');
                    if (url) {
                        location.href = url;
                        return;
                    }

                    var callback = $(dataItemContaienr).data('callback');
                    if (callback && typeof window[callback] == 'function') {
                        window[callback](dataItemContaienr);
                        return;
                    }

                    $(dataItemContaienr).remove();
                }
            });
        }, {
            title: "Are you sure?",
            text: "You are going to delete this record permanently!",
            confirmButtonText: "Yes, delete it!",
            confirmed: {
                title: "Deleted!",
                text: "The record has been deleted.",
            }
        });
        return false;
    });

    $('select.js-chosen:visible').chosen({
        allow_single_deselect: true,
    });
    window._initSortable();

    fileCropping.init();
})();

