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
    time: 1457431895000,
    alias: 'bobby'
  }
};

var commentPayload2 = {
  streamId: '',
  comment: {
    message: 'this is a second random message',
    time: 1457431915000,
    alias: 'bobby'
  }
};

lab.experiment('CommentController Tests', function() {

  lab.beforeEach({timeout: 10000}, function(done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('Create comment valid', function(done) {
    Service.createNewUser(bob).then((user) => user.userId)
      .then(function(userId) {
        testAccount.userId = userId;
        Router.inject({method: 'POST', url: '/api/streams',
                       credentials: testAccount,
                       payload: streamPayload}, function(res) {
          injectNewComment(res.result.streamId);
        });
      });

    function injectNewComment(streamId) {
      commentPayload.streamId = streamId;
      Router.inject({method: 'POST',
                     url: '/api/comments',
                     credentials: testAccount,
                     allowInternals: true,
                     payload: commentPayload}, function(res) {

        Code.expect(res.result.status).to.be.equal('OK');
        done();
      });
    }
  });

  lab.test('Create comment invalid empty content', function(done) {
    Service.createNewUser(bob).then((user) => user.userId)
      .then(function(userId) {
        testAccount.userId = userId;
        Router.inject({method: 'POST', url: '/api/streams',
                       credentials: testAccount,
                       payload: streamPayload}, function(res) {
          injectNewComment(res.result.streamId);
        });
      });

    function injectNewComment(streamId) {
      var commentPayload = {
        streamId: '',
        comment: {
          message: '',
          time: 1457431895187,
          alias: 'bobby'
        }
      };

      commentPayload.streamId = streamId;

      Router.inject({method: 'POST',
                     url: '/api/comments',
                     credentials: testAccount,
                     allowInternals: true,
                     payload: commentPayload}, function(res) {

        Code.expect(res.result.statusCode).to.be.equal(400);
        done();
      });
    }
  });

  lab.test('Create comment invalid unauthorised', function(done) {
    Service.createNewUser(bob).then((user) => user.userId)
      .then(function(userId) {
        testAccount.userId = userId;
        Router.inject({method: 'POST', url: '/api/streams',
                       credentials: testAccount,
                       payload: streamPayload}, function(res) {
          injectNewComment(res.result.streamId);
        });
      });

    function injectNewComment(streamId) {
      commentPayload.streamId = streamId;

      Router.inject({method: 'POST',
                     url: '/api/comments',
                     allowInternals: true,
                     payload: commentPayload}, function(res) {

        Code.expect(res.result.statusCode).to.be.equal(401);
        done();
      });
    }
  });

  lab.test('Get list of comments', function(done) {
    Service.createNewUser(bob).then((user) => user.userId)
      .then(function(userId) {
        testAccount.userId = userId;
        Router.inject({method: 'POST', url: '/api/streams',
                       credentials: testAccount,
                       payload: streamPayload}, function(res) {
          injectNewComment(res.result.streamId);
        });
      });

    function injectNewComment(streamId) {
      commentPayload.streamId = streamId;

      Router.inject({method: 'POST',
                     url: '/api/comments',
                     credentials: testAccount,
                     allowInternals: true,
                     payload: commentPayload}, function(res) {
        injectSecondComment(streamId);

      });
    }

    function injectSecondComment(streamId) {
      commentPayload2.streamId = streamId;

      Router.inject({method: 'POST',
                     url: '/api/comments',
                     credentials: testAccount,
                     allowInternals: true,
                     payload: commentPayload2}, function(res) {
        retrieveComments(streamId);
      });
    }

    function retrieveComments(streamId) {

      Router.inject({method: 'GET',
                     url: '/api/comments/streams/' + streamId,
                     credentials: testAccount}, function(res) {
        Code.expect(res.result[0].content)
          .to.be.equal(commentPayload2.comment.message);
        Code.expect(res.result[0].alias)
          .to.be.equal(commentPayload2.comment.alias);
        Code.expect(res.result[1].content)
          .to.be.equal(commentPayload.comment.message);
        Code.expect(res.result[1].alias)
          .to.be.equal(commentPayload.comment.alias);
        done();
      });
    }
  });

  lab.test('Get list of comments invalid stream id', function(done) {

    Router.inject({method: 'GET',
                   url: '/api/comments/streams/' + TestUtils.invalidId,
                   credentials: testAccount}, function(res) {
      Code.expect(res.result.statusCode).to.equal(400);
      done();
    });

  });

});
