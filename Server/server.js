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

//var places = ["Room A", "Room B", "Room C", "Restroom A", "None"];

app.get ('/', function (req, res) {
  
});

app.get ('/api/postData/:inPlace/:bioWatchId/:pulse/:dateAndTime', function (req, res) {
  var inPlace = req.params.inPlace;
  var bioWatchId = req.params.bioWatchId;
  var pulse = req.params.pulse;
  var dateAndTime = req.params.dateAndTime;

  var bioWatchSignal = {
    inPlace: inPlace,
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
  	body: bioWatchSignal
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
  console.log (JSON.stringify(bioWatchManager));
  res.end ();
});

app.listen (port, function () {
  console.log ('Ready on port: ' + port);
});
