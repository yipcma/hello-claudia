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
    // TODO: fix locationiq not called properly
    return rp.get(url)
  }

const app = botBuilder(function(request, originalApiRequest) {
    const witaiApiKey = originalApiRequest.env.witaiApiKey;
    const locApiKey = originalApiRequest.env.locationiqApiKey;
    if (request.text)
    return getWitParse(witaiApiKey, request.text).then((response) => {
      const res = JSON.parse(response.body).entities;
      const from = res.from[0].value;
      const to = res.to[0].value;
      const datetime = res.datetime[0].value;
      return getGeocode(locApiKey, from).then(JSON.stringify);
    });
      // return getWitParse(witaiApiKey, request.text).then((response) => {
      //   const res = JSON.parse(response.body);
      //   const from = res.entities.from[0].value;
      //   return getGeocode(locApiKey, from);
      // }).then(console.log);
});

app.addPostDeployConfig('witaiApiKey', 'WIT.AI API KEY:', 'configure-wit');

app.addPostDeployConfig('locationiqApiKey', 'LOCATIONIQ API KEY:', 'configure-loc');

module.exports = app;
