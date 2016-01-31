var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var expect = Code.expect;
var Promise = require('bluebird');

var Utility = rfr('app/util/Utility');
var logger = Utility.createLogger(__filename);

var Storage = rfr('app/models/Storage.js');
var TestUtils = rfr('test/TestUtils');

lab.experiment('Stream Model Tests', function() {

  var streamDetails = {
    title: 'I am going to dance',
    appInstance: 'appInstance',
    roomId: '123',
  };

  // a more recent stream
  var streamDetails2 = {
    title: 'zzz hello, look at me! More recent!',
    appInstance: 'another appInstance',
    roomId: '546',
    createdAt: new Date('2016-12-12')
  };

  // ended and oldest stream
  var streamDetails3 = {
    title: 'this is an ended stream',
    appInstance: 'third appInstance',
    roomId: '555',
    live: false,
    createdAt: new Date('2014-12-12'),
    endedAt: new Date('2014-12-25')
  };

  var userDetails = {
    username: 'Alex Chan',
    email: 'alex@gmail.com',
    password: 'secretpass',
  };

  var userDetails2 = {
    username: 'Betty Pro',
    email: 'betty@gmail.com',
    password: 'secretpass',
  };

  lab.beforeEach({timeout: 10000}, function(done) {
    // Delete database, run before every single test
    TestUtils.resetDatabase(done);
  });

  lab.test('Create Stream', function(done) {
    Storage.createUser(userDetails).then(function(user) {
      return user.userId;
    }).then(function(userId) {
      return Storage.createStream(userId, streamDetails);
    }).then(function(stream) {
      expect(stream.title).to.equal('I am going to dance');
      done();
    });
  });

  lab.test('Create Stream with invalid userId', function(done) {
    Storage.createStream('123-123-123', streamDetails).catch(function(err) {
      expect(err.name).to.equal('TypeError');
      expect(err.message).to.equal("Cannot read property 'addStream' of null");
      done();
    });
  });

  lab.test('Get Stream by Id', function(done) {
    Storage.createUser(userDetails).then(function(user) {
      return user.userId;
    }).then(function(userId) {
      return Storage.createStream(userId, streamDetails);
    }).then(function(stream) {
      return Storage.getStreamById(stream.streamId);
    }).then(function(res) {
      expect(res.title).to.equal('I am going to dance');
      expect(res.streamer.username).to.equal(userDetails.username);
      done();
    });
  });

  lab.test('Get Stream by invalid streamId', function(done) {
    Storage.createUser(userDetails).then(function(user) {
      return user.userId;
    }).then(function(userId) {
      return Storage.createStream(userId, streamDetails);
    }).then(function(stream) {
      return Storage.getStreamById({streamId: '123-123'});
    }).then(function(res) {
      expect(res).to.be.null();
      done();
    });
  });

  lab.test('Get list of streams sorted by time', function(done) {
    var filters = {
      state: 'all',
      sort: 'time',
      order: 'desc'
    };

    var userPromise = Storage.createUser(userDetails);
    var userPromise2 = Storage.createUser(userDetails2);

    var streamPromise = userPromise.then(function(user) {
      return Storage.createStream(user.userId, streamDetails3)
        .then(function(stream) {
          return Storage.createStream(user.userId, streamDetails2);
        });
    });

    var streamPromise2 = userPromise2.then(function(user2) {
      return Storage.createStream(user2.userId, streamDetails);
    });

    return Promise.join(streamPromise, streamPromise2,
      function() {
        Storage.getListOfStreams(filters).then(function(res) {
          expect(res[0].title).to.equal(streamDetails2.title);
          expect(res[0].streamer.username).to.equal(userDetails.username);
          expect(res[1].title).to.equal(streamDetails.title);
          expect(res[1].streamer.username).to.equal(userDetails2.username);
          expect(res[2].title).to.equal(streamDetails3.title);
          expect(res[2].streamer.username).to.equal(userDetails.username);
          done();
        });
      });
  });

  lab.test('Get list of streams sorted by time asc', function(done) {
    var filters = {
      state: 'all',
      sort: 'time',
      order: 'asc'
    };

    var userPromise = Storage.createUser(userDetails);
    var userPromise2 = Storage.createUser(userDetails2);

    var streamPromise = userPromise.then(function(user) {
      return Storage.createStream(user.userId, streamDetails3)
        .then(function(stream) {
          return Storage.createStream(user.userId, streamDetails2);
        });
    });

    var streamPromise2 = userPromise2.then(function(user2) {
      return Storage.createStream(user2.userId, streamDetails);
    });

    return Promise.join(streamPromise, streamPromise2,
      function() {
        Storage.getListOfStreams(filters).then(function(res) {
          expect(res[0].title).to.equal(streamDetails3.title);
          expect(res[0].streamer.username).to.equal(userDetails.username);
          expect(res[1].title).to.equal(streamDetails.title);
          expect(res[1].streamer.username).to.equal(userDetails2.username);
          expect(res[2].title).to.equal(streamDetails2.title);
          expect(res[2].streamer.username).to.equal(userDetails.username);

          done();
        });
      });
  });

  lab.test('Get list of streams sorted by title asc', function(done) {
    var filters = {
      state: 'all',
      sort: 'title',
      order: 'asc'
    };

    var userPromise = Storage.createUser(userDetails);
    var userPromise2 = Storage.createUser(userDetails2);

    var streamPromise = userPromise.then(function(user) {
      return Storage.createStream(user.userId, streamDetails3)
        .then(function(stream) {
          return Storage.createStream(user.userId, streamDetails2);
        });
    });

    var streamPromise2 = userPromise2.then(function(user2) {
      return Storage.createStream(user2.userId, streamDetails);
    });

    return Promise.join(streamPromise, streamPromise2,
      function() {
        Storage.getListOfStreams(filters).then(function(res) {
          expect(res[0].title).to.equal(streamDetails.title);
          expect(res[0].streamer.username).to.equal(userDetails2.username);
          expect(res[1].title).to.equal(streamDetails3.title);
          expect(res[1].streamer.username).to.equal(userDetails.username);
          expect(res[2].title).to.equal(streamDetails2.title);
          expect(res[2].streamer.username).to.equal(userDetails.username);
          done();
        });
      });
  });

  lab.test('Get list of live streams', function(done) {
    var filters = {
      state: 'live',
      sort: 'time',
      order: 'desc'
    };

    var userPromise = Storage.createUser(userDetails);
    var userPromise2 = Storage.createUser(userDetails2);

    var streamPromise = userPromise.then(function(user) {
      return Storage.createStream(user.userId, streamDetails3)
        .then(function(stream) {
          return Storage.createStream(user.userId, streamDetails2);
        });
    });

    var streamPromise2 = userPromise2.then(function(user2) {
      return Storage.createStream(user2.userId, streamDetails);
    });

    return Promise.join(streamPromise, streamPromise2,
      function() {
        Storage.getListOfStreams(filters).then(function(res) {
          expect(res).to.have.length(2);
          expect(res[0].title).to.equal(streamDetails2.title);
          expect(res[0].streamer.username).to.equal(userDetails.username);
          expect(res[1].title).to.equal(streamDetails.title);
          expect(res[1].streamer.username).to.equal(userDetails2.username);
          done();
        });
      });
  });

  lab.test('Get list of streams invalid filters', function(done) {
    var filters = {
      state: 'live',
      sort: 'abc',
      order: 'desc'
    };

    var userPromise = Storage.createUser(userDetails);
    var userPromise2 = Storage.createUser(userDetails2);

    var streamPromise = userPromise.then(function(user) {
      return Storage.createStream(user.userId, streamDetails3)
        .then(function(stream) {
          return Storage.createStream(user.userId, streamDetails2);
        });
    });

    var streamPromise2 = userPromise2.then(function(user2) {
      return Storage.createStream(user2.userId, streamDetails);
    });

    return Promise.join(streamPromise, streamPromise2,
      function() {
        Storage.getListOfStreams(filters).catch(function(err) {
          expect(err).to.be.an.instanceof(Error);
          expect(err.message).to.
            equal("Cannot read property 'model' of undefined");
          done();
        });
      });
  });

  lab.test('Update stream details', function(done) {

    var newStreamAttributes = {
      title: 'a new title',
      duration: '100000',
      totalStickers: 203,
      totalViewers: 23123
    };

    Storage.createUser(userDetails).then(function(user) {
      return user.userId;
    }).then(function(userId) {
      return Storage.createStream(userId, streamDetails);
    }).then(function(stream) {
      return Storage.updateStreamAttributes(stream.streamId,
          newStreamAttributes);
    }).then(function(updatedStream) {
      expect(updatedStream.title).to.equal('a new title');
      expect(updatedStream.duration).to.equal('100000');
      expect(updatedStream.totalStickers).to.equal(203);
      expect(updatedStream.totalViewers).to.equal(23123);
      done();
    });
  });

});
