(function() {
  const madridData = {};
  const mainSection = document.getElementById('main-section');

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
        console.log(request.status, request.statusText);
        reject({
          status: request.status,
          statusText: request.statusText
        });
      };
      request.open('GET', url, true);
      request.send();
    });
  }

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

  function getRandomCamera(data) {
    const min = Math.ceil(0);
    const max = Math.floor(data.length);
    const cameraNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    return `http://informo.munimadrid.es/cameras/Camara${
      data[cameraNumber]
    }.jpg`;
  }

  function renderTrafficCamera(data) {
    let camera = `<img class="cameraImg" alt="camaras de tráfico" src="${getRandomCamera(
      data
    )}"/>`;

    mainSection.insertAdjacentHTML('afterbegin', camera);
  }

  getInitialData()
    .then(data => {
      renderPollutionData(data[0]);
      renderAcousticData(data[1].total);
      renderPollenData(data[2].mediciones);
      renderFluData(data[4]);
      renderTrafficCamera(data[5]);
      return data;
    })
    .catch(error => console.log(error));
  return madridData;
})();
