var refreshInterval = 300; // Значение по умолчанию
var lastRefreshKey = "lastRefreshTime";
var refreshIntervalKey = "refreshInterval"; // Ключ для сохранения интервала обновления

function setRefreshTime(interval) {
    refreshInterval = interval;
    document.getElementById("refreshTime").textContent = interval / 60 + " минут";
    var refreshIntervalMillis = interval * 1000;
    clearInterval(intervalID);
    intervalID = setInterval(function() {
        updatePage();
    }, refreshIntervalMillis);
    
    // Сохраняем интервал обновления в localStorage
    localStorage.setItem(refreshIntervalKey, interval);
}

function updatePage() {
    window.location.reload();
}

function updateLastRefreshTime() {
    var currentDate = new Date();
    var hours = currentDate.getHours();
    var minutes = currentDate.getMinutes();
    var seconds = currentDate.getSeconds();
    
    document.getElementById("lastRefreshTime").textContent = hours + ":" + minutes + ":" + seconds;
    
    localStorage.setItem(lastRefreshKey, hours + ":" + minutes + ":" + seconds);
}

var intervalID;
window.onload = function() {
    // Получаем сохраненный интервал обновления, если он есть
    var savedInterval = parseInt(localStorage.getItem(refreshIntervalKey), 10);
    if (!isNaN(savedInterval)) {
        refreshInterval = savedInterval; // Используем сохраненное значение, если оно доступно
    }
    
    setRefreshTime(refreshInterval);
    
    if (localStorage.getItem(lastRefreshKey)) {
        document.getElementById("lastRefreshTime").textContent = localStorage.getItem(lastRefreshKey);
    }
    
    updateLastRefreshTime();
};