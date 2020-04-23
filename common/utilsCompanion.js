// Function used to upload the raw data into a webservice using 'fetch'
export function uploadDataToServer(theData) {

  fetch('service/tensorflow-sensor-aks/score', {
    method: 'POST',
    body: "{\"data\" : "+JSON.stringify(theData)+"}",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + ''
      },
  })
  .then(response => {
    response.text().then(textResponse => {
      let parsedJson = JSON.parse(textResponse);
      parsedJson = JSON.parse(parsedJson);
      console.log("Service Result: " + parsedJson.result);
      activityResponse[0] = parseInt(mode(parsedJson.result));
    })
  })
  .catch(error => console.log('Error:', error));

}




























// Convert a Uint16Array (bits) into float
export function uInt16ToFloat(h) {
  var s = (h & 0x8000) >> 15;
  var e = (h & 0x7C00) >> 10;
  var f = h & 0x03FF;
  if(e == 0) {
      return (s?-1:1) * Math.pow(2,-14) * (f/Math.pow(2, 10));
  } else if (e == 0x1F) {
      return f?NaN:((s?-1:1)*Infinity);
  }
  return (s?-1:1) * Math.pow(2, e-15) * (1+(f/Math.pow(2, 10)));
}