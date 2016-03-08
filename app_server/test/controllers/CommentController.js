'use strict';
var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var util = require('util');
var Hapi = require('hapi');

var Authenticator = rfr('app/policies/Authenticator');
var Utility = rfr('app/util/Utility');
var Service = rfr('app/services/Service');
var TestUtils = rfr('test/TestUtils');
var Router = rfr('app/Router');
var roomsManager = rfr('app/adapters/socket/SocketAdapter').roomsManager;

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

var streamPayload = {
  title: 'this is the title',
  description: 'this is the description of the stream'
};

var commentPayload = {
  streamId: '',
  comment: {
    message: 'this is a random message',
    time: 1457431895187
  }
};

lab.experiment('CommentController Tests', function() {

  lab.beforeEach({timeout: 10000}, function(done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('Create comment valid', function(done) {

    function injectNewComment(streamId) {
      commentPayload.streamId = streamId;
      Router.inject({method: 'POST',
                     url: '/api/comments',
                     credentials: testAccount,
                     payload: commentPayload}, function(res) {

        Code.expect(res.result.status).to.be.equal('OK');
        done();
      });
    }

    Service.createNewUser(bob).then((user) => user.userId)
    .then(function(userId) {
      testAccount.userId = userId;
      Router.inject({method: 'POST', url: '/api/streams',
                     credentials: testAccount,
                     payload: streamPayload}, function(res) {
        injectNewComment(res.result.streamId);
      });
    });

  });

  lab.test('Create comment invalid empty string', function(done) {

    function injectNewComment(streamId) {

      var commentPayload = {
        streamId: '',
        comment: {
          message: '',
          time: 1457431895187
        }
      };

      commentPayload.streamId = streamId;

      Router.inject({method: 'POST',
                     url: '/api/comments',
                     credentials: testAccount,
                     payload: commentPayload}, function(res) {

        Code.expect(res.result.statusCode).to.be.equal(400);
        done();
      });
    }

    Service.createNewUser(bob).then((user) => user.userId)
    .then(function(userId) {
      testAccount.userId = userId;
      Router.inject({method: 'POST', url: '/api/streams',
                     credentials: testAccount,
                     payload: streamPayload}, function(res) {
        injectNewComment(res.result.streamId);
      });
    });

  });

  lab.test('Create comment invalid unauthorised', function(done) {

    function injectNewComment(streamId) {

      commentPayload.streamId = streamId;

      Router.inject({method: 'POST',
                     url: '/api/comments',
                     payload: commentPayload}, function(res) {

        Code.expect(res.result.statusCode).to.be.equal(400);
        done();
      });
    }

    Service.createNewUser(bob).then((user) => user.userId)
    .then(function(userId) {
      testAccount.userId = userId;
      Router.inject({method: 'POST', url: '/api/streams',
                     credentials: testAccount,
                     payload: streamPayload}, function(res) {
        injectNewComment(res.result.streamId);
      });
    });

  });
});
