var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var expect = require('code').expect;

var Storage = rfr('app/models/Storage.js');
var Router = rfr('app/Router.js');

var TestUtils = rfr('test/TestUtils');
var Service = rfr('app/services/Service');
var Authenticator = rfr('app/policies/Authenticator');

var rootAdminPermissions = [
  Authenticator.SCOPE.ADMIN.METRICS,
  Authenticator.SCOPE.ADMIN.STREAMS,
  Authenticator.SCOPE.ADMIN.USERS,
  Authenticator.SCOPE.ADMIN.ADMINS,
  Authenticator.SCOPE.ADMIN.SETTINGS
];

var testAccount = {
  userId: 1, username: 'bob', password: 'abc', scope: rootAdminPermissions
};

var admin = {
  username: 'Bob',
  password: 'generated'
};

var rootAdmin = Object.assign({}, admin);
rootAdmin.permissions = rootAdminPermissions;

lab.experiment('AdminController Function Tests', function() {
  lab.beforeEach({timeout: 10000}, function(done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('Create admin', function(done) {
    Service.createNewAdmin(admin).then(function(result) {
      return Service.getAdminByUsername(result.username);
    }).then(function(user) {
      expect(user.username).to.equal(admin.username);
      done();
    });
  });
});

lab.experiment('AdminController Routes tests', function() {
  lab.beforeEach(function(done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('Unauthorized to public routes', function(done) {
    var routes = {
      POST: [
        '/api/admins'
      ]
    };

    var checkUnauthorized = function(method, url) {
      Router.inject({method: method, url: url}, function(res) {
        expect(res.statusCode).to.equal(401);
      });
    };

    routes.POST.map((url) => checkUnauthorized('POST', url));
    done();
  });

  lab.test('Create admin without params or credentials', function(done) {
    Router.inject({
      method: 'POST', url: '/api/admins'
    }, function(res) {
      expect(res.statusCode).to.equal(401);
    });

    Router.inject({
      method: 'POST', url: '/api/admins', credentials: testAccount
    }, function(res) {
      expect(res.statusCode).to.equal(400);
    });

    done();
  });

  lab.test('Login without params', function(done) {
    Router.inject({
      method: 'POST', url: '/api/admins/login'
    }, function(res) {
      expect(res.statusCode).to.equal(400);
      done();
    });
  });

  lab.test('Login with invalid credentials', function(done) {
    Router.inject({
      method: 'POST', url: '/api/admins/login', payload: admin
    }, function(res) {
      expect(res.statusCode).to.equal(401);
      done();
    });
  });

  lab.test('Create admin, login, and access authorized route', function(done) {
    Router.inject({
      method: 'POST', url: '/api/admins', credentials: testAccount,
      payload: rootAdmin
    }, function checkCreation(res) {
      expect(res.statusCode).to.equal(201);
      expect(TestUtils.isEqualOnProperties(
          admin, JSON.parse(res.payload)
      )).to.be.true();

      Router.inject({
        method: 'POST', url: '/api/admins/login', payload: rootAdmin
      }, function checkLoggedIn(res) {
        expect(res.statusCode).to.equal(200);
        expect(TestUtils.isEqualOnProperties(
            admin, JSON.parse(res.payload)
        )).to.be.true();

        Router.inject({
          method: 'POST', url: '/api/admins', payload: {},
          headers: {'Cookie': res.headers['set-cookie'][0].split(';')[0]}
        }, function checkValidCredentials(res) {
          // 401 if invalid credentials
          expect(res.statusCode).to.equal(400);
          done();
        });
      });
    });
  });

  lab.test('Logout', function(done) {
    Router.inject({
      method: 'GET', url: '/api/admins/logout'
    }, function(res) {
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.equal('Logged out');
      done();
    });
  });
});
