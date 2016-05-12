'use strict';

var fs = require('fs');
var path = require('path');
var express = require ('express');
var bodyParser = require ('body-parser');
var queryString = require ('querystring');
var request = require ('request');
var bioWatchManager = require ('./BioWatchManager');

var app = express ();

var CRITERIA_SETTINGS = path.join (__dirname, 'criteria_settings.json');
var PATIENTS_STATUS_FILE = path.join (__dirname, 'patients_status.json');

bioWatchManager.init ();

app.set ('port', (process.env.PORT || 1338));
app.use (bodyParser.json ());
app.use ('/', express.static ('public'));

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get ('/test/update_status/:inPlace/:bioWatchId/:pulse/:dateAndTime/:rssi', function (req, res) {
  var inPlace = req.params.inPlace;
  var bioWatchId = req.params.bioWatchId;
  var pulse = req.params.pulse;
  var dateAndTime = req.params.dateAndTime;
  var rssi = req.params.rssi;

  var bioWatchSignal = {
    inPlace: inPlace,
    bioWatchId: bioWatchId, 
    pulse: pulse,
    dateAndTime: dateAndTime,
    rssi: rssi
  };

  var options = {
    url: 'http://localhost:' + app.get ('port') + '/api/patients_status',
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

app.post ('/api/patients_status', function (req, res) {
  bioWatchManager.addRawData (req.body);
  fs.readFile (PATIENTS_STATUS_FILE, function (err, data) {
    if (err) {
      console.log ("Error: " + error);
      return;
    }
    var patients_status = JSON.parse (data);

    var inPlace = req.body.inPlace;
    var bioWatchId = req.body.bioWatchId;
    var pulse = req.body.pulse;
    var rssi = req.body.rssi;

    // find the place of this bio watch
    var lastPlace = -1;
    for (var i = 0; i < patients_status.length; i++) {
      var devices = patients_status[i].devices;
      
      for (var j = 0; j < devices.length; j++) { 
        // find the bio watch whether exist
        if (devices[j].device_id === bioWatchId) {
          lastPlace = i;
          
          // in the same place
          if (lastPlace === inPlace) {
            devices[j].pulse = pulse;
            devices[j].rssi = rssi;
          } else {
            // remove the last place of the bio watch
            devices.splice (j,1);
            
            // change place
            for (var k = 0; k < patients_status.length; k++) {
              if (patients_status[k].inPlace === inPlace) {
                patients_status[k].devices.push ({device_id: bioWatchId, rssi: rssi, pulse: pulse});
                break;
              }
            }
          }
          break;
        }
      }

      if (lastPlace != -1) {
        break;
      }
    }

    // if the bio watch doesn't exist
    if (lastPlace === -1) {
      for (var i = 0; i < patients_status.length; i++) {
        if (patients_status[i].inPlace === inPlace) {
          patients_status[i].devices.push ({device_id: bioWatchId, rssi: rssi, pulse: pulse});          
          break;
        }
      }
    }

    fs.writeFile (PATIENTS_STATUS_FILE, JSON.stringify(patients_status), function(err) {
      if (err) {
        console.error ("Error: " + err);
        return;
      }
    });
  });
  res.end ();
});

app.get ('/api/patients_status', function (req, res) {
  fs.readFile (PATIENTS_STATUS_FILE, function (err, data) {
    if (err) {
      console.log ("Error: " + err);
      return;
    }

    res.json (JSON.parse (data));
  });
});

app.post ('/test/addBioWatchSignal', function (req, res) {
  bioWatchManager.addRawData (req.body);
  res.end ();
});

app.get ('/test/showRecords', function (req, res) {
  bioWatchManager.showAll ();
  res.end ();
});

app.get ('/test/scanedResult/:inPlace/:bioWatchId/:rssi/', function (req, res) {
  var inPlace = req.params.inPlace;
  var bioWatchId = req.params.bioWatchId;
  var rssi = req.params.rssi;

  var bioWatchSignal = {
    inPlace: inPlace,
    bioWatchId: bioWatchId, 
    rssi: rssi
  };

  var options = {
    url: 'http://localhost:' + app.get ('port') + '/api/scanedResult',
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
    console.log (response.body);
  }); 

  res.end ();
});

app.post ('/api/scanedResult', function (req, res) {
  // I would check if the last rssi is smaller (the last is farther) then connect(send: 1) else nothing(send: 0)
  var toConnect = '-1';
  
  fs.readFile (PATIENTS_STATUS_FILE, function (err, data) {
    if (err) {
      console.log ("Error: " + error);
      return;
    }
    
    var patients_status = JSON.parse (data);
 
    var inPlace = req.body.inPlace;
    var bioWatchId = req.body.bioWatchId;
    var rssi = req.body.rssi;
    
    // find the place of this bio watch
    var foundPlace = -1;
    for (var i = 0; i < patients_status.length; i++) {
      var devices = patients_status[i].devices;

      for (var j = 0; j < devices.length; j++) {
        // find the bio watch whether exist
        if (devices[j].device_id === bioWatchId) {
          foundPlace = i;

          // if it doesn't connect yet
          if (patients_status[foundPlace].inPlace == 'None') {
            toConnect = '1';
            res.send (toConnect);
            break;
          } 

          if (foundPlace === inPlace) {
            devices[j].rssi = rssi;
            toConnect = '0';
          } else {
            // to check
            if (parseInt(devices[j].rssi) < parseInt(rssi)) {
              toConnect = '1';
            } else {
              toConnect = '0';
            }
          }
          res.send (toConnect);
          break;
        }
      }

      if (foundPlace != -1) {
        break;
      }
    }
   
    fs.writeFile (PATIENTS_STATUS_FILE, JSON.stringify(patients_status), function(err) {
      if (err) {
        console.error ("Error: " + err);
        return;
      }
    });

    res.end ();
  });
});

app.listen (app.get ('port'), function () {
  console.log ('Ready on port: ' + app.get ('port'));
  initialStatus ();
});

function initialStatus () {
  fs.readFile (CRITERIA_SETTINGS, function (err, data) {

    if (err) {
      console.log ("Error: " + err);
      return;
    }
  
    var criteria = JSON.parse (data);
    var rooms = criteria.rooms;
    var bioWatches = criteria.bioWatches;

    var initial_status = [];

    for (var i = 0; i < rooms.length; i++) {
      initial_status.push ({inPlace: rooms[i], devices: []});
    }

    var None = {inPlace: 'None', devices: []};
    for (var i = 0; i < bioWatches.length; i++) {
      var bioWatch = bioWatches[i];
      None.devices.push ({device_id: bioWatch, rssi: 0, pulse: 0});
    }

    initial_status.push (None);
  
    fs.writeFile (PATIENTS_STATUS_FILE, JSON.stringify(initial_status), function(err) {
      if (err) {
        console.error ("Error: " + err);
        return;
      }
    });
  });

}
