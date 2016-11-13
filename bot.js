'use strict'

const botBuilder = require('claudia-bot-builder');
const rp = require('minimal-request-promise')

const app = botBuilder(function(request, originalApiRequest) {
    console.log(request);

    const headers = {
        'Authorization': 'Bearer ' + originalApiRequest.env.witaiApiKey
    };

    const options = {
        headers: headers
    };

    if (request.sender !== '1386501818046647')
        return rp.get('https://api.wit.ai/message?v=20161113&q=' + request.text, options).then(function(response) {
            console.log('got response', response.body);
            const reply = JSON.parse(response.body);
            return reply.entities.from[0].value + ' => ' + reply.entities.to[0].value + ' @' + reply.entities.datetime[0].values[0].value + ', right?';
        }, function(response) {
            console.log('got error', response.body);
            return 'Sorry, I did\'t get that, again?';
        })

});

app.addPostDeployConfig('witaiApiKey', 'WIT.AI API Key:', 'configure-app');

module.exports = app;
