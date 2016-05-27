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
      var place_id = "RoomA";

      Promise.resolve ()
      .then (function () {
        return bioSignalDatabase.insertPlace (place_id);
      })
      .then (function () {
        return bioSignalDatabase.getPlace ("RoomA");
      })
      .then (function (data) {
        data.should.equal ("RoomA");
      })
      .catch (function (err) {
        console.log ("Error: " + err);
        throw new Error (err);
      })
      .then (done, done);

  	});

    it ('insert bio watch', function (done) {
      var device_id = "01";

      Promise.resolve ()
      .then (function () {
        return bioSignalDatabase.insertBioWatch (device_id);
      })
      .then (function () {
        return bioSignalDatabase.getBioWatch ("01");
      })
      .then (function (data) { 
        data.should.equal ("01", data);
      })
      .catch (function (err) {
        console.log ("Error: " + err);
        throw new Error (err);
      })
      .then (done, done);
  	});

    it ('insert bio signal', function (done) {
      var place_id = "RoomA";
      var device_id = "01";
      var pulse = 100;
      var rssi = 100;
      var dateAndTime = 100;
      
      Promise.resolve ()
      .then (function () {
        return bioSignalDatabase.insertBioSignal (device_id, place_id, pulse, rssi, dateAndTime)
      })
      .then (function () {
        return bioSignalDatabase.getBioSignalAtTime (device_id, dateAndTime);
      })
      .then (function (data) {
        data.place_id.should.equal ("RoomA");
        data.pulse.should.equal (100);
        data.rssi.should.equal (100);
      })
      .catch (function (err) {
        console.log ("Error: " + err);
        throw new Error (err);
      })
      .then (done, done);

    });
  });

  describe ('query', function () {
    it ('query place', function (done) {
      var place_id = "RoomA";
      Promise.resolve ()
      .then (function () {
        return bioSignalDatabase.getPlace (place_id);
      })
      .then (function (data) {
        data.should.equal = "RoomA";
      })
      .catch (function (err) {
        console.log ("Error: " + err);
        throw new Error (err);
      })
      .then (done, done);
    });

    it ('query bio watch', function (done) {
      var device_id = "01";

      Promise.resolve ()
      .then (function () {
        return bioSignalDatabase.getBioWatch ("01");
      })
      .then (function (data) { 
        data.should.equal ("01", data);
      })
      .catch (function (err) {
        console.log ("Error: " + err);
        throw new Error (err);
      })
      .then (done, done);
    });

    it ('query bio signal at time', function (done) {
      var device_id = "01";
      var dateAndTime = 100;

      Promise.resolve ()
      .then (function () {
        return bioSignalDatabase.getBioSignalAtTime (device_id, dateAndTime);
      })
      .then (function (data) {
        data.place_id.should.equal ("RoomA");
        data.pulse.should.equal (100);
        data.rssi.should.equal (100);
      })
      .catch (function (err) {
        console.log ("Error: " + err);
        throw new Error (err);
      })
      .then (done, done);
    });

    it ('query place list', function (done) {
      var newPlaceList = ["RoomA", "RoomB", "RoomC"];
      Promise.resolve ()
      .then (function () {
        return bioSignalDatabase.insertPlace ("RoomB");
      })
      .then (function () {
        return bioSignalDatabase.insertPlace ("RoomC");
      })
      .then (function () {
        return bioSignalDatabase.getPlaceList ();
      })
      .then (function (data) {
        data.forEach (function (d, index) {
          d.should.equal (newPlaceList[index]);
        });
      })
      .catch (function (err) {
        console.log ("Error: " + err);
        throw new Error (err);
      })
      .then (done, done);
    });

    it ('query bio watch list', function (done) {
      var newBioWatchList = ["01", "02", "03"];
      Promise.resolve ()
      .then (function () {
        return bioSignalDatabase.insertBioWatch ("02");
      })
      .then (function () {
        return bioSignalDatabase.insertBioWatch ("03");
      })
      .then (function () {
        return bioSignalDatabase.getBioWatchList ();
      })
      .then (function (data) {
        console.log (data);
        data.forEach (function (d, index) {
          d.should.equal (newBioWatchList[index]);
        });
      })
      .catch (function (err) {
        console.log ("Error: " + err);
        throw new Error (err);
      })
      .then (done, done);
    });

    it ('query all the bio signals', function (done) {
      Promise.resolve ()
      .then (function () {
        return bioSignalDatabase.insertBioSignal ("02", "RoomB", 90, -1, 10);
      })
      .then (function () {
        return bioSignalDatabase.insertBioSignal ("03", "RoomC", 78, -15, 20);
      })
      .then (function () {
        return bioSignalDatabase.getBioSignals ();
      })
      .then (function (rows) {
        rows[0].device_id.should.equal ("01");
        rows[0].place_id.should.equal ("RoomA");
        rows[0].pulse.should.equal (100);
        rows[0].rssi.should.equal (100);
        rows[0].dateAndTime.should.equal (100);
        rows[1].device_id.should.equal ("03");
        rows[1].place_id.should.equal ("RoomC");
        rows[1].pulse.should.equal (78);
        rows[1].rssi.should.equal (-15);
        rows[1].dateAndTime.should.equal (20);
        rows[2].device_id.should.equal ("02");
        rows[2].place_id.should.equal ("RoomB");
        rows[2].pulse.should.equal (90);
        rows[2].rssi.should.equal (-1);
        rows[2].dateAndTime.should.equal (10);
      })
      .catch (function (err) {
        console.log ("Error: " + err);
        throw new Error (err);
      })
      .then (done, done);
    });

    it ('query bio signals from the bio watch', function (done) {
      Promise.resolve ()
      .then (function () {
        return bioSignalDatabase.insertBioSignal ("01", "RoomA", 120, -3, 22);
      })
      .then (function () {
        return bioSignalDatabase.getBioSignalsFromBioWatch ("01");
      })
      .then (function (bioSignals) {
        bioSignals[0].place_id.should.equal ("RoomA");
        bioSignals[0].pulse.should.equal (100);
        bioSignals[0].rssi.should.equal (100);
        bioSignals[0].dateAndTime.should.equal (100);
        bioSignals[1].place_id.should.equal ("RoomA");
        bioSignals[1].pulse.should.equal (120);
        bioSignals[1].rssi.should.equal (-3);
        bioSignals[1].dateAndTime.should.equal (22);
      })
      .catch (function (err) {
        console.log ("Error: " + err);
        throw new Error (err);
      })
      .then (done, done);
    });

    it ('query bio signals from the place', function (done) {
      Promise.resolve ()
      .then (function () {
        return bioSignalDatabase.insertBioSignal ("03", "RoomA", 119, 0, 31);
      })
      .then (function () {
        return bioSignalDatabase.getBioSignalsInPlace ("RoomA");
      })
      .then (function (bioSignals) {
        bioSignals[0].device_id.should.equal ("01");
        bioSignals[0].pulse.should.equal (100);
        bioSignals[0].rssi.should.equal (100);
        bioSignals[0].dateAndTime.should.equal (100);
        bioSignals[1].device_id.should.equal ("01");
        bioSignals[1].pulse.should.equal (120);
        bioSignals[1].rssi.should.equal (-3);
        bioSignals[1].dateAndTime.should.equal (22);
        bioSignals[2].device_id.should.equal ("03");
        bioSignals[2].pulse.should.equal (119);
        bioSignals[2].rssi.should.equal (0);
        bioSignals[2].dateAndTime.should.equal (31);
      })
      .catch (function (err) {
        console.log ("Error: " + err);
        throw new Error (err);
      })
      .then (done, done);
    });
  });
});