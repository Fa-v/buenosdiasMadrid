(function() {
  const madridData = {};
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
      'cammeraNumbers.json'
    ];

    return Promise.all(endPoints.map(ajaxRequest));
  }

  getInitialData()
    .then(data => {
      console.log('data geInitalData', data);
      return data;
    })
    .catch(error => console.log(data));
  return madridData;
})();
