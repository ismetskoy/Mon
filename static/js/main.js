$(document).ready(function() {
    function setLoading(isLoading) {
        if (isLoading) {
			$('body').addClass('loading').append('<div class="loadingOverlay"><div class="blinkText">Идёт Загрузка <span id="seconds"></span><br><span style="text-align: center; font-size: 10px; padding: 10px 15px; display: block; margin: 0 auto;">обычно не больше 1 минуты</span></div></div>');
            let seconds = 0;
            let secondsInterval = setInterval(function() {
                seconds++;
                document.getElementById('seconds').innerText = ' - ' + seconds;
            }, 1000);
        } else {
            $('body').removeClass('loading');
            $('.loadingOverlay').remove();
            clearInterval(secondsInterval); // Остановка таймера при завершении загрузки
        }
    }

            function loadData() {
                setLoading(true);

                $.getJSON('/get-data', function(response) {
                    setLoading(false);
                    $('#downloadExcelButton').show(); // Show the download button after loading

                    var total = 0;
                    if (response.data && response.data.length > 0) {
                        var tbody = $("#dataTable tbody");
                        tbody.empty(); // Clear current table data
                        response.data.forEach(function(item) {
                            var count = parseInt(item.count_app_id, 10);
                            total += isNaN(count) ? 0 : count;
                            var row = "<tr>" + 
                                        "<td>" + item.code + "</td>" + 
                                        "<td>" + (isNaN(count) ? '' : count) + "</td>" +
                                    "</tr>";
                            tbody.append(row);
                        });

                        // Adding total row
                        tbody.append("<tr style='font-weight:bold'><td>Общий итог</td><td>" + total + "</td></tr>");
                    }
                });
            }

            loadData(); // Load data on page open

            $(document).on('click', '#downloadExcelButton', function() { // Ensuring binding works even after manipulating the DOM
                $(this).hide(); // Hide download button
                $('#downloadingMessage').show().css('animation', 'blink 1s step-start infinite'); // Show downloading message and ensure animation

                // Stop blinking and hide after 60 seconds
                setTimeout(function(){
                    $('#downloadingMessage').css('animation', 'none').hide();
                }, 60000);
            });
        });