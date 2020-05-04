var citySearch;
var searchHistoryArr = [];

$(document).ready(function () {

    $("#five-day-forecast-container").hide();
    displayHistory();
    clearHistory();
    clickHistory()

    function search(cityname) {
        var APIKey = "3dfabf2b0565a466054d6a68c0f34740";
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityname + "&appid=" + APIKey;

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            var currentDate = new Date();
            var name = response.name;
            $("#city-name").text(response.name + " (" + currentDate.toLocaleDateString('en-US') + ") ");
            $("#current-pic").attr("src", "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png");

            storeHistory(name);

            var tempKelvin = response.main.temp
            var cityTemp = (((tempKelvin - 273.15) * 9) / 5 + 32).toFixed(2);
            $("#temperature").html("<b> Temperature: </b>" + cityTemp + " °F");

            $("#humidity").html("<b> Humidity: </b>" + response.main.humidity + " %");

            $("#wind-speed").html("<b> Wind Speed: </b>" + response.wind.speed + " MPH");

            var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=7e4c7478cc7ee1e11440bf55a8358ec3&lat=" + response.coord.lat + "&lon=" + response.coord.lat;
            $.ajax({
                url: uvURL,
                method: "GET"
            }).then(function (uvResponse) {
                var uvIndex = uvResponse.value;

                $('#UV-index').html(
                    '<b>UV Index: </b>' +
                    '<span class="badge badge-pill badge-light" id="uvi-badge">' +
                    uvIndex +
                    '</span>'
                );

                if (uvIndex < 3) {
                    $('#uvi-badge').css('background-color', 'green');
                } else if (uvIndex < 6) {
                    $('#uvi-badge').css('background-color', 'yellow');
                } else if (uvIndex < 8) {
                    $('#uvi-badge').css('background-color', 'orange');
                } else if (uvIndex < 11) {
                    $('#uvi-badge').css('background-color', 'red');
                } else {
                    $('#uvi-badge').css('background-color', 'purple');
                }
            });
        });

        var APIKey = "3dfabf2b0565a466054d6a68c0f34740";
        var forecastQueryURL =
            'https://api.openweathermap.org/data/2.5/forecast?q=' + cityname + "&appid=" + APIKey;

        $.ajax({
            url: forecastQueryURL,
            method: "GET"
        }).then(function (forecastResponse) {
            $("#five-day-forecast-container").show();

            var forecastResults = forecastResponse;
            var forecastArr = [];

            for (var i = 5; i < 40; i += 8) {
                var forecastObj = {};
                var forecastResultsDate = forecastResults.list[i].dt_txt;
                var forecastDate = new Date(forecastResultsDate).toLocaleDateString('en-US');
                var forecastTemp = forecastResults.list[i].main.temp;
                var forecastHumidity = forecastResults.list[i].main.humidity;
                var forecastIcon = forecastResults.list[i].weather[0].icon;

                forecastObj['list'] = {};
                forecastObj['list']['date'] = forecastDate;
                forecastObj['list']['temp'] = forecastTemp;
                forecastObj['list']['humidity'] = forecastHumidity;
                forecastObj['list']['icon'] = forecastIcon;

                forecastArr.push(forecastObj);
            }

            for (var j = 0; j < 5; j++) {
                var forecastArrDate = forecastArr[j].list.date;
                var forecastArrTemp = (((forecastArr[j].list.temp - 273.15) * 9) / 5 + 32);
                var forecastArrHumidity = forecastArr[j].list.humidity;
                var forecastIconURL =
                    "https://openweathermap.org/img/w/" + forecastArr[j].list.icon + '.png';

                $('#date-' + (j + 1)).text(forecastArrDate);
                $('#weather-image-' + (j + 1)).attr('src', forecastIconURL);
                $('#temp-' + (j + 1)).text(
                    'Temp: ' + Math.floor(forecastArrTemp) + ' °F'
                );
                $('#humidity-' + (j + 1)).text(
                    'Humidity: ' + forecastArrHumidity + '%'
                );
            }
        });
    }

    // Search button function for when it's clicked
    $("#search-button").on("click", function () {
        var cityName = $("#city-input").val().trim();
        search(cityName);

        // Clear results after searching
        $("#city-input").val("");
    });

    $("#city-input").keypress(function (event) {

        if (event.keyCode === 13) {
            event.preventDefault();
            $("#search-button").click();
        }
    });

    function storeHistory(citySearchName) {
        var searchHistoryObj = {};

        if (searchHistoryArr.length === 0) {
            searchHistoryObj["city"] = citySearchName;
            searchHistoryArr.push(searchHistoryObj);
            localStorage.setItem("searchHistory", JSON.stringify(searchHistoryArr));
        } else {
            var checkHistory = searchHistoryArr.find(
                ({ city }) => city === citySearchName
            );

            if (searchHistoryArr.length < 5) {
                if (checkHistory === undefined) {
                    searchHistoryObj["city"] = citySearchName;
                    searchHistoryArr.push(searchHistoryObj);
                    localStorage.setItem(
                        "searchHistory",
                        JSON.stringify(searchHistoryArr)
                    );
                }
            } else {
                if (checkHistory === undefined) {
                    searchHistoryArr.shift();
                    searchHistoryObj["city"] = citySearchName;
                    searchHistoryArr.push(searchHistoryObj);
                    localStorage.setItem(
                        "searchHistory",
                        JSON.stringify(searchHistoryArr)
                    );
                }
            }
        }
        $("#history").empty();
        displayHistory();
    }

    function displayHistory() {
        var getLocalSearchHistory = localStorage.getItem("searchHistory");
        var localSearchHistory = JSON.parse(getLocalSearchHistory);

        if (getLocalSearchHistory === null) {
            createHistory();
            getLocalSearchHistory = localStorage.getItem("searchHistory");
            localSearchHistory = JSON.parse(getLocalSearchHistory);
        }

        for (var i = 0; i < localSearchHistory.length; i++) {
            var historyLi = $("<li>");
            historyLi.addClass("list-group-item");
            historyLi.text(localSearchHistory[i].city);
            $("#history").prepend(historyLi);
        }
        return (searchHistoryArr = localSearchHistory);
    }

    function createHistory() {
        searchHistoryArr.length = 0;
        localStorage.setItem("searchHistory", JSON.stringify(searchHistoryArr));
    }

    function clearHistory() {
        $("#clear-history").on("click", function () {
            $("#history").empty();
            localStorage.removeItem("searchHistory");
            createHistory();
        });
    }

    function clickHistory() {
        $("#history").on('click', 'li', function () {
            var cityNameHistory = $(this).text();
            search(cityNameHistory);
        });
    }
});