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
    // Delete database, run before every single test
    TestUtils.resetDatabase(done);
  });

  lab.test('Create View valid', function(done) {
    var userPromise = Storage.createUser(user1);
    var streamPromise = userPromise.then(user =>
      Storage.createStream(user.userId, stream1));

    Promise.join(userPromise, streamPromise,
      function(user, stream) {
        Storage.createView(user.userId, stream.streamId).then(function(res) {
          expect(res[0][0].userId).to.equal(user.userId);
          done();
        });
      });
  });

  lab.test('Create View invalid stream', function(done) {
    var userPromise = Storage.createUser(user1);

    userPromise.then(function(user) {
      Storage.createView(user.userId, '3388ffff-aa00-1111a222-00000044888c')
        .then(function(res) {
          expect(res).to.be.undefined();
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
        Storage.createView('3388ffff-aa00-1111a222-00000044888c',
            stream.streamId).catch(function(res) {
              expect(res).to.be.an.instanceof(Error);
              done();
        });
      });
  });

  // repeated views
  lab.test('Create View invalid repeated user/stream', function(done) {
    var userPromise = Storage.createUser(user1);
    var streamPromise = userPromise.then(user =>
      Storage.createStream(user.userId, stream1));

    Promise.join(userPromise, streamPromise,
      function(user, stream) {
        Storage.createView(user.userId, stream.streamId)
          .then(() => Storage.createView(user.userId, stream.streamId))
          .then(function(res) {
            expect(res).to.deep.equal([]);
            done();
          });
      });
  });

});
