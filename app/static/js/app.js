/**
 * Created by paulmakarov on 6/20/15.
 */
(function () {

    var __site = "food";
    var __limit = 5;
    var __total = 0;
    var __currentPage = 1;


    $('#food_btn').on("click", function () {
        __site = "food";
    });

    $('#drug_btn').on("click", function () {
        __site = "drug";
    });

    $(".js-example-basic-single").prepend('<option/>').val(function () {
        return $('[selected]', this).val();
    }).select2({
        width: '35%',
        placeholder: "Select a state"
    });

    $("#go_btn").on("click", function () {
        fetchAPIData(1, __limit);
    });


    function fetchAPIData(currentPage, limit) {

        if (currentPage == 1 && $('#page-selection_top').find('li.active').attr('data-lp') != "1") {
            // Always reset the pagination component to '1' when we kick off a new API query
            $('#page-selection_top').bootpag({page: 1});
        }

        var skip = (currentPage * limit) - limit;
        $.ajax({
            dataType: "json",
            url: "https://api.fda.gov/" + __site + "/enforcement.json",
            data: "search=state:" + $(".js-example-basic-single").val() + "&limit=" + limit + "&skip=" + skip,
            success: function (success) {
                $.publish(success, 'api.returned', [success]);
            },
            error: function (error) {
                $.publish(error, 'error.returned', [error.responseText]);

            }
        });
    }

    $.subscribe('error.returned', this, function (event, data) {
        data = $.parseJSON(data);
        $('.flash').removeClass("alert-success").addClass("alert-danger");
        $(".flash #message").empty().html(data.error.message);
        $('.flash').fadeIn(500).delay(2000).fadeOut(500);

    });

    /**
     * Subscribe to the "API Returned" Event
     * Init Pagination Component
     */
    $.subscribe('api.returned', this, function (event, data) {

        console.log('total: ' + data.meta.results.total);
        //TODO: Replace hardcode logic w/ currentPage, skip, and total forumula
        $("#content").html("Showing results 1 thru 5 of " + data.meta.results.total);
        // init pagination component
        $('#page-selection_top').bootpag({
            total: __total = Math.ceil(data.meta.results.total / 5),
            maxVisible: 5,
            leaps: true,
            firstLastUse: false,
            first: '←',
            last: '→',

        }).on("page", function (event, num) {

            if (num != __currentPage) {
                __currentPage = num;
                $.publish(event, 'paginator.changed', [num]);
            }

        });


        if (data.results.length > 0) {
            $('#no_results_text').hide();
        }
        else {
            $('#no_results_text').html("You haven't fetched any data yet...");
        }

        var dataTable = $('#data_table > tbody');
        dataTable.empty(); // delete the table before we rewrite

        $.each(data.results, function (i, item) {
            var tableRow = '<tr>';
            tableRow += '<td>' + data.results[i].status + '</td>';
            tableRow += '<td>' + data.results[i].reason_for_recall + '</td>';
            tableRow += '<td>' + data.results[i].product_description + '</td>';
            tableRow += '<td>' + data.results[i].city + '</td>';
            tableRow += '</tr>';
            $(tableRow).appendTo(dataTable);
        });


    });

    $.subscribe('paginator.changed', this, function (event, data) {
        fetchAPIData(data, __limit);
    });

})();

