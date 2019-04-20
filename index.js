(function() {
  const madridData = {};
  const todaySection = document.getElementById('today');
  const aside = document.createElement('aside');

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
    let template = '';

    for (const key in data) {
      if (typeof data[key] === 'object') {
        template = `
          <li><span class="name">${data[key].parameter} (${
          data[key].abrebiation
        })</span>: ${
          data[key].values[0].valor
        } &#181;g/m<sup>3</sup> medido por ${data[key].technique}</li>
        `;
      }
      aside.insertAdjacentHTML('afterbegin', template);
    }

    todaySection.append(aside);
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

    todaySection.insertAdjacentHTML('afterbegin', camera);
  }

  function renderPollenData(mediciones) {
    let template = '';
    for (const key in mediciones) {
      template = `
      <li>${key}: ${mediciones[key].valor}, ${mediciones[key].resumen}</li>
    `;
      aside.insertAdjacentHTML('beforeend', template);
    }
  }

  getInitialData()
    .then(data => {
      renderPollutionData(data[0]);
      renderPollenData(data[2].mediciones);
      renderTrafficCamera(data[5]);
      return data;
    })
    .catch(error => console.log(error));
  return madridData;
})();
