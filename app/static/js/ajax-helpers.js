/**
 * Created by paulmakarov on 6/20/15.
 */
(function(){

    var submitAjaxRequest = function(e) {
        e.preventDefault();

        var form = $(this)
        var method = form.find('input[name="_method"]').val() || "POST";

        $.ajax({
            type: method,
            url: form.prop('action'),
            data: form.serialize(),
            success: function() {
                $.publish('form.submitted', form);
            }
        });
    };

    // forms tagged w/ data-remote will submit via Ajax
    $('form[data-remote]').on('submit', submitAjaxRequest);

    // the data-click attributes immediately submits a form request onChange
    $('*[data-click-submits-form]').on('change', function() {
       $(this).closest('form').submit();
    });

})();