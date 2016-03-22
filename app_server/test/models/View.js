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

lab.experiment('View Model Tests', function() {

  var user1 = {
    username: 'Jane Tan',
    alias: 'Jane the kid',
    email: 'jane@gmail.com',
    password: 'secretpass',
    accessToken: 'atoken',
    platformType: 'facebook',
    platformId: 'asdfadf-asdfasdf-asdfasdfaf-dfddf',
    description: 'a long long long description about jane'
  };

  var user2 = {
    username: 'Alice',
    alias: 'Alice in the wonderland',
    email: 'alice@apple.com',
    password: 'generated',
    accessToken: 'anaccesstoken',
    platformType: 'facebook',
    platformId: '45454545454',
    description: 'nil'
  };

  var stream1 = {
    title: 'stream from view test',
    description: 'hello',
    appInstance: '123-123'
  };

  var stream2 = {
    title: 'second stream from view test',
    description: 'hello hello',
    appInstance: '34234-3434'
  };

  lab.beforeEach({timeout: 10000}, function(done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('Create View valid', function(done) {
    var userPromise = Storage.createUser(user1);
    var streamPromise = userPromise.then(user =>
      Storage.createStream(user.userId, stream1));

    Promise.join(userPromise, streamPromise,
      function(user, stream) {
        Storage.createView(user.userId, stream.streamId).then(function(res) {
          expect(res.userId).to.equal(user.userId);
          done();
        });
      });
  });

  lab.test('Create View invalid stream', function(done) {
    var userPromise = Storage.createUser(user1);

    userPromise.then(function(user) {
      Storage.createView(user.userId, TestUtils.invalidId)
        .then(function(res) {
          expect(res).to.be.an.instanceof(Error);
          done();
        });
    });
  });

  lab.test('Create View invalid user', function(done) {
    var userPromise = Storage.createUser(user1);
    var streamPromise = userPromise.then(user =>
      Storage.createStream(user.userId, stream1));

    Promise.join(userPromise, streamPromise,
      function(user, stream) {
        Storage.createView(TestUtils.invalidId, stream.streamId)
          .then(function(res) {
            expect(res).to.be.an.instanceof(Error);
            done();
          });
      });
  });

  lab.test('Create view invalid duplicate views', function(done) {
    var userPromise1 = Storage.createUser(user1);

    var streamPromise1 = userPromise1
      .then(user => Storage.createStream(user.userId, stream1));

    var viewPromise1 = streamPromise1.then(function(stream) {
      return Storage.createUser(user2)
        .then((user) => Storage.createView(user.userId, stream.streamId))
        .then((view) => Storage.createView(view.userId, stream.streamId));
    });

    viewPromise1.then((res) => {
      expect(res).to.be.an.instanceof(Error);
      done();
    });
  });

  lab.test('Get list of users watching a stream valid', function(done) {
    var userPromise1 = Storage.createUser(user1);

    var streamPromise1 = userPromise1
      .then(user => Storage.createStream(user.userId, stream1));

    var viewPromise1 = streamPromise1.then(function(stream) {
      return Storage.createUser(user2).then((user) =>
        Storage.createView(user.userId, stream.streamId));
    });

    var viewPromise2 = streamPromise1.then(function(stream) {
      return userPromise1.then((user) =>
        Storage.createView(user.userId, stream.streamId));
    });

    Promise.join(viewPromise1, viewPromise2,
      function(view1, view2) {
        Storage.getListOfUsersViewingStream(view1.streamId)
          .then(function(res) {
            expect(res).to.have.length(2);
            expect(res[0].username).to.equal(user2.username);
            expect(res[1].username).to.equal(user1.username);
            done();
          });
      });
  });

  lab.test('Get list of users watching a stream invalid', function(done) {
    Storage.getListOfUsersViewingStream(TestUtils.invalidId)
      .then(function(res) {
        expect(res).to.be.null();
        done();
      });
  });

  lab.test('Get number of users who viewed a stream valid', function(done) {
    var userPromise1 = Storage.createUser(user1);

    var streamPromise1 = userPromise1
      .then(user => Storage.createStream(user.userId, stream1));

    var viewPromise1 = streamPromise1.then(function(stream) {
      return Storage.createUser(user2).then((user) =>
        Storage.createView(user.userId, stream.streamId));
    });

    var viewPromise2 = streamPromise1.then(function(stream) {
      return userPromise1.then((user) =>
        Storage.createView(user.userId, stream.streamId));
    });

    Promise.join(viewPromise1, viewPromise2,
      function(view1, view2) {
        Storage.getTotalNumberOfUsersViewedStream(view1.streamId)
          .then(function(res) {
            expect(res).to.equal(2);
            done();
          });
      });
  });

  lab.test('Get number of users viewed a stream invalid', function(done) {
    Storage.getTotalNumberOfUsersViewedStream(TestUtils.invalidId)
      .then(function(res) {
        expect(res).to.equal(0);
        done();
      });
  });
});
