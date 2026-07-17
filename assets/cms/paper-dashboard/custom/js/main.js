require ('../../library/css/bootstrap.min.css');
require ('../../library/css/paper-dashboard.css');
require ('../../library/css/demo.css');
require ('../../library/css/themify-icons.css');
require ('../css/main.scss');

import $ from '../../library/js/jquery.min.js';
window.$ = $;
// window.jQuery = $;

import '../../custom/jquery-ui-1.11.4.custom/jquery-ui.min.js';

import PerfectScrollbar from '../../library/js/perfect-scrollbar.min.js';
window.PerfectScrollbar = PerfectScrollbar;

import '../../library/js/bootstrap.min.js';

import '../../library/js/jquery.validate.min.js';
import '../../library/js/bootstrap-selectpicker.js';
import '../../library/js/bootstrap-switch-tags.js';
import '../../library/js/jquery.easypiechart.min.js';

import '../../library/js/bootstrap-notify.js';

import '../../library/js/sweetalert2.js';
import '../../library/js/jquery-jvectormap.js';
import '../../library/js/jquery.bootstrap.wizard.min.js';

import '../../library/js/bootstrap-table.js';
import '../../library/js/paper-dashboard.js';
import '../../library/js/demo.js';
import swal from '../../library/js/sweetalert2.js';

(function() {
    if ($('body').hasClass('page-login')) {
        demo.checkFullPageBackgroundImage();

        setTimeout(function(){
            // after 1000 ms we add the class animated to the login/register card
            $('.card').removeClass('card-hidden');
        }, 700);
    }
})();

function confirm(callback, options = null) {

    var title = options && typeof options.title !== 'undefined' ? options.title : 'Confirmation';
    var text = options && typeof options.text !== 'undefined' ? options.text : 'Click confirm to proceed';
    var type = options && typeof options.type !== 'undefined' ? options.type : 'warning';
    var confirmButtonColor = options && typeof options.confirmButtonColor!== 'undefined' ? options.confirmButtonColor : '#DD6B55';
    var confirmButtonText = options && typeof options.confirmButtonText !== 'undefined' ? options.confirmButtonText : 'Confirm';
    var confirmed = options && typeof options.confirmed !== 'undefined' ? options.confirmed : null;

    var options = {
        title: title,
        text: text,
        type: type,
        confirmButtonColor: confirmButtonColor,
        confirmButtonText: confirmButtonText,
        showCancelButton: true,
    };

    swal(options).then(function(result) {
        if (result.value) {
            callback(() => {
                if (confirmed) {
                    swal({
                        title: confirmed.title,
                        text: confirmed.text,
                        type: 'success',
                        showConfirmButton: false,
                        timer: 1000,
                    });
                }
            });
        }
    });
};
window.confirm = confirm;