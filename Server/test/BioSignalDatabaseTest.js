var assert = require ('assert');
var should = require ('should');
var BioSignalDatabase = require ('./../BioSignalDatabase');
var bioSignalDatabase = new BioSignalDatabase ();

describe ('BioSignalDatabase Test', function () {
  before (function () {
  	bioSignalDatabase.init ("./test.db");
  });
  
  after (function () {
  	bioSignalDatabase.destroy ();
  });

  describe ('insert', function () {
  	it ('insert place', function (done) {
      // because Promise will handle the Assertion Error
      // I have to use this pattern
      var promise = Promise.resolve ();
      var place_id = "RoomA";

      promise.then (function () {
        return bioSignalDatabase.insertPlace (place_id).then (function () {
          return bioSignalDatabase.getPlace ("RoomA").then (function (data) { 
            data.should.equal ("RoomA");
          });
        });
      }).then (done, done);

  	});

    it ('insert bio watch', function (done) {
      var promise = Promise.resolve ();
      var device_id = "01";

      promise.then (function () {
        return bioSignalDatabase.insertBioWatch (device_id).then (function () {
          return bioSignalDatabase.getBioWatch ("01").then (function (data) { 
            data.should.equal ("01", data);
          });
        });
      }).then (done, done);

  	});

    it ('insert bio signal', function (done) {
      var promise = Promise.resolve ();
      var place_id = "RoomA";
      var device_id = "01";
      var pulse = 100;
      var rssi = 100;
      var dateAndTime = 100;
      
      promise.then (function () {
        return bioSignalDatabase.insertBioSignal (device_id, place_id, pulse, rssi, dateAndTime). then (function () {
          return bioSignalDatabase.getBioSignalAtTime (device_id, dateAndTime).then (function (data) {
            data.place_id.should.equal ("RoomA");
            data.pulse.should.equal (100);
            data.rssi.should.equal (100);
          });
        }.bind (this));
      }).then (done, done);

    });
  });
});