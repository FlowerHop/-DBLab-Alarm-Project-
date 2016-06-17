'use strict';

var fs = require('fs');
var path = require('path');

var BioSignalDatabase = function BioSignalDatabase(fileName) {
  this.fileName = fileName;
};

BioSignalDatabase.prototype = {
  init: function init(fileName) {
    return new Promise(function (resolve, reject) {
      if (fileName != undefined) {
        this.fileName = fileName;
      }

      this.db = new (require('sqlite3').verbose().Database)(this.fileName);

      this.placeTable = "Place";
      this.bioWatchTable = "BioWatch";
      this.bioWatchInPlaceTable = "BioWatchInPlace";

      this.db.serialize(function () {
        this.db.run("CREATE TABLE IF NOT EXISTS " + this.placeTable + "(place_id TEXT PRIMARY KEY)");

        this.db.run("CREATE TABLE IF NOT EXISTS " + this.bioWatchTable + "(device_id TEXT PRIMARY KEY)");

        this.db.run("CREATE TABLE IF NOT EXISTS " + this.bioWatchInPlaceTable + "(in_id INTEGER PRIMARY KEY AUTOINCREMENT, device_id TEXT NOT NULL, place_id TEXT NOT NULL, pulse INTEGER NOT NULL, rssi INTEGER NOT NULL, dateAndTime INTEGER NOT NULL)", function () {
          resolve();
        });
      }.bind(this));
    }.bind(this));
  },

  insertPlace: function insertPlace(place_id) {
    return new Promise(function (resolve, reject) {
      this.db.run("INSERT INTO " + this.placeTable + " (place_id) VALUES (?)", place_id, function (err) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    }.bind(this));
  },

  insertBioWatch: function insertBioWatch(device_id) {
    return new Promise(function (resolve, reject) {
      this.db.run("INSERT INTO " + this.bioWatchTable + " (device_id) VALUES (?)", device_id, function (err) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    }.bind(this));
  },

  insertBioSignal: function insertBioSignal(device_id, inPlace, pulse, rssi, dateAndTime) {
    // check if the bio watch and place has been registered
    return this.getPlace(inPlace).then(function (data) {
      if (data == undefined) {
        throw new Error('no this place');
      }

      return data;
    }).then(function (inPlace) {
      return this.getBioWatch(device_id).then(function (data) {
        if (data == undefined) {
          throw new Error('no this bio watch');
        }

        return data;
      }).then(function (device_id) {
        this.db.run("INSERT INTO " + this.bioWatchInPlaceTable + " (device_id, place_id, pulse, rssi, dateAndTime) VALUES (?, ?, ?, ?, ?)", [device_id, inPlace, pulse, rssi, dateAndTime], function (err) {
          if (err) {
            throw new Error(err);
          }
        });

        return [inPlace, device_id];
      }.bind(this));
    }.bind(this));
  },

  getPlace: function getPlace(place_id) {
    return new Promise(function (resolve, reject) {
      this.db.all("SELECT place_id FROM " + this.placeTable + " WHERE place_id = ?", [place_id], function (err, rows) {
        if (err) {
          reject(err);
        }

        resolve(rows[0].place_id);
      });
    }.bind(this));
  },

  getPlaceList: function getPlaceList() {
    return new Promise(function (resolve, reject) {
      var placeList = [];

      this.db.all("SELECT * FROM " + this.placeTable, function (err, rows) {
        if (err) {
          reject(err);
        }

        rows.forEach(function (row) {
          placeList.push(row.place_id);
        });

        resolve(placeList);
      });
    }.bind(this));
  },

  getBioWatch: function getBioWatch(device_id) {
    return new Promise(function (resolve, reject) {
      this.db.all("SELECT device_id FROM " + this.bioWatchTable + " WHERE device_id = ?", [device_id], function (err, rows) {
        if (err) {
          reject(err);
        }

        resolve(rows[0].device_id);
      });
    }.bind(this));
  },

  getBioWatchList: function getBioWatchList() {
    return new Promise(function (resolve, reject) {
      var bioWatchList = [];

      this.db.all("SELECT * FROM " + this.bioWatchTable, function (err, rows) {
        if (err) {
          reject(err);
        }

        rows.forEach(function (row) {
          bioWatchList.push(row.device_id);
        });

        resolve(bioWatchList);
      });
    }.bind(this));
  },

  getBioSignalAtTime: function getBioSignalAtTime(device_id, dateAndTime) {
    return new Promise(function (resolve, reject) {
      this.db.all("SELECT place_id, pulse, rssi FROM " + this.bioWatchInPlaceTable + " WHERE device_id = ? AND dateAndTime = ?", [device_id, dateAndTime], function (err, rows) {
        if (err) {
          reject(err);
        }

        resolve({ place_id: rows[0].place_id, pulse: rows[0].pulse, rssi: rows[0].rssi });
      });
    }.bind(this));
  },

  // return ordered list
  getBioSignalsFromBioWatch: function getBioSignalsFromBioWatch(device_id) {
    return new Promise(function (resolve, reject) {
      var bioSignals = [];

      this.db.all("SELECT device_id, place_id, pulse, rssi, dateAndTime FROM " + this.bioWatchInPlaceTable + " WHERE device_id = ? ORDER BY dateAndTime DESC", [device_id], function (err, rows) {
        if (err) {
          reject(err);
        }

        rows.forEach(function (row) {
          bioSignals.push(row);
        });

        resolve(bioSignals);
      });
    }.bind(this));
  },

  getBioSignalsInPlace: function getBioSignalsInPlace(inPlace) {
    return new Promise(function (resolve, reject) {
      var bioSignals = [];
      this.db.all("SELECT device_id, pulse, rssi, dateAndTime FROM " + this.bioWatchInPlaceTable + " WHERE place_id = ?", [inPlace], function (err, rows) {
        if (err) {
          reject(err);
        }

        rows.forEach(function (row) {
          bioSignals.push(row);
        });

        resolve(bioSignals);
      });
    }.bind(this));
  },

  // return order list by time
  getBioSignals: function getBioSignals() {
    return new Promise(function (resolve, reject) {
      this.db.all("SELECT * FROM " + this.bioWatchInPlaceTable + " ORDER BY dateAndTime DESC", function (err, rows) {
        if (err) {
          reject(err);
        }
        resolve(rows);
      });
    }.bind(this));
  },

  close: function close() {
    this.db.close();
  },

  destroy: function destroy() {
    // remove the db file
    return new Promise(function (resolve, reject) {
      fs.unlink(this.fileName, function (err) {
        if (err) {
          reject(err);
        }
        console.log('Destroy database successfully.');
        resolve();
      });
    }.bind(this));
  }
};

module.exports = BioSignalDatabase;