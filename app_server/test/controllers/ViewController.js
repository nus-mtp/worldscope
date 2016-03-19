var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var util = require('util');
var Promise = require('bluebird');

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

var alice = {
  username: 'Alice',
  alias: 'Alice in the wonderland',
  email: 'alice@apple.com',
  password: 'generated',
  accessToken: 'anaccesstoken',
  platformType: 'facebook',
  platformId: '45454545454',
  description: 'nil'
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
      Router.inject({method: 'POST', url: '/api/views/' + TestUtils.invalidId,
                     credentials: testAccount}, function(res) {

        Code.expect(res.result.statusCode).to.equal(400);
        Code.expect(res.result.message).to.equal('Stream not found');
        done();
      });
    });
  });

  lab.test('Create view invalid userId', function(done) {
    testAccount.userId = TestUtils.invalidId;

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

  lab.test('Get list of users viewing a stream valid', function(done) {
    var userPromise = Service.createNewUser(bob);
    var streamPromise = userPromise.then((user) =>
      Service.createNewStream(user.userId, stream));

    var viewPromise1 = streamPromise.then((stream) =>
      Service.createView(stream.owner, stream.streamId));

    var viewPromise2 = streamPromise.then(function(stream) {
      return Service.createNewUser(alice).then(function(user) {
        return Service.createView(user.userId, stream.streamId);
      });
    });

    Promise.join(viewPromise1, viewPromise2,
      function(view1, view2) {
        Router.inject({method: 'GET', url: '/api/views/' + view1.streamId,
                       credentials: testAccount}, function(res) {
          Code.expect(res.result).to.have.length(2);
          Code.expect(res.result[0].username).to.equal(alice.username);
          Code.expect(res.result[1].username).to.equal(bob.username);
          done();
        });
      });
  });

  lab.test('Get list of users viewing a stream valid empty', function(done) {
    var userPromise = Service.createNewUser(bob);
    var streamPromise = userPromise.then((user) =>
      Service.createNewStream(user.userId, stream));

    streamPromise.then(function(stream) {
      Router.inject({method: 'GET', url: '/api/views/' + stream.streamId,
                     credentials: testAccount}, function(res) {
        Code.expect(res.result).to.deep.equals([]);
        done();
      });
    });
  });

  lab.test('Get list of users viewing a stream invalid', function(done) {
    Router.inject({method: 'GET', url: '/api/views/' + TestUtils.invalidId,
                   credentials: testAccount}, function(res) {
      Code.expect(res.result.statusCode).to.equal(400);
      Code.expect(res.result.message).to.equal('Stream not found');
      done();
    });
  });

  lab.test('Get number of users who viewed a stream valid', function(done) {
    var userPromise = Service.createNewUser(bob);
    var streamPromise = userPromise.then((user) =>
      Service.createNewStream(user.userId, stream));

    var viewPromise1 = streamPromise.then((stream) =>
      Service.createView(stream.owner, stream.streamId));

    var viewPromise2 = streamPromise.then(function(stream) {
      return Service.createNewUser(alice).then(function(user) {
        return Service.createView(user.userId, stream.streamId);
      });
    });

    Promise.join(viewPromise1, viewPromise2,
      function(view1, view2) {
        var url = '/api/views/' + view1.streamId + '/statistics';
        console.log(url);
        Router.inject({method: 'GET', url: url,
                       credentials: testAccount}, function(res) {
          Code.expect(res.result).to.equal(2);
          done();
        });
      });
  });
});
