var debug           = require('debug')('ugh:general'),
    bodyParser      = require('body-parser'),
    twilio          = require('twilio'),
    express         = require('express'),
    app             = express(),
    Twitter         = require('twitter'),
    client          = new Twitter({
      consumer_key: process.env.consumer_key,
      consumer_secret: process.env.consumer_secret,
      access_token_key: process.env.access_token_key,
      access_token_secret: process.env.access_token_secret
    });

app
  .use(bodyParser.urlencoded({
    extended: true
  }))
  .post('/voice', function (req, res) {
    var twiml = new twilio.TwimlResponse();
    twiml
      .say(process.env.message, {
        voice: 'alice'
      })
      .record({
        method: 'GET',
        maxLength: 5,
        action: '/recording',
        transcribeCallback: '/transcribe'
      });
    return res
            .set('Content-Type', 'text/xml')
            .send(twiml.toString());
  })
  .post('/transcribe', function (req, res) {
    debug(req.body.TranscriptionText);
    client.post('statuses/update', {status: req.body.TranscriptionText},  function (error, tweet, response) {
      if (error) {
        debug(error);
        return;
      }
    });
  })
  .get('/recording', function (req, res) {
    var messageDetails  = {
          sid: req.query.CallSid,
          type: 'call',
          recordingUrl: req.query.RecordingUrl,
          recordingDuration: Number(req.query.RecordingDuration),
          fromCity: req.query.FromCity,
          fromState: req.query.FromState,
          fromCountry: req.query.FromCountry
        },
        twiml           = new twilio.TwimlResponse();
    debug(messageDetails);
    twiml
      .say('Thank You.', {
        voice: 'alice'
      })
      .hangup();
    return res
            .set('Content-Type', 'text/xml')
            .send(twiml.toString());
  })
  .listen(process.env.PORT);
