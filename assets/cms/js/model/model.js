require('../cms');

import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App';
// import store from './stores/store'
// import { Provider } from 'react-redux'

(function () {
    $(document).on('switchChange.bootstrapSwitch', '.js-model-form-checkbox', function () {
        var field = $(this).data('field');
        var value = $(this).is(':checked') ? 0 : 1;

        var elemId = '#model_' + field + '_' + value;
        $(elemId).prop('checked', 'checked')
    });

    $(document).on('change', '#model_listingType', function () {
        if ($(this).val() == 2 ) {
            $('#model_listingType_container').show();

            $('select.js-chosen:visible').chosen({
                allow_single_deselect: true,
            });
        } else {
            $('#model_listingType_container').hide();
        }
    });
})();

ReactDOM.render(
    <App />,
    document.getElementById('modelColumnsJsonContainer')
);