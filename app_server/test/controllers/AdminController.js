var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var expect = require('code').expect;
var _ = require('underscore');

var Storage = rfr('app/models/Storage.js');
var Router = rfr('app/Router.js');

var TestUtils = rfr('test/TestUtils');
var Service = rfr('app/services/Service');
var Authenticator = rfr('app/policies/Authenticator');

var testAccount = {
  userId: 1, username: 'bob', password: 'abc', scope: Authenticator.SCOPE.ADMIN
};

var admin = {
  username: 'Bob',
  password: 'generated'
};

lab.experiment('AdminController Function Tests', function () {
  lab.beforeEach({timeout: 10000}, function (done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('Create admin', function (done) {
    Service.createNewAdmin(admin).then(function (result) {
      return Service.getAdminByUsername(result.username);
    }).then(function(user) {
      expect(user.username).to.equal(admin.username);
      done();
    });
  });
});

lab.experiment('AdminController Routes tests', function () {
  lab.beforeEach(function (done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('Unauthorized to public routes', function (done) {
    var routes = {
      POST: [
        '/api/admins'
      ]
    };

    var checkUnauthorized = function (method, url) {
      Router.inject({method: method, url: url}, function (res) {
        expect(res.statusCode).to.equal(401);
      });
    };

    routes.POST.map((url) => checkUnauthorized('POST', url));
    done();
  });

  lab.test('Create admin without params or credentials', function (done) {
    Router.inject({
      method: 'POST', url: '/api/admins'
    }, function (res) {
      expect(res.statusCode).to.equal(401);
    });

    Router.inject({
      method: 'POST', url: '/api/admins', credentials: testAccount
    }, function (res) {
      expect(res.statusCode).to.equal(400);
    });

    done();
  });
});
