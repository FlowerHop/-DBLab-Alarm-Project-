'use strict';

var BioInfo = function (p, dAndt) {
  this.pulse = p;
  this.dateAndTime = dAndt;	
};

var BioWatch = function (id) {
  this.device_id = id;
  this.bioInfo = [];
};

BioWatch.prototype = {
  init: function () {
  	console.log ("init");
  },

  addBioData: function (rawData) {
    var pulse = rawData.pulse;
    var dateAndTime = rawData.dateAndTime;
    var length = this.bioInfo.length;
    this.bioInfo[length] = new BioInfo (pulse, dateAndTime);
  },

  removeBioData: function (dateAndTime) {
    for (var i = 0; i < this.bioInfo.length; i++) {
      if (dateAndTime == this.bioInfo[i].dateAndTime) {
       	this.bioInfo.splice (i, 1);
      }
    }
  }, 

  showRecords: function () {
  	for (var i = 0; i < this.bioInfo.length; i++) {
      console.log (this.device_id + ", " + this.bioInfo[i].pulse + ", " + this.bioInfo[i].dateAndTime);
  	}
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
    
    var watchList = ["01", "02", "03"];
    for (var i = 0; i < watchList.length; i++) {
      this.addBioWatch (watchList[i]);
    }
    // it needs some feature of checking connection
  },

  addRawData: function (rawData) {
    console.log (rawData);
    var bioWatchId = rawData.bioWatchId;
    if (bioWatchList[bioWatchId] != 'undefined') {
      this.bioWatchList[bioWatchId].addBioData (rawData);
    } else {
      console.log ("This bio watch hasn't been registered: " + rawData.bioWatchId);
    } 
  },

  addBioWatch: function (bioWatchId) {
    this.bioWatchList[bioWatchId] = new BioWatch (bioWatchId);
  },

  showAll: function () {
  	for (var bioWatch in this.bioWatchList) {
      this.bioWatchList[bioWatch].showRecords ();
  	}
  }
};	



module.exports = new BioWatchManager ();
  
