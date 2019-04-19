const fs = require('fs');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function extractCammeraNumbers(fileContents) {
  const regex = new RegExp('<Value>[0-9]{5}</Value>', 'g');
  const match = fileContents.match(regex);
  return match.map(camNum => {
    return camNum.replace('<Value>', '').replace('</Value>', '');
  });
}

function writeFileContents(cammeraNumbers) {
  fs.writeFileSync(
    './cammeraNumbers.json',
    JSON.stringify(cammeraNumbers),
    'utf8'
  );
}
const fileContents = readFile('./CCTV.kml');
const allCammeraNumbers = extractCammeraNumbers(fileContents);
writeFileContents(allCammeraNumbers);
