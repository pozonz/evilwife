require('../orm/orm');

(function() {
    window._regions = [];

    var value = $('#orm_shippingCostRates').val();
    var jsonValue = JSON.parse(value ? value : '[]');
    if (jsonValue.length === 0) {
        jsonValue.push(getNewRate());
        $('#orm_shippingCostRates').val(JSON.stringify(jsonValue));
    }

    $(document).on('change', '#orm_country', function (idx, itm) {
        getRegions();
    });

    $(document).on('click', '.js-rate-up', function (idx, itm) {
        value = $('#orm_shippingCostRates').val();
        jsonValue = JSON.parse(value ? value : '[]');

        var idx = $(this).closest('.js-rate-container').data('idx');
        if (idx > 0) {
            var prev = jsonValue[idx - 1];
            jsonValue[idx - 1] = jsonValue[idx];
            jsonValue[idx] = prev;
            $('#orm_shippingCostRates').val(JSON.stringify(jsonValue));
            renderRates();
        }

        return false;
    });

    $(document).on('click', '.js-rate-down', function (idx, itm) {
        value = $('#orm_shippingCostRates').val();
        jsonValue = JSON.parse(value ? value : '[]');

        var idx = $(this).closest('.js-rate-container').data('idx');
        idx = parseInt(idx, 10);
        if (idx < (jsonValue.length - 1)) {
            var next = jsonValue[idx + 1];
            jsonValue[idx + 1] = jsonValue[idx];
            jsonValue[idx] = next;
            $('#orm_shippingCostRates').val(JSON.stringify(jsonValue));
            renderRates();
        }

        return false;
    });

    $(document).on('click', '.js-add-rate', function (idx, itm) {
        value = $('#orm_shippingCostRates').val();
        jsonValue = JSON.parse(value ? value : '[]');
        jsonValue.push(getNewRate());
        $('#orm_shippingCostRates').val(JSON.stringify(jsonValue));
        renderRates();
        return false;
    });

    $(document).on('click', '.js-delete-rate', function (idx, itm) {
        value = $('#orm_shippingCostRates').val();
        jsonValue = JSON.parse(value ? value : '[]');
        var idx = $(this).closest('.js-rate-container').data('idx');
        jsonValue.splice(idx, 1);
        $('#orm_shippingCostRates').val(JSON.stringify(jsonValue));
        renderRates();
        return false;
    });

    $(document).on('click', '.js-add-extra', function (idx, itm) {
        var idx = $(this).closest('.js-rate-container').data('idx');

        value = $('#orm_shippingCostRates').val();
        jsonValue = JSON.parse(value ? value : '[]');
        jsonValue[idx].extra.push(getNewRateExtra());
        $('#orm_shippingCostRates').val(JSON.stringify(jsonValue));
        renderRate(idx, jsonValue[idx], $('.js-rate-container-' + jsonValue[idx].id));
        return false;
    });

    $(document).on('click', '.js-delete-extra', function (idx, itm) {
        var idx = $(this).closest('.js-rate-container').data('idx');
        var extraIdx = $(this).closest('.js-extra-container').data('idx');

        value = $('#orm_shippingCostRates').val();
        jsonValue = JSON.parse(value ? value : '[]');
        jsonValue[idx].extra.splice(extraIdx, 1);
        $('#orm_shippingCostRates').val(JSON.stringify(jsonValue));
        renderRate(idx, jsonValue[idx], $('.js-rate-container-' + jsonValue[idx].id));
        return false;
    });

    $(document).on('change keyup', '.js-elem', function (idx, itm) {
        var idx = $(this).closest('.js-rate-container').data('idx');
        var id = $(this).data('id');
        value = $('#orm_shippingCostRates').val();
        jsonValue = JSON.parse(value ? value : '[]');
        jsonValue[idx][id] = $(this).val();
        $('#orm_shippingCostRates').val(JSON.stringify(jsonValue));
    });

    $(document).on('change keyup', '.js-elem-extra', function (idx, itm) {
        var idx = $(this).closest('.js-rate-container').data('idx');
        var extraIdx = $(this).closest('.js-extra-container').data('idx');
        var id = $(this).data('id');
        value = $('#orm_shippingCostRates').val();
        jsonValue = JSON.parse(value ? value : '[]');
        jsonValue[idx].extra[extraIdx][id] = $(this).val();
        $('#orm_shippingCostRates').val(JSON.stringify(jsonValue));
    });

    getRegions();

})();

function getRegions() {
    $.ajax({
        type: 'GET',
        url: '/manage/shipping/regions',
        data: 'zone=' + $('#orm_country').val(),
        success: function (data) {
            window._regions = data;
            renderRates();
        }
    });
};

