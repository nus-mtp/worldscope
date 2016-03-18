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

var streamDetails = {
  title: 'I am going to dance',
  appInstance: 'appInstance',
  roomId: '123',
  totalViewers: 2
};

// a more recent stream
var streamDetails2 = {
  title: 'zzz hello, look at me! More recent!',
  appInstance: 'another appInstance',
  roomId: '546',
  totalViewers: 7,
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

// live and older stream
var streamDetails4 = {
  title: 'this is a very long stream',
  appInstance: 'another instance',
  roomId: '46',
  totalViewers: 9,
  createdAt: new Date('2016-01-01')
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

lab.experiment('Stream Model Tests', function() {

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
    Storage.createStream(TestUtils.invalidId, streamDetails)
      .catch(function(err) {
        expect(err.name).to.equal('TypeError');
        expect(err.message)
          .to.equal("Cannot read property 'addStream' of null");
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
      return Storage.getStreamById({streamId: TestUtils.invalidId});
    }).then(function(res) {
      expect(res).to.be.null();
      done();
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

    Promise.join(streamPromise, streamPromise2,
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

  lab.test('Get list of streams sorted by time desc', function(done) {
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

    Promise.join(streamPromise, streamPromise2,
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

    Promise.join(streamPromise, streamPromise2,
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

  lab.test('Get list of streams sorted by title desc', function(done) {
    var filters = {
      state: 'all',
      sort: 'title',
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

    Promise.join(streamPromise, streamPromise2,
      function() {
        Storage.getListOfStreams(filters).then(function(res) {
          expect(res[0].title).to.equal(streamDetails2.title);
          expect(res[0].streamer.username).to.equal(userDetails.username);
          expect(res[1].title).to.equal(streamDetails3.title);
          expect(res[1].streamer.username).to.equal(userDetails.username);
          expect(res[2].title).to.equal(streamDetails.title);
          expect(res[2].streamer.username).to.equal(userDetails2.username);
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

    Promise.join(streamPromise, streamPromise2,
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

  lab.test('Get list of live streams has subscribers', function(done) {
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

    Promise.join(streamPromise, streamPromise2,
      function(stream1, stream2) {
        // Betty subscribe to Alex
        return Storage.createSubscription(stream2.owner,
                                          stream1.owner)
        .then(function(res) {
          Storage.getListOfStreamsForUser(filters, stream2.owner)
          .then(function(res) {
            expect(res[0].streamer.Subscribers[0].userId)
              .to.equal(stream2.owner);
            done();
          });
        });
      });
  });

  lab.test('Get list of live streams sorted by viewers asc', function(done) {
    var filters = {
      state: 'live',
      sort: 'viewers',
      order: 'asc'
    };

    var userPromise = Storage.createUser(userDetails);
    var userPromise2 = Storage.createUser(userDetails2);

    var streamPromise = userPromise.then(function(user) {
      return Storage.createStream(user.userId, streamDetails4)
        .then(function(stream) {
          return Storage.createStream(user.userId, streamDetails2);
        });
    });

    var streamPromise2 = userPromise2.then(function(user2) {
      return Storage.createStream(user2.userId, streamDetails);
    });

    Promise.join(streamPromise, streamPromise2,
      function() {
        Storage.getListOfStreams(filters).then(function(res) {
          expect(res[0].title).to.equal(streamDetails.title);
          expect(res[0].streamer.username).to.equal(userDetails2.username);
          expect(res[1].title).to.equal(streamDetails2.title);
          expect(res[1].streamer.username).to.equal(userDetails.username);
          expect(res[2].title).to.equal(streamDetails4.title);
          expect(res[2].streamer.username).to.equal(userDetails.username);
          done();
        });
      });
  });

  lab.test('Get list of live streams sorted by viewers desc', function(done) {
    var filters = {
      state: 'live',
      sort: 'viewers',
      order: 'desc'
    };

    var userPromise = Storage.createUser(userDetails);
    var userPromise2 = Storage.createUser(userDetails2);

    var streamPromise = userPromise.then(function(user) {
      return Storage.createStream(user.userId, streamDetails4)
        .then(function(stream) {
          return Storage.createStream(user.userId, streamDetails2);
        });
    });

    var streamPromise2 = userPromise2.then(function(user2) {
      return Storage.createStream(user2.userId, streamDetails);
    });

    Promise.join(streamPromise, streamPromise2,
      function() {
        Storage.getListOfStreams(filters).then(function(res) {
          expect(res[0].title).to.equal(streamDetails4.title);
          expect(res[0].streamer.username).to.equal(userDetails.username);
          expect(res[1].title).to.equal(streamDetails2.title);
          expect(res[1].streamer.username).to.equal(userDetails.username);
          expect(res[2].title).to.equal(streamDetails.title);
          expect(res[2].streamer.username).to.equal(userDetails2.username);
          done();
        });
      });
  });

  lab.test('Get list of done streams', function(done) {
    var filters = {
      state: 'done',
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

    Promise.join(streamPromise, streamPromise2,
      function() {
        Storage.getListOfStreams(filters).then(function(res) {
          expect(res).to.have.length(1);
          expect(res[0].title).to.equal(streamDetails3.title);
          expect(res[0].streamer.username).to.equal(userDetails.username);
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

  lab.test('Update stream valid', function(done) {

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
      return Storage.updateStream(stream.streamId, newStreamAttributes);
    }).then(function(updatedStream) {
      expect(updatedStream.title).to.equal('a new title');
      expect(updatedStream.duration).to.equal('100000');
      expect(updatedStream.totalStickers).to.equal(203);
      expect(updatedStream.totalViewers).to.equal(23123);
      done();
    });
  });

  lab.test('Update stream invalid columns', function(done) {

    var newStreamAttributes = {
      randomCol: 'a new title',
      duration: '100000',
      totalViewers: 23123
    };

    Storage.createUser(userDetails).then(function(user) {
      return user.userId;
    }).then(function(userId) {
      return Storage.createStream(userId, streamDetails);
    }).then(function(stream) {
      return Storage.updateStream(stream.streamId, newStreamAttributes);
    }).catch(function(err) {
      expect(err).to.be.an.instanceof(Error);
      done();
    });
  });

  lab.test('Update stream invalid empty title', function(done) {

    var newStreamAttributes = {
      title: '',
      description: 'blah'
    };

    Storage.createUser(userDetails).then(function(user) {
      return user.userId;
    }).then(function(userId) {
      return Storage.createStream(userId, streamDetails);
    }).then(function(stream) {
      return Storage.updateStream(stream.streamId, newStreamAttributes);
    }).catch(function(err) {
      expect(err).to.be.an.instanceof(Error);
      done();
    });
  });

  lab.test('Update stream invalid streamId', function(done) {

    var newStreamAttributes = {
      title: 'a new title',
      duration: '100000',
      totalViewers: 23123
    };

    Storage.updateStream(TestUtils.invalidId, newStreamAttributes)
      .catch(function(err) {
        expect(err).to.be.an.instanceof(Error);
        done();
      });
  });

  lab.test('Delete stream valid', function(done) {

    Storage.createUser(userDetails).then(function(user) {
      return user.userId;
    }).then(function(userId) {
      return Storage.createStream(userId, streamDetails);
    }).then(function(stream) {
      return Storage.deleteStream(stream.streamId);
    }).then(function(res) {
      expect(res).to.be.true();
      done();
    });
  });

  lab.test('Delete stream invalid non-existing stream', function(done) {

    Storage.createUser(userDetails).then(function(user) {
      return user.userId;
    }).then(function(userId) {
      return Storage.createStream(userId, streamDetails);
    }).then(function(stream) {
      return Storage.deleteStream(TestUtils.invalidId);
    }).then(function(res) {
      expect(res).to.be.false();
      done();
    });
  });

});

lab.experiment('Stream Tests: streams from subscriptions', function() {

  lab.before({timeout: 10000}, function(done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('Get Streams from subscriptions valid', function(done) {
    // create users
    var userPromise = Storage.models.User.bulkCreate([
      userDetails, userDetails2,
      {username: 'Carlos popz', password: 'asdf', email: 'carlos@gmail.com'},
      {username: 'Delen popz', password: 'asdf', email: 'delen@gmail.com'}
    ]).then(() => Storage.getListOfUsers({order: 'asc'}));

    // set up subscriptions
    var subscriptionPromise = userPromise.then((users) => {
      return Storage.createSubscription(users[0].userId, users[1].userId)
      .then(() =>
        Storage.createSubscription(users[1].userId, users[2].userId))
      .then(() =>
        Storage.createSubscription(users[0].userId, users[2].userId))
      .then(() =>
        Storage.createSubscription(users[0].userId, users[3].userId));
    });

    // set up streams
    var streamPromise1 = userPromise.then((users) =>
      Storage.createStream(users[1].userId, streamDetails));

    var streamPromise2 = userPromise.then((users) =>
      Storage.createStream(users[1].userId, streamDetails3)); //ended

    var streamPromise3 = userPromise.then((users) =>
      Storage.createStream(users[2].userId, streamDetails4)); //oldest

    var streamPromise4 = userPromise.then((users) =>
      Storage.createStream(users[3].userId, streamDetails2)); //most recent

    Promise.join(subscriptionPromise, streamPromise1, streamPromise2,
                 streamPromise3, streamPromise4,
      function(subscription, stream1, stream2, stream3, stream4) {
        var userId = subscription.subscriber; // first user
        Storage.getStreamsFromSubscriptions(userId).then(function(res) {
          expect(res[0].title).to.be.equal(streamDetails2.title);
          expect(res[1].title).to.be.equal(streamDetails.title);
          expect(res[2].title).to.be.equal(streamDetails4.title);
          done();
        });
      });
  });

  lab.test('Get Streams from subscriptions valid', function(done) {
    Storage.getUserByUsername(userDetails2.username).then((user) => {
      return Storage.getStreamsFromSubscriptions(user.userId)
        .then(function(res) {
          expect(res).to.have.length(1);
          expect(res[0].title).to.be.equal(streamDetails4.title);
          done();
        });
    });
  });

});
