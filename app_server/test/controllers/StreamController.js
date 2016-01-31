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

var streamPayload = {
  title: 'this is the title',
  description: 'this is the description of the stream'
};

lab.experiment('StreamController Tests', function() {

  lab.beforeEach({timeout: 10000}, function(done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('Create stream valid', function(done) {
    Service.createNewUser(bob).then(function(user) {
      return user.userId;
    }).then(function(userId) {
      testAccount.userId = userId;
      Router.inject({method: 'POST', url: '/api/streams',
                     credentials: testAccount,
                     payload: streamPayload}, function(res) {

        Code.expect(res.result.streamLink).to.equal(
          util.format('%s/%s/%s', Utility.streamBaseUrl,
                                  res.result.appInstance,
                                  res.result.streamId));
        Code.expect(res.result.title).to.equal(streamPayload.title);
        Code.expect(res.result.streamer.username).to.equal(bob.username);
        done();
      });
    });
  });

  lab.test('Create 2 streams consecutively valid', function(done) {
    function injectionHandler1(res) {
      Code.expect(res.result.streamLink).to.equal(
        util.format('%s/%s/%s', Utility.streamBaseUrl,
                                res.result.appInstance,
                                res.result.streamId));
      Code.expect(res.result.title).to.equal(streamPayload.title);
      Code.expect(res.result.streamer.username).to.equal(bob.username);

      Router.inject({method: 'POST', url: '/api/streams',
                    credentials: testAccount,
                    payload: streamPayload},
                    injectionHandler2);
    }

    function injectionHandler2(res) {
      Code.expect(res.result.streamLink).to.equal(
        util.format('%s/%s/%s', Utility.streamBaseUrl,
                                res.result.appInstance,
                                res.result.streamId));
      Code.expect(res.result.title).to.equal(streamPayload.title);
      Code.expect(res.result.streamer.username).to.equal(bob.username);
      done();
    }

    Service.createNewUser(bob).then(function(user) {
      return user.userId;
    }).then(function(userId) {
      testAccount.userId = userId;
      return Router.inject({method: 'POST', url: '/api/streams',
                            credentials: testAccount,
                            payload: streamPayload},
                            injectionHandler1);
    });
  });

  lab.test('Create stream missing userId', function(done) {
    delete testAccount.userId;
    Router.inject({method: 'POST', url: '/api/streams',
                   credentials: testAccount,
                   payload: streamPayload}, function(res) {
      Code.expect(res.result.statusCode).to.equal(401);
      Code.expect(res.result.error).to.equal('Unauthorized');
      done();
    });
  });

  lab.test('Create stream invalid userId', function(done) {
    testAccount.userId = 'non-existing-user';
    Router.inject({method: 'POST', url: '/api/streams',
                   credentials: testAccount,
                   payload: streamPayload}, function(res) {
      Code.expect(res.result.statusCode).to.equal(401);
      Code.expect(res.result.error).to.equal('Unauthorized');
      Code.expect(res.result.message).to.equal('User not found');
      done();
    });
  });

  lab.test('Create stream empty title', function(done) {
    var streamPayload = {
      title: '',
      description: 'this is the description of the stream'
    };
    Service.createNewUser(bob).then(function(user) {
      return user.userId;
    }).then(function(userId) {
      testAccount.userId = userId;

      Router.inject({method: 'POST', url: '/api/streams',
                     credentials: testAccount,
                     payload: streamPayload}, function(res) {
        Code.expect(res.result.statusCode).to.equal(400);
        Code.expect(res.result.error).to.equal('Bad Request');
        done();
      });
    });
  });

  lab.test('Get stream by streamId valid', function(done) {
    var streamInfo = {
      title: 'this is the title',
      description: 'this is the description of the stream',
      appInstance: 'generated'
    };

    Service.createNewUser(bob).then(function(user) {
      return user.userId;
    }).then(function(userId) {
      return Service.createNewStream(userId, streamInfo);
    }).then(function(stream) {
      Router.inject({method: 'GET', url: '/api/streams/' + stream.streamId,
                     credentials: testAccount}, function(res) {

        Code.expect(res.result.viewLink).to.equal(
          util.format('%s/%s/%s/manifest.mpd', Utility.viewBaseUrl,
                                               streamInfo.appInstance,
                                               res.result.streamId));
        Code.expect(res.result.thumbnailLink).to.equal(
          util.format(Utility.thumbnailTemplateUrl,
                      res.result.appInstance,
                      res.result.streamId));
        Code.expect(res.result.title).to.equal(streamInfo.title);
        Code.expect(res.result.streamer.username).to.equal(bob.username);
        done();
      });
    });
  });

  lab.test('Get stream by streamId invalid non-existing stream',
    function(done) {
      Router.inject({method: 'GET', url: '/api/streams/3388ffff-aa00-1111-' +
                                         'a222-00000044888c',
                     credentials: testAccount}, function(res) {
        Code.expect(res.result.statusCode).to.equal(404);
        Code.expect(res.result.message).to.equal('Stream not found');
        done();
      });
    });

  lab.test('Get stream by streamId invalid guid', function(done) {
    Router.inject({method: 'GET', url: '/api/streams/213',
                   credentials: testAccount}, function(res) {
      Code.expect(res.result.statusCode).to.equal(400);
      Code.expect(res.result.error).to.equal('Bad Request');
      done();
    });
  });

  lab.test('Get list of streams valid default params empty', function(done) {
    Router.inject({method: 'GET', url: '/api/streams',
                   credentials: testAccount}, function(res) {
      Code.expect(res.result).to.have.length(0);
      done();
    });
  });

  lab.test('Get list of streams valid sort by title asc', function(done) {

    var streamInfo = {
      title: 'this is the title',
      description: 'this is the description of the stream',
      appInstance: 'generated'
    };

    var streamInfo2 = {
      title: 'abc def is the title',
      description: 'this is the description of the stream',
      appInstance: 'generated2'
    };

    Service.createNewUser(bob).then(function(user) {
      testAccount.userId = user.userId;
      return user.userId;
    }).then(function(userId) {
      return Service.createNewStream(userId, streamInfo);
    }).then(function(stream) {
      return Service.createNewStream(stream.owner, streamInfo2);
    }).then(function() {
      Router.inject({method: 'GET', url: '/api/streams?sort=title&order=desc',
                     credentials: testAccount}, function(res) {
        Code.expect(res.result).to.have.length(2);
        Code.expect(res.result[0].title).to.equal(streamInfo.title);
        Code.expect(res.result[0].streamer.username).to.equal(bob.username);
        Code.expect(res.result[1].title).to.equal(streamInfo2.title);
        Code.expect(res.result[1].streamer.username).to.equal(bob.username);
        done();
      });
    });
  });

  lab.test('Get list of streams invalid query params', function(done) {
    Router.inject({method: 'GET', url: '/api/streams?order=lol',
                   credentials: testAccount}, function(res) {
      Code.expect(res.result.statusCode).to.equal(400);
      Code.expect(res.result.error).to.equal('Bad Request');
      done();
    });
  });
});
