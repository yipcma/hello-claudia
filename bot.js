'use strict'

const botBuilder = require('claudia-bot-builder');
const rp = require('minimal-request-promise');

// TODO: fix timezone
function getWitParse(apikey, message) {
    const headers = {
        'Authorization': 'Bearer ' + apikey
    };

    const options = {
        headers: headers
    };
    const url = `https://api.wit.ai/message?v=20161113&q=${message}`
    return rp.get(url, options)
}

// TODO: fix result filtering
function getGeocode(apikey, loc) {
    const url = `http://locationiq.org/v1/search.php?key=${apikey}&format=json&q=${loc}&viewbox=38.99323,22.35786,39.17330,22.24668&bounded=1&limit=1`
    console.log(url);
    // TODO: fix locationiq not called properly
    return rp.get(url).then(response => {
      console.log(response);
      JSON.parse(response.body);
    })
  }

const app = botBuilder(function(request, originalApiRequest) {
    console.log(request);
    const witaiApiKey = originalApiRequest.env.witaiApiKey;
    const locationiqApiKey = originalApiRequest.env.locationiqApiKey;
    if (request.text)
        return getWitParse(witaiApiKey, request.text).then(response => {
          console.log(response);
          const res = JSON.parse(response.body);
          const from = res.entities.from[0].value;
          const to = res.entities.to[0].value;
          const datetime = res.entities.datetime[0].value;
          Promise.all(getGeocode(locationiqApiKey, from), getGeocode(locationiqApiKey, to))
        }).then(function(data){
          console.log(data);
          const fromData = data[0][0];
          const toData = data[1][0];
          return fromData.display_name + ' ' + toData.display_name;
        })
});

app.addPostDeployConfig('witaiApiKey', 'WIT.AI API KEY:', 'configure-wit');

app.addPostDeployConfig('locationiqApiKey', 'LOCATIONIQ API KEY:', 'configure-loc');

module.exports = app;
