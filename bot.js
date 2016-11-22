'use strict'

const botBuilder = require('claudia-bot-builder');
const rp = require('minimal-request-promise');
const Sugar = require('sugar-date');

Sugar.extend();

// TODO: fix timezone
function getWitParse(apikey, message) {
  const headers = {
    'Authorization': 'Bearer ' + apikey
  };

  const options = {
    headers: headers
  };
  const url = `https://api.wit.ai/message?v=20161113&q=${message}`;
  return rp.get(url, options);
}

// TODO: fix result filtering
function getGeocode(apikey, loc) {
  const url = `http://locationiq.org/v1/search.php?key=${apikey}&format=json&q=${loc}&viewbox=38.99323,22.35786,39.17330,22.24668&bounded=1&limit=1`;
  // TODO: fix locationiq not called properly
  return rp.get(url);
}

function getRoute(ll, datetime) {
  // TODO: fix date parsing and timezone
  const dt = new Date.create(datetime);
  const time = dt.format('{HH}:{mm}');
  const date = dt.format('{MM}-{dd}-{yyyy}');
  const url = `http://kmon.ddns.net:8080/otp/routers/default/plan?fromPlace=${ll[0].lat},${ll[0].lon}&toPlace=${ll[1].lat},${ll[1].lon}&time=${time}&date=${date}&mode=TRANSIT,WALK&maxWalkDistance=500&arriveBy=false&wheelchair=false&locale=en`;
  console.log(dt, url);

  return rp.get(url);
}

// TODO: somehow the code doesn't like .done(); catch errors
const app = botBuilder(function(request, originalApiRequest) {
  const witaiApiKey = originalApiRequest.env.witaiApiKey;
  const locApiKey = originalApiRequest.env.locationiqApiKey;
  let datetime = '';
  if (request.text)
    return getWitParse(witaiApiKey, request.text).then((response) => {
      const res = JSON.parse(response.body).entities;
      console.log(res);

      const from = res.from[0].value;
      const to = res.to[0].value;
      datetime = res.datetime[0].value;
      return Promise.all([
        getGeocode(locApiKey, from),
        getGeocode(locApiKey, to)
      ]);
    }).then((response) => {
      const ll = response.map(function(response) {
        const res = JSON.parse(response.body)[0];
        const lat = res.lat;
        const lon = res.lon;
        return {lat: lat, lon: lon};
      });
      return getRoute(ll, datetime);
    }).then((response) => {
      const res = JSON.parse(response.body);
      console.log(res);

      const msg = res.plan.itineraries[0].duration + ' seconds';
      return msg;
    }).catch((e) => {
      return "[error] " + e;
    });
  }
);

app.addPostDeployConfig('witaiApiKey', 'WIT.AI API KEY:', 'configure-wit');

app.addPostDeployConfig('locationiqApiKey', 'LOCATIONIQ API KEY:', 'configure-loc');

module.exports = app;
