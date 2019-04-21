(function() {
  const madridData = {};
  const mainSection = document.getElementById('main-section');

  /**
   * Fetches data from airMadrid API and traffic cameras
   * @param {String} url
   * @this window
   * @returns {Promise}
   */
  function ajaxRequest(url) {
    return new Promise(function(resolve, reject) {
      const request = new XMLHttpRequest();
      request.onload = function() {
        if (request.readyState === 4 && request.status === 200) {
          const data = JSON.parse(request.responseText);
          resolve(data);
        } else {
          const error = {
            status: request.status,
            statusText: request.statusText
          };
          reject(error);
        }
      };

      request.onerror = function() {
        reject({
          status: request.status,
          statusText: request.statusText
        });
      };
      request.open('GET', url, true);
      request.send();
    });
  }

  /**
   * Creates an array with the different endpoints to fetch the data from the
   * airMadrid API and the camera numbers file.
   * @this window
   * @returns {Promise}
   */
  function getInitialData() {
    const aireMad = 'http://airemad.com/api/v1/';
    const plazaEsPollution = `${aireMad}pollution/S004`;
    const plazaEsAcustic = `${aireMad}acustic/S004`;
    const arganzuela = `${aireMad}pollen/P002`;
    const clima = `${aireMad}weather/global`;
    const gripe = `${aireMad}flu`;
    const endPoints = [
      plazaEsPollution,
      plazaEsAcustic,
      arganzuela,
      clima,
      gripe,
      'scripts/cammeraNumbers.json'
    ];

    return Promise.all(endPoints.map(ajaxRequest));
  }

  /**
   * Extracts the pollution values to be painted in the DOM
   * @param {Object} data response object
   * @this Window
   * @returns {void}
   */
  function renderPollutionData(data) {
    const pollutionSec = document.querySelector('.pollution');
    const sectionTitle = `<h3>Polución</h3>`;
    pollutionSec.insertAdjacentHTML('afterbegin', sectionTitle);
    let template = '';

    for (const key in data) {
      if (typeof data[key] === 'object') {
        template = `
          <p><span class="name">${data[key].parameter} (${
          data[key].abrebiation
        })</span>: ${
          data[key].values[0].valor
        } &#181;g/m<sup>3</sup> medido por ${data[key].technique}</p>
        `;
      }
      pollutionSec.insertAdjacentHTML('beforeend', template);
    }
  }

  /**
   * Extracts the acoustic values to be painted in the DOM
   * @param {Object} data response object
   * @this Window
   * @returns {void}
   */
  function renderAcousticData(data) {
    const noiseSec = document.querySelector('.noise');
    const sectionTitle = `<h3>Ruido</h3>`;
    noiseSec.insertAdjacentHTML('afterbegin', sectionTitle);
    let template = '';

    for (const key in data) {
      if (key !== 'date') {
        template = `
          <p>${key}: ${data[key]}</p>`;

        noiseSec.insertAdjacentHTML('beforeend', template);
      }
    }
  }

  /**
   * Extracts the pollen values to be painted in the DOM
   * @param {Object} data response object
   * @this Window
   * @returns {void}
   */
  function renderPollenData(mediciones) {
    const pollenSec = document.querySelector('.pollen');
    const sectionTitle = `<h3>Polen</h3>`;
    pollenSec.insertAdjacentHTML('afterbegin', sectionTitle);
    let template = '';

    for (const key in mediciones) {
      template = `
      <p>${key}: ${mediciones[key].valor}, ${mediciones[key].resumen}</p>
    `;
      pollenSec.insertAdjacentHTML('beforeend', template);
    }
  }

  /**
   * Creates n-item chunks from an array of objects
   * @param {Array} array of forecast objects
   * @param {Number} number the size we want the chunks
   * @this Window
   * @see {@link https://medium.com/@Dragonza/four-ways-to-chunk-an-array-e19c889eac4}
   * @returns {Array} with arrays of n objects each
   */
  function chunk(array, size) {
    const chunkedArray = [];
    let index = 0;
    while (index < array.length) {
      chunkedArray.push(array.slice(index, size + index));
      index += size;
    }

    return chunkedArray;
  }

  /**
   * Creates two different arrays, one with today's weather data and the other,
   * with the next five-day weather forecast
   * @param {Object} data response object
   * @this Window
   * @returns {Array} with the 6AM weather forecast for the next five days
   */
  function fiveDayForecast(data) {
    var today = new Date();
    var day = today.getDay();
    var todayData = [];
    var restOfDays = [];

    data.forEach(function(date) {
      var today2 = new Date(date.dt_txt);
      var day2 = today2.getDay();
      if (day === day2) {
        todayData.push(date);
      } else {
        restOfDays.push(date);
      }
    });
    var chunks = chunk(restOfDays, 8);
    return [
      chunks[0][2],
      chunks[1][2],
      chunks[2][2],
      chunks[3][2],
      chunks[4][2]
    ].filter(Boolean);
  }

  /**
   * Extracts the five-day forecast values to be painted in the DOM
   * @param {Object} data response object
   * @this Window
   * @returns {String} template
   */
  function forecast(data) {
    let forecast = fiveDayForecast(data);
    const options = {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    };

    return forecast
      .map(function(day) {
        const date = new Date(day.dt_txt);
        const today = date.toLocaleDateString('es-ES', options);
        return `
        <div>
          <h4 class="weather-description">${today}</h4>
          <p class="weather-description">${
            day.weather[0].description
          }<i class="wi wi-owm-${day.weather[0].id}"></i></p>
          <p>Min: ${day.main.temp_min}<sup>o</sup>C</p>
          <p>Max: ${day.main.temp_max}<sup>o</sup>C</p>
        </div>
      `;
      })
      .join('');
  }

  /**
   * Extracts the current day weather values to be painted in the DOM
   * @param {Object} data response object
   * @this Window
   * @returns {String} template
   */
  function mainWeather(weatherData) {
    const weatherDescription = weatherData.weather[0];
    const mainWeatherSec = weatherData.main;
    const wind = weatherData.wind;
    const date = new Date();
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const today = date.toLocaleDateString('es-ES', options);

    let template = `
    <div class="main-weather-section">
    <h3 class="weather-description">${today}</h3>
    <div class="weather-mainTitle">
    <p class="weather-description">${weatherDescription.description}</p>
    <i class="wi wi-owm-${weatherDescription.id} main-icon"></i>
    </div>
    <p>Min: ${mainWeatherSec.temp_min}<sup>o</sup>C</p>
    <p>Max: ${mainWeatherSec.temp_max}<sup>o</sup>C</p>
    <p>Humedad: ${mainWeatherSec.humidity}</p>
    <p>Viento: ${wind.speed} k/h</p>
    </div>
    `;
    return template;
  }

  /**
   * Creates the main sections (main section, forecast section and weather
   * section) in the DOM
   * @param {Object} data response object
   * @this Window
   * @returns {void}
   */
  function renderWeatherData(data) {
    const weatherSec = document.createElement('div');
    const forecastSec = document.getElementById('forecast-section');
    weatherSec.classList.add('weather');
    const todayTemplate = mainWeather(data[0]);
    const forecastTemplate = forecast(data);

    weatherSec.insertAdjacentHTML('afterbegin', todayTemplate);
    forecastSec.insertAdjacentHTML('beforeend', forecastTemplate);
    mainSection.append(weatherSec);
  }

  /**
   * Extracts the flu values to be painted in the DOM
   * @param {Object} data response object
   * @this Window
   * @returns {void}
   */
  function renderFluData(fluData) {
    const fluSec = document.querySelector('.flu');
    const sectionTitle = `<h3>Gripe</h3>`;
    fluSec.insertAdjacentHTML('afterbegin', sectionTitle);
    let template = '';
    const centinela = fluData.detecciones_totales.detecciones_centinela;
    const noCentinela = fluData.detecciones_totales.detecciones_no_centinela;

    template = `
      <p>Fecha del informe: ${fluData.informe_fecha}</p>
      <p>semana: ${fluData.semana}</p>
      <p>Nivel de difusión: ${fluData.madrid.nivel_difusion}</p>
      <p>Nivel de intensidad: ${fluData.madrid.nivel_intensidad}</p>
      <p>Muestras Examinadas: ${
        fluData.madrid.muestras_centinelas_examinadas
      }</p>
      <p>Muestras positivas: ${fluData.madrid.porcentaje_muestras_positivas}</p>
      <h4>Detecciones centinela:</h4> <p>AH3: ${
        centinela.AH3
      } <span class="divider">|</span> AH3N2: ${
      centinela.AH3N2
    } <span class="divider">|</span> ANS: ${
      centinela.ANS
    } <span class="divider">|</span> AnH1: ${
      centinela.AnH1
    } <span class="divider">|</span> AnH1N1: ${
      centinela.AnH1N1
    } <span class="divider">|</span> B: ${
      centinela.B
    } <span class="divider">|</span> C: ${centinela.C}</p>
      <h4>Detecciones no centinela:</h4> <p>AH3: ${
        noCentinela.AH3
      } <span class="divider">|</span> AH3N2: ${
      noCentinela.AH3N2
    } <span class="divider">|</span> ANS: ${
      noCentinela.ANS
    } <span class="divider">|</span> AnH1: ${
      noCentinela.AnH1
    } <span class="divider">|</span> AnH1N1: ${
      noCentinela.AnH1N1
    } <span class="divider">|</span> B: ${
      noCentinela.B
    } <span class="divider">|</span> C: ${noCentinela.C}</p>
      `;

    fluSec.insertAdjacentHTML('beforeend', template);
  }

  /**
   * Generates a random number to get a random image from the traffic cameras
   * @param {Object} data response object
   * @this Window
   * @returns {String} link to the random traffic camera
   */
  function getRandomCamera(data) {
    const min = Math.ceil(0);
    const max = Math.floor(data.length);
    const cameraNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    return `http://informo.munimadrid.es/cameras/Camara${
      data[cameraNumber]
    }.jpg`;
  }

  /**
   * Extracts the traffic cameras values to be painted in the DOM
   * @param {Object} data response object
   * @this Window
   * @returns {void}
   */
  function renderTrafficCamera(data) {
    let camera = `<img class="cameraImg" alt="camaras de tráfico" src="${getRandomCamera(
      data
    )}"/>`;

    mainSection.insertAdjacentHTML('afterbegin', camera);
  }

  /**
   * Processes the results from the AJAX petition
   * @this Window
   * @returns {Object} data the response from the AJAX petition
   */
  getInitialData()
    .then(data => {
      renderPollutionData(data[0]);
      renderAcousticData(data[1].total);
      renderPollenData(data[2].mediciones);
      renderWeatherData(data[3].list);
      renderFluData(data[4]);
      renderTrafficCamera(data[5]);
      return data;
    })
    .catch(error => console.log(error));
  return madridData;
})();
