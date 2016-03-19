'use strict';
var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var Promise = require('bluebird');
var util = require('util');
var Hapi = require('hapi');

var Authenticator = rfr('app/policies/Authenticator');
var Utility = rfr('app/util/Utility');
var Service = rfr('app/services/Service');
var TestUtils = rfr('test/TestUtils');
var Router = rfr('app/Router.js');
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

var rootAdminPermissions = [
  Authenticator.SCOPE.ADMIN.METRICS,
  Authenticator.SCOPE.ADMIN.STREAMS,
  Authenticator.SCOPE.ADMIN.USERS,
  Authenticator.SCOPE.ADMIN.ADMINS,
  Authenticator.SCOPE.ADMIN.SETTINGS,
  Authenticator.SCOPE.ADMIN.DEFAULT
];

var adminAccount = {
  userId: 1, username: 'alice', password: 'abc', scope: rootAdminPermissions
};

var admin = {
  username: 'Admin Alice',
  password: 'generated'
};

var streamPayload = {
  title: 'this is the title',
  description: 'this is the description of the stream'
};

var streamInfo = {
  title: 'this is the title',
  description: 'this is the description of the stream',
  appInstance: 'generated',
  totalViewers: 1,
};

var streamInfo2 = {
  title: 'abc def is the title',
  description: 'this is the description of the stream',
  appInstance: 'generated2',
  totalViewers: 2
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
        Code.expect(roomsManager.__getRoom(res.result.appInstance))
        .to.not.be.null();
        Code.expect(roomsManager.__getRoom(res.result.appInstance)
                    .getStreamId()).to.equal(res.result.streamId);

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
      Code.expect(roomsManager.__getRoom(res.result.appInstance))
      .to.not.be.null();
      Code.expect(roomsManager.__getRoom(res.result.appInstance).getStreamId())
      .to.equal(res.result.streamId);

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
      Code.expect(roomsManager.__getRoom(res.result.appInstance))
      .to.not.be.null();
      Code.expect(roomsManager.__getRoom(res.result.appInstance).getStreamId())
      .to.equal(res.result.streamId);
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
        Code.expect(roomsManager.__getRoom(res.result.appInstance))
        .to.be.null();
        done();
      });
    });
  });

  lab.test('Get stream by streamId valid', function(done) {
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
    Service.createNewUser(bob).then(function(user) {
      testAccount.userId = user.userId;
      return user.userId;
    }).then(function(userId) {
      return Service.createNewStream(userId, streamInfo);
    }).then(function(stream) {
      return Service.createNewStream(stream.owner, streamInfo2);
    }).then(function() {
      Router.inject({method: 'GET', url: '/api/streams?sort=title&order=asc',
                     credentials: testAccount}, function(res) {
        Code.expect(res.result).to.have.length(2);
        Code.expect(res.result[0].title).to.equal(streamInfo2.title);
        Code.expect(res.result[0].streamer.username).to.equal(bob.username);
        Code.expect(res.result[1].title).to.equal(streamInfo.title);
        Code.expect(res.result[1].streamer.username).to.equal(bob.username);
        done();
      });
    });
  });

  lab.test('Get list of streams valid sort by title desc', function(done) {
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

  lab.test('Get list of streams valid sort by viewers desc', function(done) {

    function injectionHandler(res) {
      Router.inject({method: 'GET', url: '/api/streams?sort=viewers&order=desc',
                    credentials: testAccount}, function(res) {
        Code.expect(res.result).to.have.length(2);
        Code.expect(res.result[0].title).to.equal(streamInfo2.title);
        Code.expect(res.result[0].streamer.username).to.equal(bob.username);
        Code.expect(res.result[1].title).to.equal(streamInfo.title);
        Code.expect(res.result[1].streamer.username).to.equal(bob.username);
        done();
      });
    }

    Service.createNewUser(bob).then(function(user) {
      testAccount.userId = user.userId;
      return user.userId;
    }).then(function(userId) {
      return Service.createNewStream(userId, streamInfo);
    }).then(function(stream) {
      return Service.createNewStream(stream.owner, streamInfo2);
    }).then(injectionHandler);

  });

  lab.test('Get list of streams valid sort by viewers asc', function(done) {

    function injectionHandler(res) {
      Router.inject({method: 'GET', url: '/api/streams?sort=viewers&order=asc',
                    credentials: testAccount}, function(res) {
        Code.expect(res.result).to.have.length(2);
        Code.expect(res.result[0].title).to.equal(streamInfo.title);
        Code.expect(res.result[0].streamer.username).to.equal(bob.username);
        Code.expect(res.result[1].title).to.equal(streamInfo2.title);
        Code.expect(res.result[1].streamer.username).to.equal(bob.username);
        done();
      });
    }

    Service.createNewUser(bob).then(function(user) {
      testAccount.userId = user.userId;
      return user.userId;
    }).then(function(userId) {
      return Service.createNewStream(userId, streamInfo);
    }).then(function(stream) {
      return Service.createNewStream(stream.owner, streamInfo2);
    }).then(injectionHandler);
  });

  lab.test('Get list of streams valid isSubscribed false', function(done) {
    Service.createNewUser(bob).then(function(user) {
      testAccount.userId = user.userId;
      return user.userId;
    }).then(function(userId) {
      return Service.createNewStream(userId, streamInfo);
    }).then(function(stream) {
      return Service.createNewStream(stream.owner, streamInfo2);
    }).then(function() {
      Router.inject({method: 'GET', url: '/api/streams?sort=title&order=asc',
                     credentials: testAccount}, function(res) {
        Code.expect(res.result).to.have.length(2);
        Code.expect(res.result[0].title).to.equal(streamInfo2.title);
        Code.expect(res.result[0].streamer.username).to.equal(bob.username);
        Code.expect(res.result[0].streamer.isSubscribed).to.be.false();
        Code.expect(res.result[1].title).to.equal(streamInfo.title);
        Code.expect(res.result[1].streamer.username).to.equal(bob.username);
        Code.expect(res.result[1].streamer.isSubscribed).to.be.false();
        done();
      });
    });
  });

  lab.test('Get list of streams valid isSubscribed true', function(done) {

    var userPromise1 = Service.createNewUser(bob);
    var userPromise2 = Service.createNewUser(alice);

    Promise.join(userPromise1, userPromise2,
      function(user, user2) {
        testAccount.userId = user2.userId;
        return Service.createSubscription(user2.userId, user.userId);
      }).then(function(subscription) {
        return Service.createNewStream(subscription.subscribeTo, streamInfo);
      }).then(function(stream) {
        return Service.createNewStream(stream.owner, streamInfo2);
      }).then(function() {
        Router.inject({method: 'GET', url: '/api/streams?sort=title&order=asc',
                       credentials: testAccount}, function(res) {
          Code.expect(res.result).to.have.length(2);
          Code.expect(res.result[0].title).to.equal(streamInfo2.title);
          Code.expect(res.result[0].streamer.username).to.equal(bob.username);
          Code.expect(res.result[0].streamer.isSubscribed).to.be.true();
          Code.expect(res.result[1].title).to.equal(streamInfo.title);
          Code.expect(res.result[1].streamer.username).to.equal(bob.username);
          Code.expect(res.result[1].streamer.isSubscribed).to.be.true();
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

  lab.test('End stream valid', function(done) {
    Service.createNewUser(bob).then(function(user) {
      testAccount.userId = user.userId;
      return user.userId;
    }).then(function(userId) {
      return Service.createNewStream(userId, streamInfo);
    }).then(function(stream) {
      Router.inject({method: 'POST',
                     url: '/api/streams/control/end',
                     payload: {streamId: stream.streamId},
                     credentials: testAccount}, function(res) {
        Code.expect(res.statusCode).to.equal(200);
        Code.expect(res.result.status).to.equal('OK');
        done();
      });
    });
  });

  lab.test('End stream invalid streamId', function(done) {
    Router.inject({method: 'POST',
                   url: '/api/streams/control/end',
                   payload: {streamId: '3388ffff-aa00-1111a222-00000044888c'},
                   credentials: testAccount}, function(res) {
      Code.expect(res.result.statusCode).to.equal(400);
      Code.expect(res.result.message).to.equal('Stream not found');
      done();
    });
  });

  lab.test('End stream invalid not stream owner', function(done) {
    Service.createNewUser(bob).then(function(user) {
      return user.userId;
    }).then(function(userId) {
      return Service.createNewStream(userId, streamInfo);
    }).then(function(stream) {
      Router.inject({method: 'POST',
                     url: '/api/streams/control/end',
                     payload: {streamId: stream.streamId},
                     credentials: testAccount}, function(res) {
        Code.expect(res.result.statusCode).to.equal(400);
        Code.expect(res.result.message)
          .to.equal('Not authorised to end stream');
        done();
      });
    });
  });

  lab.test('Delete stream valid', function(done) {
    Service.createNewAdmin(admin).then(function(user) {
      adminAccount.userId = user.userId;
      return user;
    }).then(function(user) {
      return Service.createNewStream(user.userId, streamInfo);
    }).then(function(stream) {
      Router.inject({method: 'DELETE',
                     url: '/api/streams/' + stream.streamId,
                     credentials: adminAccount}, function(res) {
        Code.expect(res.result.status).to.equal('OK');
        done();
      });
    });
  });

  lab.test('Delete stream invalid forbidden not admin', function(done) {
    Service.createNewUser(bob).then(function(user) {
      testAccount.userId = user.userId;
      return user.userId;
    }).then(function(userId) {
      return Service.createNewStream(userId, streamInfo);
    }).then(function(stream) {
      Router.inject({method: 'DELETE',
                     url: '/api/streams/' + stream.streamId,
                     credentials: testAccount}, function(res) {
        Code.expect(res.result.statusCode).to.equal(403);
        done();
      });
    });
  });

  lab.test('Delete stream non-existing stream', function(done) {
    Service.createNewAdmin(admin).then(function(user) {
      adminAccount.userId = user.userId;
      return user;
    }).then(function(user) {
      return Service.createNewStream(user.userId, streamInfo);
    }).then(function(stream) {
      Router.inject({method: 'DELETE',
                     url: '/api/streams/3388ffff-aa00-1111a222-00000044888c',
                     credentials: adminAccount}, function(res) {
        Code.expect(res.result.statusCode).to.equal(400);
        done();
      });
    });
  });

  lab.test('Get streams from subscriptions valid', function(done) {
    var userPromise1 = Service.createNewUser(bob);
    var userPromise2 = Service.createNewUser(alice);

    function queryStreams() {
      Router.inject({method: 'GET',
                     url: '/api/streams/subscriptions',
                     credentials: testAccount}, function(res) {
        Code.expect(res.result).to.have.length(2);
        Code.expect(res.result[0].description)
          .to.equal(streamInfo.description);
        Code.expect(res.result[1].description)
          .to.equal(streamInfo2.description);
        done();
      });
    }

    Promise.join(userPromise1, userPromise2,
      function(bob, alice) {
        testAccount.userId = bob.userId;
        return Service.createSubscription(bob.userId, alice.userId)
        .then((subscription) => {
          return Service.createNewStream(alice.userId, streamInfo);
        }).then((stream) => {
          return Service.createNewStream(alice.userId, streamInfo2);
        }).then((stream) => queryStreams());
      });
  });

  lab.test('Get streams from subscriptions valid no streams from subscriptions',
    function(done) {
      var userPromise1 = Service.createNewUser(bob);
      var userPromise2 = Service.createNewUser(alice);

      function queryStreams() {
        Router.inject({method: 'GET',
                       url: '/api/streams/subscriptions',
                       credentials: testAccount}, function(res) {
          Code.expect(res.result).to.deep.equal([]);
          done();
        });
      }

      Promise.join(userPromise1, userPromise2,
        function(bob, alice) {
          testAccount.userId = bob.userId;
          return Service.createSubscription(bob.userId, alice.userId)
            .then((subscription) => queryStreams());
        });
    });

  lab.test('Get streams from subscriptions valid no subscriptions',
    function(done) {
      var userPromise1 = Service.createNewUser(bob);
      var userPromise2 = Service.createNewUser(alice);

      function queryStreams() {
        Router.inject({method: 'GET',
                       url: '/api/streams/subscriptions',
                       credentials: testAccount}, function(res) {
          Code.expect(res.result).to.deep.equal([]);
          done();
        });
      }

      Promise.join(userPromise1, userPromise2,
        function(bob, alice) {
          testAccount.userId = bob.userId;
          return Service.createNewStream(alice.userId, streamInfo)
          .then((stream) => {
            return Service.createNewStream(alice.userId, streamInfo2);
          }).then((stream) => queryStreams());
        });
    });

});

lab.experiment('StreamController Control Tests', () => {
  let testStream = {
    title: 'Test Stream',
    description: 'No description',
    appInstance: 'abcdefg'
  };
  let expectedAuthToken = new Buffer('username:password', 'utf8')
                              .toString('base64');

  function createTestUserAndStream(streamInfo) {
    return Service.createNewUser(bob)
    .then((user) => {
      testAccount.userId = user.userId;
      return user.userId;
    }).then((userId) => {
      return Service.createNewStream(userId, streamInfo);
    });
  }

  function mockMediaServer(expectedStreamId) {
    let mediaServer = new Hapi.Server();
    mediaServer.connection({port: 8086});
    mediaServer.route({
      method: 'POST',
      path: '/control',
      handler: function (request, reply) {
        if (request.headers.authorization !== `Basic ${expectedAuthToken}`) {
          return reply('Unauthorized').code(401);
        }

        let payload = request.payload;
        if (payload.stop === '1' && payload.app == 'worldscope' &&
            payload.appInstance == testStream.appInstance &&
            payload.stream === expectedStreamId) {
          return reply({status: 'OK', message: ''});
        }

        return reply({status: 'ERR', message: 'Unexpected parameters'});
      }
    });

    return mediaServer;
  }

  lab.beforeEach({timeout: 10000}, (done) => {
    TestUtils.resetDatabase(done);
  });

  lab.test('Stop valid stream', (done) => {
    createTestUserAndStream(testStream).then((stream) => {
      let mediaServer = mockMediaServer(stream.streamId);
      mediaServer.start(() => {
        Router.inject({method: 'POST', url: '/api/streams/control/stop',
                      credentials: testAccount,
                      payload: {
                        appInstance: stream.appInstance,
                        streamId: stream.streamId
                      }}, (res) => {
          Code.expect(res.result.status).to.equal('OK');
          Service.getStreamById(stream.streamId)
          .then((updatedStream) => {
            Code.expect(updatedStream.live === false);
            Code.expect(roomsManager.__getRoom(updatedStream.appInstance))
            .to.be.null();
            mediaServer.stop(() => done());
          });
        });
      });
    });
  });

  lab.test('Stop stream media server offline', (done) => {
    createTestUserAndStream(testStream).then((stream) => {
      Router.inject({method: 'POST', url: '/api/streams/control/stop',
                    credentials: testAccount,
                    payload: {
                      appInstance: stream.appInstance,
                      streamId: stream.streamId
                    }}, (res) => {
        Code.expect(res.statusCode).to.equal(400);
        done();
      });
    });
  });

  lab.test('Stop stream invalid appInstance', (done) => {
    createTestUserAndStream(testStream).then((stream) => {
      Router.inject({method: 'POST', url: '/api/streams/control/stop',
                    credentials: testAccount,
                    payload: {
                      appInstance: 'xyz',
                      streamId: stream.streamId
                    }}, (res) => {
        Code.expect(res.statusCode).to.equal(400);
        done();
      });
    });
  });

  lab.test('End stream should close corresponding chat room', (done) => {
    var streamInfo = {
      title: 'this is the title',
      description: 'this is the description of the stream',
      appInstance: 'generated'
    };

    Service.createNewUser(bob)
    .then((user) => {
      testAccount.userId = user.userId;
      return user.userId;
    }).then((userId) => {
      return Service.createNewStream(userId, streamInfo);
    }).then((stream) => {
      Router.inject({method: 'POST',
                     url: '/api/streams/control/end',
                     payload: {streamId: stream.streamId},
                     credentials: testAccount}, (res) => {
        Code.expect(roomsManager.__getRoom(stream.appInstance))
        .to.be.null();
        done();
      });
    });
  });
});

lab.experiment('Streams Statistics Tests', function() {
  lab.before({timeout: 10000}, function(done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('Failed to connect media server', function(done) {
    Router.inject({method: 'GET',
                    url: '/api/streams/statistics',
                    credentials: adminAccount}, (res) => {
      Code.expect(res.statusCode).to.equal(502);
      done();
    });
  });

  lab.test('Empty statistics for non-live streams', function(done) {
    Router.inject({method: 'GET',
                    url: '/api/streams/statistics?state=all',
                    credentials: adminAccount}, (res) => {
      Code.expect(res.result).to.be.empty();
      done();
    });
  });
});
