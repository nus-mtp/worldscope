'use strict';
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
var Authenticator = rfr('app/policies/Authenticator');

var testAccount = {userId: 1, username: 'bob', password: 'abc',
                   scope: Authenticator.SCOPE.USER};

var testAdmin = Object({}, testAccount);
testAdmin.scope = [
  Authenticator.SCOPE.ADMIN.DEFAULT,
  Authenticator.SCOPE.ADMIN.USERS
];

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

lab.experiment('UserController Tests', {timeout: 5000}, function () {
  lab.beforeEach({timeout: 10000}, function (done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('Get list of users valid empty', function (done) {
    Router.inject({url: '/api/users', credentials: testAccount},
      function (res) {
        Code.expect(res.result).to.have.length(0);
        done();
      });
  });

  lab.test('Get list of users valid default', function (done) {
    Service.createNewUser(bob).then(() => Service.createNewUser(alice))
      .then(function() {
        return Router.inject({url: '/api/users', credentials: testAccount},
        function (res) {
          Code.expect(res.result[0].username).to.equal(alice.username);
          Code.expect(res.result[1].username).to.equal(bob.username);
          done();
        });
      });
  });

  lab.test('Get number of users valid no users', function (done) {
    Router.inject({url: '/api/users/all/statistics', credentials: testAccount},
      function (res) {
        Code.expect(res.result).to.equal(0);
        done();
      });
  });

  lab.test('Get number of users valid', function (done) {
    Service.createNewUser(bob).then(() => Service.createNewUser(alice))
    .then(() => {
      Router.inject({url: '/api/users/all/statistics',
                     credentials: testAccount},
        function (res) {
          Code.expect(res.result).to.equal(2);
          done();
        });
    });
  });

  lab.test('Get user by valid id', function (done) {
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

  lab.test('Get self', function (done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.getUserById(result.userId);
    }).then(function(user) {
      let credentials = TestUtils.copyObj(user,
                                          ['userId', 'username', 'password']);
      credentials.scope = Authenticator.SCOPE.USER;
      Router.inject({url: '/api/users/me',
                     credentials: credentials},
                    function (res) {
                      console.log(res.result);
                      Code.expect(res.result.username).to.equal(bob.username);
                      done();
                    });
    });
  });

  lab.test('Get user by invalid format id', function (done) {
    Router.inject({url: '/api/users/asd@1$', credentials: testAccount},
      function (res) {
        var errorMsg = 'child "id" fails because ["id" must be a valid GUID]';
        Code.expect(res.result.statusCode).to.equal(400);
        Code.expect(res.result.message).to.equal(errorMsg);
        done();
      });
  });

  lab.test('Get user by invalid id', function (done) {
    var invalidId = '3388ffff-aa00-1111a222-00000044888c';
    Router.inject({url: '/api/users/' + invalidId,
                   credentials: testAccount},
      function (res) {
        var errorMsg = 'Unable to get user with id ' + invalidId;
        Code.expect(res.result.statusCode).to.equal(400);
        Code.expect(res.result.message).to.equal(errorMsg);
        done();
      });
  });

  lab.test('Update user valid', function (done) {
    var updates = {
      alias: 'Taeng',
      email: 'taeng@email.com',
      description: 'hey hey hey!'
    };

    Service.createNewUser(bob).then(function (user) {
      Router.inject({method: 'PUT', url: '/api/users/' + user.userId,
                     credentials: testAdmin,
                     payload: updates},
        function (res) {
          Code.expect(TestUtils.isEqualOnProperties(updates, res.result))
            .to.be.true();

          Service.getUserById(user.userId).then(function (user) {
            Code.expect(TestUtils.isEqualOnProperties(updates, user))
              .to.be.true();
            done();
          });
        });
    });
  });

  lab.test('Update user valid (self)', function (done) {
    var updates = {
      alias: 'Taeng',
      email: 'taeng@email.com',
      description: 'hey hey hey!'
    };

    Service.createNewUser(bob).then(function (user) {
      testAccount.userId = user.userId;
      Router.inject({method: 'PUT', url: '/api/users',
                     credentials: testAccount,
                     payload: updates},
        function (res) {
          Code.expect(TestUtils.isEqualOnProperties(updates, res.result))
            .to.be.true();

          Service.getUserById(testAccount.userId).then(function (user) {
            Code.expect(TestUtils.isEqualOnProperties(updates, user))
              .to.be.true();
            done();
          });
        });
    });
  });

  lab.test('Update user valid no payload', function (done) {
    Service.createNewUser(bob).then(function (user) {
      testAccount.userId = user.userId;
      Router.inject({method: 'PUT', url: '/api/users',
                     credentials: testAccount,
                     payload: {}},
        function (res) {
          Code.expect(res.result.username).to.equal(bob.username);
          done();
        });
    });
  });

  lab.test('Update user invalid restricted column', function (done) {
    var updates = {
      platformId: '1234566@facebook'
    };

    Service.createNewUser(bob).then(function (user) {
      testAccount.userId = user.userId;
      Router.inject({method: 'PUT', url: '/api/users',
                     credentials: testAccount,
                     payload: updates},
        function (res) {
          Code.expect(res.result.statusCode).to.equal(400);
          Code.expect(res.result.message)
            .to.equal('"platformId" is not allowed');
          done();
        });
    });
  });

  lab.test('Update user invalid email', function (done) {
    var updates = {
      email: 'abc'
    };

    Service.createNewUser(bob).then(function (result) {
      return Service.getUserById(result.userId);
    }).then(function(user) {
      Router.inject({method: 'PUT', url: '/api/users',
                     credentials: testAccount,
                     payload: updates},
        function (res) {
          Code.expect(res.result.statusCode).to.equal(400);
          Code.expect(res.result.message).to.equal('Unable to update user');
          done();
        });
    });
  });

  lab.test('Valid logout', function (done) {
    Router.inject({method: 'GET', url: '/api/users/logout'}, function (res) {
      Code.expect(res.result.status).to.equal('OK');
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

lab.experiment('UserController log in tests', {timeout: 5000}, () => {
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
