'use strict';

var fs = require('fs');
var path = require('path');
var express = require ('express');
var bodyParser = require ('body-parser');
var queryString = require ('querystring');
var request = require ('request');
var bioWatchManager = require ('./BioWatchManager');
var bioSignalDatabase = new (require ('./BioSignalDatabase')) ();

var app = express ();

var CRITERIA_SETTINGS_FILE_PATH = path.join (__dirname, 'criteria_settings.json');
var PATIENTS_STATUS_FILE_PATH = path.join (__dirname, 'patients_status.json');
var DATABASE_FILE_NAME = 'bioSignalDatabase.db';
var DATABASE_FILE_PATH = path.join (__dirname, DATABASE_FILE_NAME);

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

  var flowControl = new Promise (function (resolve, reject) {
    request (options, function (error, response, body) {
      if (error) {
        reject (error);
      }

      resolve ();
    }); 
  })
  .catch (function (error) {
    console.log ('Post data error: ' + error);
  }).then (function () {
    res.end ();
  });
});

app.post ('/api/patients_status', function (req, res) {
  bioWatchManager.addRawData (req.body);

  var flowControl = new Promise (function (resolve, reject) {
    fs.readFile (PATIENTS_STATUS_FILE_PATH, function (err, data) {
      if (err) {
        reject (err);
      }

      var patients_status = JSON.parse (data);  

      var inPlace = req.body.inPlace;
      var bioWatchId = req.body.bioWatchId;
      var pulse = req.body.pulse;
      var rssi = req.body.rssi;

      // find the place of this bio watch
      var lastPlace = -1;

      for (var i in patients_status) {
        var devices = patients_status[i].devices;
        for (var j in devices) { 
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
        reject ("This bio watch hasn't been registered: " + bioWatchId);
        // for (var i = 0; i < patients_status.length; i++) {
        //   if (patients_status[i].inPlace === inPlace) {
        //     patients_status[i].devices.push ({device_id: bioWatchId, rssi: rssi, pulse: pulse});          
        //     break;
        //   }
        // }
      }  
      
      resolve (patients_status);
      
    });
  }.bind (this)).then (function (patients_status) {
    return new Promise (function (resolve, reject) {
      fs.writeFile (PATIENTS_STATUS_FILE_PATH, JSON.stringify(patients_status), function(err) {
        if (err) {
          throw new Error (err);
        }
        resolve ();
      });
    });
  }).catch (function (err) {
    console.log ("Error: " + err);
  }).then (function () {
    res.end ();
  });
});

app.get ('/api/patients_status', function (req, res) {
  var flowControl = new Promise (function (resolve, reject) {
    fs.readFile (PATIENTS_STATUS_FILE_PATH, function (err, data) {
      if (err) {
        reject (err);
      }
      
      res.json (JSON.parse (data));
      resolve ();
    });
  }).catch (function (err) {
    console.log ('Error: ' + err);    
  }).then (function () {
    res.end ();
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

  var flowControl = new Promise (function (resolve, reject) {
    request (options, function (error, response, body) {
      if (error) {
        reject (error);
      }
      res.send (response.body.toString ());
      resolve ();
    });
  })
  .catch (function (error) {
    console.log ('Post data error: ' + error);
  }).then (function () {
    res.end ();
  });
  
});

app.post ('/api/scanedResult', function (req, res) {
  // I would check if the last rssi is smaller (the last is farther) then connect(send: 1) else nothing(send: 0)
  var toConnect = '-1';
  
  var flowControl = new Promise (function (resolve, reject) {
    fs.readFile (PATIENTS_STATUS_FILE_PATH, function (err, data) {
      if (err) {
        reject (err);
      }
      
      var patients_status = JSON.parse (data);
   
      var inPlace = req.body.inPlace;
      var bioWatchId = req.body.bioWatchId;
      var rssi = req.body.rssi;
      
      // find the place of this bio watch
      var foundPlace = -1;
      for (var i in patients_status) {
        var devices = patients_status[i].devices;
  
        for (var j in devices) {
          // find the bio watch whether exist
          if (devices[j].device_id === bioWatchId) {
            foundPlace = i;
  
            // if it doesn't connect yet
            if (patients_status[foundPlace].inPlace == 'None') {
              toConnect = '1';
              res.send (toConnect);
              break;
            } 
  
            if (patients_status[foundPlace].inPlace === inPlace) {
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
  
      resolve (patients_status);
    });
  }.bind (this)).then (function (patients_status) {
    return new Promise (function (resolve, reject) {
      fs.writeFile (PATIENTS_STATUS_FILE_PATH, JSON.stringify(patients_status), function(err) {
        if (err) {
          reject (err);
        }
        resolve ();
      });
    });
  }).catch (function (err) {
    console.log ('Error: ' + err);
  }).then (function () {
    res.end ();
  });
});

app.listen (app.get ('port'), function () {
  console.log ('Ready on port: ' + app.get ('port'));
  initialStatus ();
});

function initialStatus () {
  fs.readFile (CRITERIA_SETTINGS_FILE_PATH, function (err, data) {

    if (err) {
      console.log ("Error: " + err);
      return;
    }
  
    var criteria = JSON.parse (data);
    var rooms = criteria.rooms;
    var bioWatches = criteria.bioWatches;

    // if db file is not exist
    // input default data
    fs.access (DATABASE_FILE_PATH, fs.F_OK, function (err) {
      if (err == null) {
        bioSignalDatabase.init (DATABASE_FILE_NAME);
        return;
      } else {
        // not exist
        console.log (DATABASE_FILE_NAME + " doesn't exist");
        console.log ("input the data of criteria_settings into database");
        bioSignalDatabase.init (DATABASE_FILE_NAME).then (function () {
          rooms.forEach (function (room) {
            bioSignalDatabase.insertPlace (room);
          });

          bioWatches.forEach (function (bioWatch) {
            bioSignalDatabase.insertBioWatch (bioWatch);
          });
        });
      }       
    });

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
  
    fs.writeFile (PATIENTS_STATUS_FILE_PATH, JSON.stringify(initial_status), function(err) {
      if (err) {
        console.error ("Error: " + err);
        return;
      }
    });
  });

}
