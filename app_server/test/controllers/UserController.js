var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var Hapi = require('hapi');

var Router = rfr('app/Router.js');
var Facebook = rfr('app/adapters/social_media/Facebook');

var testAccount = {userId: 1, username: 'bob', password: 'abc'};

lab.experiment('UserController Tests', function () {
  lab.test('Get list of users', function (done) {
    Router.inject({url: '/api/users', credentials: testAccount},
      function (res) {
        Code.expect(res.result).to.equal('Hello Sharmine!');
        done();
      });
  });

  lab.test('Valid id', function (done) {
    Router.inject({url: '/api/users/213', credentials: testAccount},
      function (res) {
        Code.expect(res.result).to.equal('Hello 213!');
        done();
      });
  });

  lab.test('Get list of users', function (done) {
    Router.inject({url: '/api/users/asd', credentials: testAccount},
      function (res) {
        var errorMsg = 'child "id" fails because ["id" must be a number]';
        Code.expect(res.result.statusCode).to.equal(400);
        Code.expect(res.result.message).to.equal(errorMsg);
        done();
      });
  });

  lab.test('Valid logout', function (done) {
    Router.inject({method: 'POST', url: '/api/users/logout'}, function (res) {
      Code.expect(res.result).to.equal('Logged out!');
      done();
    });
  });

  lab.test('Request without credentials', function (done) {
    Router.inject({url: '/api/users'}, function (res) {
      Code.expect(res.statusCode).to.equal(401);
      done();
    });
  });
});

lab.experiment('UserController log in tests', function () {
  lab.test('Login no credentials', function (done) {
    Router.inject({method: 'POST', url: '/api/users/login'}, function (res) {
      Code.expect(res.statusCode).to.equal(400);
      done();
    });
  });

  lab.test('Login mising appId', function (done) {
    Router.inject({method: 'POST', url: '/api/users/login',
                   payload: {accessToken: 'xyz'}}, function (res) {
      Code.expect(res.statusCode).to.equal(400);
      done();
    });
  });

  lab.test('Login invalid appId', function (done) {
    Router.inject({method: 'POST', url: '/api/users/login',
                   payload: {appId: 'blahblah',
                             accessToken: 'xyz'}}, function (res) {
      Code.expect(res.statusCode).to.equal(401);
      done();
    });
  });

  lab.test('Login missing accessToken', function (done) {
    Router.inject({method: 'POST', url: '/api/users/login',
                   payload: {appId: 'blahblah'}}, function (res) {
      Code.expect(res.statusCode).to.equal(400);
      done();
    });
  });

  lab.test('Login empty accessToken', function (done) {
    Router.inject({method: 'POST', url: '/api/users/login',
                   payload: {appId: '123456789',
                             accessToken: ''}}, function (res) {
      Code.expect(res.statusCode).to.equal(400);
      done();
    });
  });

  lab.test('Login invalid accessToken', function (done) {
    Router.inject({method: 'POST', url: '/api/users/login',
                   payload: {appId: '123456789',
                             accessToken: 'xyz'}}, function (res) {
      Code.expect(res.statusCode).to.equal(401);
      done();
    });
  });

  lab.test('Valid login', function (done) {
    // User a Hapi server instance to mock Facebook's service
    var facebookServer = new Hapi.Server();
    facebookServer.connection({port: 8888});
    facebookServer.route({
      method: 'GET',
      path: '/v2.5/me',
      handler: function (request, reply) {
        if (request.query.access_token == 'xyz') {
          reply({name: 'Bob The Builder', 'id': '18292522986296117'});
        } else {
          reply('Unauthorized').code(401);
        }
      }
    });

    facebookServer.start(function (err) {
      Code.expect(err).to.not.be.null();

      Facebook.FACEBOOK_API_URL = 'http://localhost:8888';

      Router.inject({method: 'POST', url: '/api/users/login',
                    payload: {appId: '123456789',
                              accessToken: 'xyz'}}, function (res) {
        var expected = {
          alias: 'Bob The Builder',
          username: '18292522986296117@facebook',
          accessToken: 'xyz',
          platformType: 'facebook',
          platformId: '18292522986296117'
        };

        Code.expect(res.statusCode).to.equal(200);

        var body = JSON.parse(res.payload);
        Code.expect(body.alias).to.equal(expected.alias);
        Code.expect(body.username).to.equal(expected.username);
        Code.expect(body.platformType).to.equal(expected.platformType);
        Code.expect(body.platformId).to.equal(expected.platformId);
        Code.expect(body.accessToken).to.equal(expected.accessToken);

        Facebook.FACEBOOK_API_URL = 'https://graph.facebook.com';
        facebookServer.stop(function () {});

        // API request with logged in cookie should now be authorized
        Router.inject({method: 'GET', url: '/',
                       headers: {'Cookie': res.headers['Set-Cookie']}},
                      function (res2) {
                        Code.expect(res.statusCode).to.equal(200);
                        done();
                      });
      });
    });

  });
});
