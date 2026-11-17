const cityInput = document.getElementById("city-input")
const searchbtn = document.getElementById("search-btn")
const cityName = document.getElementById("city-name")
const temperatureElement = document.getElementById("temperature")
const weather = document.getElementById("weather-condition")
const humidityElement = document.getElementById("humidity")
const wind = document.getElementById("wind")
const error = document.getElementById("error-message")
let requestId = 0;

function clearWeather() {
    cityName.textContent = ""
    temperatureElement.textContent = ""
    humidityElement.textContent = ""
    weather.textContent = ""
    wind.textContent = ""
}

function handleSearch() {
    if (cityInput.value.trim() === "") {
        error.textContent = "Please enter a city name!"
        clearWeather()
        return
    }
    error.textContent = ""
    searchWeather(cityInput.value.trim());
}
searchbtn.addEventListener("click", () => {
    handleSearch()
})

cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        handleSearch()
    }
})

async function getCoordinates(city) {
    try {
        let response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`)
        if (!response.ok) {
            return;
        }
        let result = await response.json()

        if (!result.results || result.results.length === 0) {
            return;
        }

        return {
            "latitude": result.results[0].latitude,
            "longitude": result.results[0].longitude
        }
    } catch (err) {
        throw err
    }
}

async function searchWeather(city) {
    let currentRequestId = ++requestId;
    try {
        if (currentRequestId === requestId){
            error.textContent = "Loading Weather......"
        }
        let data = await getCoordinates(city)
        if (data === undefined || data.latitude === undefined || data.longitude === undefined) {
            if (currentRequestId !== requestId) {
                return;
            }
            error.textContent = "Data not available"
            clearWeather()
            return;
        }

        let weatherData = await getWeather(data.latitude, data.longitude)
        if (weatherData === undefined) {
            if (currentRequestId !== requestId) {
                return;
            }
            error.textContent = "Data not available"
            clearWeather()
            return
        }

        if (currentRequestId !== requestId) {
            return;
        }
        cityName.textContent = city;

        temperatureElement.textContent = `Temperature: ${weatherData.temperature}°C`
        humidityElement.textContent = `Humidity: ${weatherData.humidity}%`
        wind.textContent = `Wind: ${weatherData.windSpeed} km/h`
        let weatherInfo = getWeatherDescription(weatherData.weatherCode)
        weather.textContent = `Weather Info: ${weatherInfo}`

        error.textContent = ""
    }
    catch (err) {
        if (currentRequestId === requestId) {
            error.textContent = "Something went Wrong. Please try again."
            clearWeather()
            console.error(err)
        }

    }

}


async function getWeather(latitude, longitude) {
    try {
        let response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`)

        if (!response.ok) {
            return;
        }

        let result = await response.json()

        let temperature = result.current.temperature_2m;
        let humidity = result.current.relative_humidity_2m;
        let windSpeed = result.current.wind_speed_10m;
        let weatherCode = result.current.weather_code

        return { temperature: temperature, humidity: humidity, windSpeed: windSpeed, weatherCode: weatherCode };
    } catch (err) {
        throw err
    }

}


function getWeatherDescription(code) {

    switch (code) {
        case 0:
            return "Clear sky"
        case 1:
            return "Mainly clear"
        case 2:
            return "Partly cloudy"
        case 3:
            return "Overcast"
        case 45:
        case 48:
            return "Fog"
        case 51:
        case 53:
        case 55:
            return "Drizzle"
        case 61:
        case 63:
        case 65:
            return "Rain"
        case 71:
        case 73:
        case 75:
            return "Snow"
        case 95:
            return "Thunderstorm"
        default:
            return "Unknown Weather"

    }
}
