var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var _ = require('underscore');

var Storage = rfr('app/models/Storage.js');
var Router = rfr('app/Router.js');
var Facebook = rfr('app/adapters/social_media/Facebook');
var TestUtils = rfr('test/TestUtils');
var Service = rfr('app/services/Service');

var testAccount = {userId: 1, username: 'bob', password: 'abc'};

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

lab.experiment('UserController Tests', function () {
  lab.beforeEach(function (done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('Get list of users', function (done) {
    Router.inject({url: '/api/users', credentials: testAccount},
      function (res) {
        Code.expect(res.result).to.equal('Hello Sharmine!');
        done();
      });
  });

  lab.test('Valid id', function (done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.getUserById(result.userId);
    }).then(function(user) {
      Router.inject({url: '/api/users/' + user.userId,
                     credentials: testAccount},
                    function (res) {
                      Code.expect(res.result.username).to.equal(bob.username);
                      done();
                    });
    });
  });

  lab.test('Get user by invalid id', function (done) {
    Router.inject({url: '/api/users/asd@1$', credentials: testAccount},
      function (res) {
        var errorMsg = 'child "id" fails because ["id" must be a valid GUID]';
        Code.expect(res.result.statusCode).to.equal(400);
        Code.expect(res.result.message).to.equal(errorMsg);
        done();
      });
  });

  lab.test('Valid logout', function (done) {
    Router.inject({method: 'GET', url: '/api/users/logout'}, function (res) {
      Code.expect(res.result).to.equal('Logged out');
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
  var facebookServer = TestUtils.mockFacebookServer();

  lab.beforeEach(function (done) {
    TestUtils.resetDatabase(done);
  });

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
      Code.expect(res.statusCode).to.equal(400);
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
      Code.expect(res.statusCode).to.equal(400);
      done();
    });
  });

  lab.test('Valid login', function (done) {
    facebookServer.start(function (err) {
      Code.expect(err).to.not.be.null();

      Facebook.FACEBOOK_API_URL = 'http://localhost:8888';

      Router.inject({method: 'POST', url: '/api/users/login',
                     payload: {appId: '123456789',
                               accessToken: 'xyz'}}, function (res) {
        var expected = {
          alias: 'Bob The Builder',
          username: '18292522986296117@facebook',
          platformType: 'facebook',
          platformId: '18292522986296117'
        };

        Code.expect(res.statusCode).to.equal(200);

        var body = TestUtils.copyObj(JSON.parse(res.payload),
                                     Object.keys(expected));
        Code.expect(_.isEqual(expected, body)).to.be.true();

        Facebook.FACEBOOK_API_URL = 'https://graph.facebook.com';
        facebookServer.stop((err) => {});

        // API request with logged in cookie should now be authorized
        Router.inject({method: 'GET', url: '/',
                       headers: {
                         'Cookie': res.headers['set-cookie'][0].split(';')[0]
                       }},
                      function (res2) {
                        Code.expect(res2.statusCode).to.equal(200);
                        done();
                      });
      });
    });
  });
});
