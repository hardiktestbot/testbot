'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const AIMLInterpreter = require('aimlinterpreter/AIMLInterpreter');

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

var reply="default";

var aimlInterpreter = new AIMLInterpreter({name:'WireInterpreter', age:'42'});
aimlInterpreter.loadAIMLFilesIntoArray(['AIML/turing.aiml.xml','AIML/test.aiml.xml']);

var callback = function(answer, wildCardArray, input){
    console.log(answer + ' | ' + wildCardArray + ' | ' + input);
    //sendTextMessage(sender,answer);
    reply = answer;
};

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id 
        if (event.message && event.message.text) {
            let text = event.message.text
            //sendTextMessage(sender, "thinking...");
            aimlInterpreter.findAnswerInLoadedAIMLFiles(text, callback);
            sendTextMessage(sender, reply);
        }
    }
    res.sendStatus(200)
})

const token = "EAAYzy1IZARX0BABG8IGD70JWHxre16xrz030lgZCHh4jWcSG7AWSuBxN0ZCr31ObwMwfZA33A3fboWRZC11tAQeruVGZBRjykpRW0mz91pFS2ZAFrQxOavrtySbVdeMNFtMeR0XbKrKIWwLNGZCGCvfm02kX5BQEZA8vDJzs1RZAhIXlk8OhaaRHsR"




function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})