'use strict';
var BioInfo = function (p, dAndt) {
  this.pulse = p;
  this.dateAndTime = dAndt;	
};

var BioWatch = function (id) {
  this.device_id = id;
  this.bioInfo = [];
  this.inPlace = "";
};

BioWatch.prototype = {
  init: function () {
  	console.log ("init");
  },

  addBioData: function (rawData) {
    var pulse = rawData.pulse;
    var dateAndTime = rawData.dateAndTime;
    var inPlace = rawData.inPlace;
    var length = this.bioInfo.length;
    this.bioInfo[length] = new BioInfo (pulse, dateAndTime);
    this.updateLocation (inPlace);
  },

  removeBioData: function (dateAndTime) {
    for (var i = 0; i < this.bioInfo.length; i++) {
      if (dateAndTime == this.bioInfo[i].dateAndTime) {
       	this.bioInfo.splice (i, 1);
      }
    }
  }, 

  showRecords: function () {
    console.log ("The Bio Watch (" + this.device_id + ") is in place: " + this.inPlace);
  	for (var i = 0; i < this.bioInfo.length; i++) {
      console.log ("  " + this.device_id + ", " + this.bioInfo[i].pulse + ", " + this.bioInfo[i].dateAndTime);
  	}
  },

  updateLocation: function (place) {
    this.inPlace = place;
  }
};

var BioWatchManager = function () {
  this.bioWatchList = [];
}

BioWatchManager.prototype = {
  handleEvent: function (event) {
    switch (event.type) {
      case 'input-signal':
    	var data = event.detail;
    	this.addRawData (data);
        break;
      case 'new-biowatch':
    	var bioWatchId = event.detail;
    	this.addBioWatch(bioWatchId);
    	break;
    }
  },

  init: function () {
    // default bio watch list
    // In the future, it needs a manager to manage (CRUD) the bio watches.
    var fs = require ('fs');
    var path = require ('path');
    var bioWatchList = [];

    var tempThis = this;
    fs.readFile (path.join (__dirname, 'criteria_settings.json'), function (err, data) {
      if (err) {
        console.log ('Error: ' + err);
        return;
      }
  
      bioWatchList = JSON.parse(data).bioWatches;

      for (var i = 0; i < bioWatchList.length; i++) {
        tempThis.addBioWatch (bioWatchList[i]);
      }
    });

    // it needs some feature of checking connection
  },

  addRawData: function (rawData) {
    console.log (rawData);
    var bioWatchId = rawData.bioWatchId;
    
    if (bioWatchId == undefined) {
      return;
    }

    for (var i = 0; i < this.bioWatchList.length; i++) {
      if (this.bioWatchList[i].device_id === bioWatchId) {
        this.bioWatchList[i].addBioData (rawData);
        return;
      }
    }
    
    console.log ("This bio watch hasn't been registered: " + bioWatchId);
  },

  addBioWatch: function (bioWatchId) {
    this.bioWatchList.push (new BioWatch (bioWatchId));
    console.log ("New bio watch id: " + bioWatchId);
  },

  showAll: function () {
  	for (var bioWatch in this.bioWatchList) {
      this.bioWatchList[bioWatch].showRecords ();
  	}
  }
};	

module.exports = new BioWatchManager ();
  
