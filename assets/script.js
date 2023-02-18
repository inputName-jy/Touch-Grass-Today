// Global Variables to be used throughout the code
var apiKey = "4315e854602314535f49350f88f628cd";
var day = dayjs().format('M/D/YYYY');
var searchHistory = getLocalStorage();

// Function to get the local storage
function getLocalStorage() {
    return JSON.parse(localStorage.getItem('previousCity')) || [];
};

// Function to capitalize the first letter of each word for city names
const titleCase = (s) => s.replace(/\b\w/g, c => c.toUpperCase());

// Function to initialize the weather search based on the city name input of the user
$('#search-button').on('click', function(event){
    event.preventDefault();
    var searchedCity = $('#cityInput').val().trim();
    if(!searchHistory.includes(searchedCity)) {
    searchHistory.push(searchedCity);
    }
    localStorage.setItem('previousCity', JSON.stringify(searchHistory));
    getLatLong(searchedCity);
    getSearchHistory();
    $('#cityInput').val('');
});

// Function to render previous search inputs as buttons from local storage
function getSearchHistory() {
    $('#historyView').empty();
    for (var i = 0; i < searchHistory.length; i++) {
        var cityHistory = searchHistory[i];
        var cityHistoryBtn = $('<button>');
        cityHistoryBtn.addClass('btn btn-secondary');
        cityHistoryBtn.attr('id', 'saved-search');
        cityHistoryBtn.text(titleCase(cityHistory));
        $('#historyView').append(cityHistoryBtn);
    }
}

// Function to display the weather and forecast based on the previous search button clicked
function displayPreviousSearch() {
    var savedCity = $(this).text();
    $('#forecast').empty();
    getLatLong(savedCity);
}

// Event listener to display the weather and forecast based on the previous search button clicked
$(document).on('click', '#saved-search', displayPreviousSearch);

// Function to clear the search history section and local storage
function clearHistory() {
    var clearBtn = $('<button>');
    clearBtn.addClass('btn btn-outline-danger text-center');
    clearBtn.text('Clear History');

    $(clearBtn).on('click', function(event) {
        event.preventDefault();
        window.localStorage.clear();
        $('#historyView').empty();
        searchHistory = [];
    });
    $('#clearHistory').append(clearBtn);
}

// Function to get the latitude and longitude based on the city name input
function getLatLong(searchedCity){
    var latLongUrl =`https://api.openweathermap.org/geo/1.0/direct?q=${searchedCity}&limit=1&appid=${apiKey}`

    fetch(latLongUrl).then(function(res){
        return res.json();
    }).then(function(data){
        if(data.length === 0) {
            alert(
            `City not found.
Please enter a valid city name.`);
            return;
        } else {
            var lat = data[0].lat;
            var lon = data[0].lon;
            getWeather(lat, lon, searchedCity);
            getForecast(lat, lon, searchedCity);
        }
    })
}

// Function to get the current weather based on the latitude and longitude passed in from the getLatLong function
function getWeather(lat, lon, searchedCity) {
    var weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`

    fetch(weatherUrl).then(function(res){
        return res.json();
    }).then(function(data){
       
        $('#weatherTitle').text(`${titleCase(searchedCity)} ${day}`);
        $('#weatherTitle').append(`<br> <img class="align-self-center" src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="weather icon"></img>`)
        var weatherArea = $('#weather');
        weatherArea.empty();
        weatherArea.append(`
        <p class="card-text text-center">Temperature: ${data.main.temp}°F</p>
        <p class="card-text text-center">Feels Like: ${data.main.feels_like}°F</p>
        <p class="card-text text-center">Low: ${data.main.temp_min}°F / High: ${data.main.temp_max}°F</p>
        <p class="card-text text-center">Humidity: ${data.main.humidity}%</p>
        <p class="card-text text-center">Wind Speed: ${data.wind.speed} MPH</p>
        `)
    })
}

// Function to get the 4 day forecast based on the latitude and longitude passed in from the getLatLong function
function getForecast(lat, lon, searchedCity) {
    var forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

    $('#forecast').empty();

    fetch(forecastUrl).then(function(res){
        return res.json();
    }).then(function(data){

        for(var i = 8; i < data.list.length; i++) {
            if (data.list[i].dt_txt.includes('12:00:00')) {
                $('#forecast').append(`
                <div class="card col-2 mx-auto">
                  <h4 class="card-title text-center">${dayjs.unix(data.list[i].dt).format('M/D/YYYY')}</h4><br>
                  <img class="align-self-center" src="https://openweathermap.org/img/wn/${data.list[i].weather[0].icon}@2x.png" alt="weather icon"></img>
                  <p class="card-text text-center">Temp: ${data.list[i].main.temp}°F</p>
                    <p class="card-text text-center">Feels Like: ${data.list[i].main.feels_like}°F</p>
                  <p class="card-text text-center">Humidity: ${data.list[i].main.humidity}%</p>
                  <p class="card-text text-center">Wind Speed: ${data.list[i].wind.speed}MPH</p>
                </div>
                `)
            }
        }
    })
}

//invoking the getSearchHistory and clearHistory functions
getSearchHistory();
clearHistory();
