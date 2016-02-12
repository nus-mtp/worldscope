var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var util = require('util');

var Authenticator = rfr('app/policies/Authenticator');
var Utility = rfr('app/util/Utility');
var Service = rfr('app/services/Service');
var TestUtils = rfr('test/TestUtils');
var Router = rfr('app/Router.js');

var testAccount = {userId: 1, username: 'bob', password: 'abc',
                   scope: Authenticator.SCOPE.USER};

var bob = {
  username: 'Bob',
  alias: 'Bob the Builder',
  email: 'bob@bubblegum.com',
  password: 'generated',
  accessToken: 'xyzabc',
  platformType: 'facebook',
  platformId: '1238943948',
  description: 'bam bam bam'
};

var stream = {
  title: 'this is the title',
  description: 'this is the description of the stream',
  appInstance: '123-123'
};

lab.experiment('ViewController Tests', function() {
  lab.beforeEach({timeout: 10000}, function(done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('Create view valid', function(done) {
    var userPromise = Service.createNewUser(bob).then((user) => user.userId);
    var streamPromise = userPromise.then((userId) =>
      Service.createNewStream(userId, stream));

    streamPromise.then(function(stream) {
      testAccount.userId = stream.owner;
      Router.inject({method: 'POST', url: '/api/views/' + stream.streamId,
                     credentials: testAccount}, function(res) {
        Code.expect(res.result.userId).to.equal(testAccount.userId);
        done();
      });
    });
  });

  lab.test('Create view invalid streamId', function(done) {
    var userPromise = Service.createNewUser(bob);

    userPromise.then(function(user) {
      testAccount.userId = user.userId;
      Router.inject({method: 'POST', url: '/api/views/' +
                     '3388ffff-aa00-1111a222-00000044888c',
                     credentials: testAccount}, function(res) {

        Code.expect(res.result.statusCode).to.equal(400);
        Code.expect(res.result.message).to.equal('Stream not found');
        done();
      });
    });
  });

  lab.test('Create view invalid userId', function(done) {
    var userPromise = Service.createNewUser(bob).then((user) => user.userId);
    var streamPromise = userPromise.then((userId) =>
      Service.createNewStream(userId, stream));

    streamPromise.then(function(stream) {
      Router.inject({method: 'POST', url: '/api/views/' + stream.streamId,
                     credentials: testAccount}, function(res) {

        Code.expect(res.result.statusCode).to.equal(400);
        Code.expect(res.result.message).to.equal('User not found');
        done();
      });
    });
  });
});
