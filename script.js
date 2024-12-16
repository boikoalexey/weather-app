const api_key = '32ad3855434bc59bbf1bc6c3f72012a4';
const cityInput = document.getElementById('city_input');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const currentWeather = document.getElementById('currentWeather');
const navigation = document.querySelector('.navigation');
let currentCountry;
let cityName;
let mode = 'Today';

searchBtn.addEventListener('click', searchCity);
locationBtn.addEventListener('click', getUserCoordinates);
navigation.addEventListener('click', handleNavigationClick);

function getFullLocationName() {
  return `${currentCountry} / ${cityName}`;
}

function searchCity() {
  if (cityInput.classList.contains("visible")) {
    cityInput.classList.remove("visible");
    searchBtn.classList.remove("visible");
    getCityCoordinates()
  } else {
    cityInput.classList.add("visible");
    searchBtn.classList.add("visible");
    cityInput.focus();
  }
}

function handleNavigationClick(event) {
  const target = event.target;

  if (target.tagName === "A") {
    document.querySelectorAll(".navigation a").forEach((link) => {
      link.classList.remove("active");
    });
    
    target.classList.add("active");
    
    mode = target.getAttribute("data-mode");
    
    updateForecastHeader();
  }
}

function updateForecastHeader() {
  const forecastHeader = document.querySelector('.forecast__header h2');
  const forecastSubheader = document.querySelector('.forecast__header p');

  // Обновляем заголовок и подзаголовок
  forecastHeader.textContent = `Weather in ${cityName} for ${mode}`;
  forecastSubheader.textContent = getFullLocationName();
}

function getCityCoordinates() {
  const city = cityInput.value.trim();
  cityInput.value = '';
  if (!city) return;

  const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${api_key}`;

  fetch(GEOCODING_API_URL)
    .then((res) => res.json())
    .then((data) => {
      if (data.length === 0) {
        alert(`City ${city} not found.`);
        return;
      }
      const { name, lat, lon, country } = data[0];
      getWeatherDetails(name, lat, lon, country);
    })
    .catch(() => {
      alert(`Failed to fetch coordinates of ${city}`);
    });
}

function getUserCoordinates() {
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${api_key}`;

    fetch(REVERSE_GEOCODING_URL)
      .then(res => res.json())
      .then(data => {
        const { name, country, state } = data[0];
        getWeatherDetails(name, latitude, longitude, country);
      })
      .catch(() => {
        alert('Failed to fetch user coordinates');
      });
  }, error => {
    if (error.code === error.PERMISSION_DENIED) {
      alert('Geolocation permission denied. Please reset location permission to grant access again');
    }
  });
}

function getWeatherDetails(name, lat, lon, country) {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`;
  const FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`;

  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      const date = new Date();

      const temp = (data.main.temp - 273.15).toFixed(0);
      const feelsLike = (data.main.feels_like - 273.15).toFixed(0);
      const description = data.weather[0].description;
      currentCountry = country;
      cityName = name;

      updateForecastHeader();

      currentWeather.innerHTML = `
      <div class="current-weather__header">
        ${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getHours()}:${date.getMinutes()} &ndash; ${cityName.toUpperCase()} (${currentCountry})
      </div>
      <div class="current-weather__temperature">
        In ${cityName} ${description}, ${(data.main.temp - 273.15).toFixed(0)}&deg;C
      </div>
      <div class="current-weather__feels-like">
        Feels like ${feelsLike}&deg;C
      </div>
    `;
    })
    .catch(() => {
      alert("Failed to fetch current weather data.");
    });


  fetch(FORECAST_API_URL)
    .then(res => res.json())
    .then(data => {
      console.log(data)
      const groupedData = {};

      data.list.forEach(item => {
        const [date, time] = item.dt_txt.split(' ');

        if (!["00:00:00", "06:00:00", "12:00:00", "18:00:00"].includes(time)) {
          return;
        }

        if (!groupedData[date]) {
          groupedData[date] = {};
        }

        groupedData[date][time] = {
          temp: item.main.temp,
          weather: item.weather[0],
          wind: item.wind.gust
        };
      });

      const timeLabels = {
        "00:00:00": "Night",
        "06:00:00": "Dawn",
        "12:00:00": "Noon",
        "18:00:00": "Dusk"
      };

      const cards = Object.entries(groupedData).map(([date, times]) => {
        return `
        <div class="weather-card">
            <h3>${new Date(date).toLocaleDateString('en-EN', { weekday: 'short', day: 'numeric', month: 'long' })}</h3>
            <div class="weather-grid">
                ${Object.entries(times).map(([time, data]) => `
                    <div class="weather-grid-item">
                        <p class="time-label">${timeLabels[time]}</p>
                        <img src="https://openweathermap.org/img/wn/${data.weather.icon}@2x.png" alt="${data.weather.description}">
                    </div>
                `).join('')}
            </div>
            <div class="temperature-label">
                <span class="material-icons">
                  thermostat
                </span>
                <p>Temperature, °C</p>
            </div>
            <div class="weather-grid">
                ${Object.entries(times).map(([time, data]) => `
                    <div class="weather-grid-item">
                        <p class="temperature-value">${(data.temp - 273.15).toFixed(0)}</p>
                    </div>
                `).join('')}
            </div>
            <div class="wind-label">
                <span class="material-icons">
                  air
                </span>
                <p>Gusts of wind, m/s</p>
            </div>
            <div class="weather-grid">
                ${Object.entries(times).map(([time, data]) => `
                    <div class="weather-grid-item">
                        <p class="wind-value">${data.wind.toFixed(0) || '—'}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
      }).join('');

      document.getElementById('weather-container').innerHTML = cards;
    })
    .catch(() => {
      alert('Failed to fetch weather forecast');
    });
}

const container = document.querySelector('#weather-container');
let isDragging = false;
let startX;
let scrollLeft;

container.addEventListener('mousedown', (e) => {
  isDragging = true;
  container.classList.add('active');
  startX = e.pageX - container.offsetLeft;
  scrollLeft = container.scrollLeft;
});

container.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  e.preventDefault();
  const x = e.pageX - container.offsetLeft;
  const walk = (x - startX);
  container.scrollLeft = scrollLeft - walk;
});

container.addEventListener('mouseup', () => {
  isDragging = false;
  container.classList.remove('active');
});

container.addEventListener('mouseleave', () => {
  isDragging = false;
  container.classList.remove('active');
});
