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

    return rp.get('https://api.wit.ai/message?v=20161113&q=' + request.text, options).then(function(response) {
        const reply = JSON.parse(response.body)
        console.log('got response', reply);
        return 'Your request was ' + reply._text;
    }, function(response) {
        console.log('got error', response.body);
        return 'error!';
    })

});

app.addPostDeployConfig('witaiApiKey', 'WIT.AI API Key:', 'configure-app');

module.exports = app;