function renderRates() {
    $('.js-rates').empty();

    var value = $('#orm_shippingCostRates').val();
    var jsonValue = JSON.parse(value ? value : '[]');
    for (var idx in jsonValue) {
        var itm = jsonValue[idx];
        $('.js-rates').append('<div class="js-rate-container js-rate-container-' + itm.id + '" data-idx="' + idx + '" data-id="' + itm.id + '"></div>');
        renderRate(idx, itm, $('.js-rate-container-' + itm.id));
    }

    $('.js-rates').sortable({
        items: '.js-rate-container',
        handle: ".js-heading",
        stop: function (event, ui) {
            reOrderRatesBasedOnUI();
            renderRates();
        },
        placeholder: {
            element: function (currentItem) {
                return $('<div style="background: lightyellow; height: 150px; margin-bottom: 2em;"></div>')[0];
            },
            update: function (container, p) {
                return;
            }
        }
    }).disableSelection();
};

function renderRate(idx, itm, container) {
    var templateRate = function (options) {

        let mode = window._shippingCostMode;
        let idx = typeof options.idx !== 'undefined' ? options.idx : null;
        let itm = typeof options.itm !== 'undefined' ? options.itm : null;
        let length = typeof options.length !== 'undefined' ? options.length : null;
        let regions = typeof options.regions !== 'undefined' ? options.regions : null;

        let arrowHtml = '';
        if (length > 0) {
            if (idx == 0) {
                arrowHtml += `<a href="#" class="delete-block down right-second js-rate-down"></a>`;
            } else if (idx == length) {
                arrowHtml += `<a href="#" class="delete-block up right-second js-rate-up"></a>`;
            } else {
                arrowHtml += `<a href="#" class="delete-block up right-third js-rate-up"></a>
                            <a href="#" class="delete-block down right-second js-rate-down"></a>`;
            }
        }

        return `<div class="js-blocks section-blocks">
                    <div class="content-block js-block">
                        <div class="block-file js-heading">
                            <h4 class="block-title">&nbsp;</h4>
                            ${arrowHtml}
                            <a href="#" class="delete-block text-danger js-delete-rate"><i class="ti-close"></i></a>
                        </div>
                        <div class="block-widgets">
                            <div class="">
                                <div ${mode != 1 ? `style="display: none;"` : ''} class="orm-widget form-group mb-little">
                                    <label>Shipping regions:</label>
                                    <select class="form-control js-elem js-after-chosen" data-id="regions" multiple>
                                        <option ${itm.regions.indexOf('all') !== -1 ? 'selected' : ''} value="all">All regions</option>
                                        ${window._regions.map((region) => {
                                            return `<option ${itm.regions.indexOf(region.id) !== -1 ? 'selected' : ''} value="${region.id}">${region.title}</option>`;
                                        }).join('')}
                                    </select>
                                </div>
                
                                <section ${mode != 2 ? `style="display: none;"` : ''}>
                                    <div class="orm-widget form-group">
                                        <label>Postcode from:</label>
                                        <input type="text" class="form-control js-elem" data-id="zipFrom" value="${itm.zipFrom}">
                                    </div>
            
                                    <div class="orm-widget form-group">
                                        <label>to:</label>
                                        <input type="text" class="form-control js-elem" data-id="zipTo" value="${itm.zipTo}">
                                    </div>
                                </section>
                                
                                <div class="orm-widget form-group mb-little">
                                    <label>$ / unit (e.g. weight, volume):</label>
                                    <input type="text" class="form-control js-elem" data-id="price" value="${itm.price}">
                                </div>
                            </div>                    
                            <div>
                                <a href="#" class="js-add-extra">Add an extra condition</a>
                                <div class="row pt-1 conditions-container">
                                    <div class="js-extra-title extra-title">
                                        <div class="col-lg-4" style="margin-bottom: 0;">
                                            <label>Units from:</label>
                                        </div>
                            
                                        <div class="col-lg-4" style="margin-bottom: 0;">
                                            <label>to:</label>
                                        </div>
                            
                                        <div class="col-lg-3" style="margin-bottom: 0;">
                                            <label>$:</label>
                                        </div>
                                        
                                        <div class="col-lg-1" style="margin-bottom: 0;">
                                        </div>
                                    </div>
                                </div>           

                                <div class="js-extras"></div>
                            </div>
                        </div>
                    </div>
                </div>`;
    };

    var value = $('#orm_shippingCostRates').val();
    var jsonValue = JSON.parse(value ? value : '[]');
    $(container).html(templateRate({
        mode: window._shippingCostMode,
        idx: idx,
        itm: itm,
        length: jsonValue.length - 1,
        regions: window._regions
    }));

    for (var extraIdx in itm.extra) {
        var extraItm = itm.extra[extraIdx];
        $(container).find('.js-extras').append('<div class="js-extra-container js-extra-container-' + extraItm.id + '" data-idx="' + extraIdx + '" data-id="' + extraItm.id + '"></div>');
        renderRateExtra(extraIdx, extraItm, $('.js-extra-container-' + extraItm.id));
    }

    if (itm.extra.length === 0) {
        $(container).find('.js-extra-title').hide();
    } else {
        $(container).find('.js-extra-title').show();
    }

    $('.js-extras').sortable({
        items: '.js-extra-container',
        stop: function (event, ui) {
            var value = $('#orm_shippingCostRates').val();
            var jsonValue = JSON.parse(value ? value : '[]');

            var rateIdx = $(event.target).closest('.js-rate-container').data('idx');
            var rateId = $(event.target).closest('.js-rate-container').data('id');
            reOrderExtrasBasedOnUI(rateIdx, rateId);
            renderRate(rateIdx, jsonValue[rateIdx], $('.js-extra-container-' + jsonValue[rateIdx].id));
        },
        placeholder: {
            element: function (currentItem) {
                return $('<div style="background: lightyellow; height: 40px; margin-bottom: 1em;"></div>')[0];
            },
            update: function (container, p) {
                return;
            }
        }
    }).disableSelection();

    $(container).find('select:not(.no-chosen)').chosen({
        allow_single_deselect: true,
    });
};

