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
  const pageTitle = document.querySelector('.page-title h1');
  pageTitle.textContent = `Weather in ${cityName} for ${mode}`;
}

function getWeatherIcon(id) {
  if (id <= 232) return 'thunderstorm.png';
  if (id <= 321) return 'drizzle.png';
  if (id <= 531) return 'rain.png';
  if (id <= 622) return 'snow.png';
  if (id <= 781) return 'atmosphere.png';
  if (id == 800) return 'clear.png';
  else return 'clouds.png';
}

const getTemperatureColor = (temp) => {
  // от -50 до -15
  if (temp <= -50) return '#003f5c';
  if (temp <= -45) return '#2f4b7c';
  if (temp <= -40) return '#5a4b7c';
  if (temp <= -35) return '#6a5c94';
  if (temp <= -30) return '#7b6ea5';
  if (temp <= -25) return '#8b7eb6';
  if (temp <= -20) return '#a092d0';
  if (temp <= -15) return '#b3a4e6';

  // от -15 до 0
  if (temp <= -10) return '#a0c4ff';
  if (temp <= -5)  return '#9bf6ff';
  if (temp <= 0)   return '#b9fbc0';

  // от 0 до 15
  if (temp <= 5)   return '#caffbf';
  if (temp <= 10)  return '#fdffb6';
  if (temp <= 15)  return '#ffeda0';

  // от 15 до 50
  if (temp <= 20)  return '#ffc857';
  if (temp <= 25)  return '#ffa600';
  if (temp <= 30)  return '#ee8979';
  if (temp <= 35)  return '#d45087';
  if (temp <= 40)  return '#b93c7a';
  if (temp <= 45)  return '#933267';
  if (temp <= 50)  return '#6a1b3c';

  return '#6a1b3c';
};

const calculateOffset = (temp) => {
  const baseOffset = -temp * 1.2;
  return Math.max(-20, Math.min(20, baseOffset));
};

const getWindGradient = (wind) => {
  if (wind >= 10) {
    return `linear-gradient(to right, rgba(255, 200, 100, 0.7), rgba(255, 200, 100, 0.2))`;
  }
  return `linear-gradient(to right, rgba(200, 200, 200, 0.7), rgba(200, 200, 200, 0.2))`;
};

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
      const iconId = data.weather[0].id;
      currentCountry = country;
      cityName = name;

      updateForecastHeader();

      currentWeather.innerHTML = `
      <div>
        <div class="current-weather__header">
          ${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getHours()}:${date.getMinutes()}
        </div>
        <div class="current-weather__temperature">
          ${description}, ${temp}&deg;C
        </div>
        <div class="current-weather__feels-like">
          Feels like ${feelsLike}&deg;C
        </div>
      </div>
      <div class="current-weather__icon">
        <img src="assets/${getWeatherIcon(iconId)}" alt="${description}">
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
      const today = new Date().toISOString().split('T')[0];

      data.list.forEach(item => {
        const [date, time] = item.dt_txt.split(' ');

        if (date === today) {
          return;
        }

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
                        <img src="assets/${getWeatherIcon(data.weather.id)}" alt="${data.weather.description}">
                    </div>
                `).join('')}
            </div>
            <div class="temperature-label">
                <p>Temperature, °C</p>
            </div>
            <div class="weather-grid">
              ${Object.entries(times).map(([time, data]) => {
                const temperature = (data.temp - 273.15).toFixed(0);
                const color = getTemperatureColor(temperature);
                const offset = calculateOffset(temperature);
      
                return `
                      <div 
                          class="temperature-grid" 
                          style="background-color: ${color}; transform: translateY(${offset}px);">
                          <p class="temperature-bar">${temperature}</p>
                      </div>
                      `;
              }).join('')}
            </div>
            <div class="wind-label">
                <p>Gusts of wind, m/s</p>
            </div>
            <div class="weather-grid">
                ${Object.entries(times).map(([time, data]) => {
                  const wind = data.wind.toFixed(0);
                  const background = getWindGradient(wind);
        
                  return `
                        <div 
                            class="wind-grid-item" 
                            style="background: ${background};">
                            <p class="wind-value"><i>${wind || '—'}</i></p>
                        </div>
                        `;
                }).join('')}
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

document.addEventListener("DOMContentLoaded", () => {
  getUserCoordinates();
});
