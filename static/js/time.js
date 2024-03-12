var refreshInterval = 300;

function setRefreshTime(interval) {
    refreshInterval = interval;
    localStorage.setItem('refreshInterval', interval);
    document.getElementById("refreshTime").textContent = interval / 60 + " минут";
    var refreshIntervalMillis = interval * 1000;
    clearInterval(intervalID); 
    intervalID = setInterval(function() {
        updatePage();
    }, refreshIntervalMillis);
}

function updatePage() {
    window.location.reload();
    updateLastRefreshTime();
}

function updateLastRefreshTime() {
    var currentDate = new Date();
    var hours = currentDate.getHours();
    var minutes = currentDate.getMinutes();
    var seconds = currentDate.getSeconds();
    document.getElementById("lastRefreshTime").textContent = hours + ":" + minutes + ":" + seconds;
}

var intervalID; 

window.onload = function() {
    var savedInterval = parseInt(localStorage.getItem('refreshInterval'), 10) || refreshInterval;
    setRefreshTime(savedInterval);
    updateLastRefreshTime();
};