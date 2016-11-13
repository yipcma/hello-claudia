'use strict'

const botBuilder = require('claudia-bot-builder');
const rp = require('minimal-request-promise')

function callWit(message, witaiApiKey) {

    const headers = {
        'Authorization': 'Bearer ' + witaiApiKey
    };

    const options = {
        headers: headers
    };

    rp.get('https://api.wit.ai/message?v=20161113&q=' + message, options).then(function(response) {
        console.log('got response', response.body, response.headers);
        return JSON.stringify(response.body);
    }, function(response) {
        console.log('got error', response.body, response.headers, response.statusCode, response.statusMessage);
        return JSON.stringify(response.body);
    })
}

const app = botBuilder(function(request, originalApiRequest) {
    console.log(request);

    return rp.get(`https://graph.facebook.com/v2.6/${request.sender}?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=${originalApiRequest.env.facebookAccessToken}`).then(response => {
        const user = JSON.parse(response.body)
        return {
            first_name: user.first_name,
            responseBody: callWit(request.text, originalApiRequest.env.witaiApiKey)
        }
    }).then((response) => {
        return [`Hello ${response.first_name}.`, 'I understood the following:', response.responseBody]
    })
});

app.addPostDeployConfig('witaiApiKey', 'WIT.AI API Key:', 'configure-app');

module.exports = app;