function renderRateExtra(idx, itm, container) {
    var templateRateExtra = function (options = []) {
        let idx = typeof options.idx !== 'undefined' ? options.idx : null;
        let itm = typeof options.itm !== 'undefined' ? options.itm : null;

        return `<div class="row ${idx == 0 ? '' : 'mt-1'}">
                    <div class="col-lg-4">
                        <input type="text" class="form-control js-elem-extra" data-id="from" value="${itm.from}">
                    </div>
            
                    <div class="col-lg-4">
                        <input type="text" class="form-control js-elem-extra" data-id="to" value="${itm.to}">
                    </div>
            
                    <div class="col-lg-3">
                        <input type="text" class="form-control js-elem-extra" data-id="price" value="${itm.price}">
                    </div>
            
                    <div class="col-lg-1 pt-1">
                        <a href="#" class="text-danger js-delete-extra"><i class="ti-close"></i></a>
                    </div>
                </div>`;
    };

    $(container).html(templateRateExtra({
        idx: idx,
        itm: itm,
    }));
};

function getNewRate() {
    return {
        id: uniqid('rate'),
        regions: [],
        zipFrom: '',
        zipTo: '',
        price: '',
        extra: []
    }
};

function getNewRateExtra() {
    return {
        id: uniqid('extra'),
        price: '',
        from: '',
        to: ''
    }
};

function reOrderRatesBasedOnUI() {
    var value = $('#orm_shippingCostRates').val();
    var jsonValue = JSON.parse(value ? value : '[]');
    var ids = $(".js-rates .js-rate-container").map(function () {
        return $(this).data('id');
    }).get();

    var jsonValueMap = {};
    for (var idx in jsonValue) {
        var itm = jsonValue[idx];
        jsonValueMap[itm.id] = itm;
    }

    var newJsonValue = [];
    for (var idx in ids) {
        var id = ids[idx];
        if (typeof jsonValueMap[id] !== 'undefined') {
            newJsonValue.push(jsonValueMap[id]);
        }
    }

    $('#orm_shippingCostRates').val(JSON.stringify(newJsonValue));
};

function reOrderExtrasBasedOnUI(rateIdx, rateId) {
    var value = $('#orm_shippingCostRates').val();
    var jsonValue = JSON.parse(value ? value : '[]');

    var ids = $('.js-rate-container-' + rateId).find(".js-extras .js-extra-container").map(function () {
        return $(this).data('id');
    }).get();

    var extraMap = {};
    for (var idx in jsonValue[rateIdx].extra) {
        var itm = jsonValue[rateIdx].extra[idx];
        extraMap[itm.id] = itm;
    }

    var extra = [];
    for (var idx in ids) {
        var id = ids[idx];
        if (typeof extraMap[id] !== 'undefined') {
            extra.push(extraMap[id]);
        }
    }

    jsonValue[rateIdx].extra = extra;
    $('#orm_shippingCostRates').val(JSON.stringify(jsonValue));
};

function uniqid(prefix) {
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};