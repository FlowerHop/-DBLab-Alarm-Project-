'use strict';

var express = require ('express');
var bodyParser = require ('body-parser');
var queryString = require ('querystring');
var request = require ('request');
var bioWatchManager = require ('./BioWatchManager');

var app = express ();

bioWatchManager.init ();
app.use (bodyParser.json ());
app.use (express.static ('public'));

var port = 1338;

app.get ('/', function (req, res) {
  
});

app.get ('/api/postData/:bioWatchId/:pulse/:dateAndTime', function (req, res) {
  
  var bioWatchId = req.params.bioWatchId;
  var pulse = req.params.pulse;
  var dateAndTime = req.params.dateAndTime;

  var bioWatchSignal = {
    bioWatchId: bioWatchId, 
    pulse: pulse,
    dateAndTime: dateAndTime
  };

  var options = {
  	url: 'http://localhost:' + port + '/addBioWatchSignal',
  	method: 'POST',
  	json: true,
  	headers: {
  	  "Content-Type": "application/json"
  	},
  	body: JSON.parse (JSON.stringify ({
  		bioWatchId: bioWatchId,
  	    pulse: pulse,
  	    dateAndTime: dateAndTime
  	}))
  };

  request (options, function (error, response, body) {
  	if (error) {
  	  console.log ('Post data error: ' + error);
    }
  }); 

  res.end ();
});

app.post ('/addBioWatchSignal', function (req, res) {
  bioWatchManager.addRawData (req.body);
  res.end ();
});

app.get ('/showRecords', function (req, res) {
  bioWatchManager.showAll ();
  res.end ();
});

app.listen (port, function () {
  console.log ('Ready on port: ' + port);
});
