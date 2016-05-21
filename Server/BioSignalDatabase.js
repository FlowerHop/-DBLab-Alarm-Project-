'use strict';
var fs = require ('fs');
var path = require ('path');
var CRITERIA_SETTINGS = path.join (__dirname, 'criteria_settings.json');

var BioSignalDatabase = function () {
  this.fileName = "";
};

BioSignalDatabase.prototype = {
  init: function (fileName) {
  	this.fileName = fileName;
    this.db = new (require ('sqlite3').verbose ()).Database (this.fileName);
    
    this.placeTable = "Place";
    this.bioWatchTable = "BioWatch";
    this.bioWatchInPlaceTable = "BioWatchInPlace";
    
    this.db.run ("CREATE TABLE IF NOT EXISTS " + this.placeTable + "(place_id TEXT PRIMARY KEY)");

    this.db.run ("CREATE TABLE IF NOT EXISTS " + this.bioWatchTable + "(device_id TEXT PRIMARY KEY)");

    this.db.run ("CREATE TABLE IF NOT EXISTS " + this.bioWatchInPlaceTable + "(in_id INTEGER PRIMARY KEY AUTOINCREMENT, device_id TEXT NOT NULL, place_id TEXT NOT NULL, pulse INTEGER NOT NULL, rssi INTEGER NOT NULL, dateAndTime TEXT NOT NULL)");
    
    // fs.readFile (CRITERIA_SETTINGS, function (err, data) {
    //   if (err) {
    //   	console.log (err);
    //   	return;
    //   }

    //   var criteria = JSON.parse (data);
    //   var rooms = criteria.rooms;
    //   var bioWatches = criteria.bioWatches;  

    //   for (var i = 0; i < rooms.length; i++) {
    //     addPlace (rooms[i]);
    //   }  

    //   for (var i = 0; i < bioWatches.length; i++) {
    //   	addBioSignal (bioWatches[i]);
    //   }

    // });
  }, 

  insertPlace: function (place_id) {
    return new Promise (function (resolve, reject) {
      this.db.run ("INSERT INTO " + this.placeTable + " (place_id) VALUES (?)", place_id, function (err){
        if (err) {
          console.log ("Error: " + err);
          reject (err);
        }
        resolve ();
      });
    }.bind (this));
  },

  insertBioWatch: function (device_id) {
    return new Promise (function (resolve, reject) {
      this.db.run ("INSERT INTO " + this.bioWatchTable + " (device_id) VALUES (?)", device_id, function (err){
        if (err) {
          console.log ("Error: " + err);
          reject (err);
        }
        resolve ();
      });
    }.bind (this));
  },

  insertBioSignal: function (device_id, inPlace, pulse, rssi, dateAndTime) {
    // check if the bio watch and place has been registered
    return this.getPlace (inPlace).then (function (data) {
      if (data == undefined) {
        throw new Error ('no this place');
      }
      
      return data;
    }).then (function (inPlace) {
      return this.getBioWatch (device_id).then (function (data) {
        if (data == undefined) {
          throw new Error ('no this bio watch');
        }

        return data;
      }).then (function (device_id) {
        this.db.run ("INSERT INTO " + this.bioWatchInPlaceTable + " (device_id, place_id, pulse, rssi, dateAndTime) VALUES (?, ?, ?, ?, ?)", [device_id, inPlace, pulse, rssi, dateAndTime], function (err) {
            if (err) {
              console.log (err);  
            }
          });

          return [inPlace, device_id];
      }.bind (this));
    }.bind (this));

  },

  getPlace: function (place_id) {
    return new Promise (function (resolve, reject) {
      var called = false;

      this.db.serialize (function () {
        this.db.each ("SELECT place_id FROM " + this.placeTable + " WHERE place_id = ?", [place_id], function (err, data) {
          if (err) {
            reject (err);
          }

          resolve (data.place_id);
          called = true;
        });

        this.db.run ("", function () {
          if (called == false) {
            reject ('no this place');
          }
        });
      }.bind (this));
      
    }.bind (this)).catch (function (err) {
      console.log ("getPlace Error: " + err);
    });
  }, 

  getBioWatch: function (device_id) {
    return new Promise (function (resolve, reject) {
      var called = false;

      this.db.serialize (function () {
        this.db.each ("SELECT device_id FROM " + this.bioWatchTable + " WHERE device_id = ?", [device_id], function (err, data) {
          if (err) {
            reject (err);
          }

          resolve (data.device_id);
        });

        this.db.run ("", function () {
          if (called == false) {
            reject ('no this bio watch');
          }
        });
      }.bind (this));
      
    }.bind (this)).catch (function (err) {
      console.log ("getBioWatch Error:" + err);
    });
  },
  
  getBioSignalAtTime: function (device_id, dateAndTime) {
    return new Promise (function (resolve, reject) {
      this.db.each ("SELECT place_id, pulse, rssi from " + this.bioWatchInPlaceTable + " WHERE device_id = ? AND dateAndTime = ?", [device_id, dateAndTime], function (err, row) {
          if (err) {
            reject (err);
          }
          
          resolve ({place_id: row.place_id, pulse: row.pulse, rssi: row.rssi});
      });
    }.bind (this)).catch (function (err) {
      console.log ("Err: " + err);
    }); 
  },
  

  close: function () {
  	this.db.close ();
  }, 

  destroy: function () {
  	// remove the db file
  	fs.unlink (this.fileName, function (err) {
      if (err) {
      	console.log ('Destroy error.');
      }
      console.log ('Destroy database successfully.');
  	});
  }
};

module.exports = BioSignalDatabase;

