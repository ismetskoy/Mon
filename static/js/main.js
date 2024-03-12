var interval; 

function showTableLoading(isLoading) {
    var dataTable = $("#dataTable");
    var loadingSpinner = $("#loadingSpinner");
    var reloadMessage = $("#reloadMessage"); 

    if (isLoading) {
        dataTable.hide(); 
        loadingSpinner.show(); 
        reloadMessage.hide(); 
    } else {
        loadingSpinner.hide(); 
        dataTable.show(); 
    }
}

function updateTimer() {
    var start = Date.now();
    interval = setInterval(function() {
        var elapsed = Math.floor((Date.now() - start) / 1000);
        $(".timer").html(elapsed + "s <br>Идёт загрузка ... </br>");

        if(elapsed >= 120) { 
            clearInterval(interval); 
            $("#reloadMessage").show(); 
        }
    }, 1000);
}

function loadData() {
    showTableLoading(true);
    updateTimer();

    $.getJSON('/get-data')
        .done(function(response) {
            clearInterval(interval);
            showTableLoading(false);
            $('#reloadMessage').hide();
            $('#downloadExcelButton').show();

            var total = 0;
            var tbody = $("#dataTable tbody");
            tbody.empty();

            if (response.data && response.data.length > 0) {
                response.data.forEach(function(item) {
                    var count = parseInt(item.count_app_id, 10);
                    total += isNaN(count) ? 0 : count;
                    var row = "<tr><td>" + item.code + "</td><td>" + (isNaN(count) ? '' : count) + "</td></tr>";
                    tbody.append(row);
                });

                tbody.append("<tr style='font-weight:bold'><td>Общий итог</td><td>" + total + "</td></tr>"); 
            }
        })
        .fail(function(error) {
            console.error("Error loading data: ", error);
            clearInterval(interval);
            showTableLoading(false);
        });
}

$(document).ready(function() {
    loadData();

    $(document).on('click', '#downloadExcelButton', function() {
        $(this).hide();
        $('#downloadingMessage').show().css('animation', 'blink 1s step-start infinite');

        var stopBlinking = function() {
            $('#downloadingMessage').css('animation', 'none').hide();
        };
        setTimeout(stopBlinking, 60000);
    });
});