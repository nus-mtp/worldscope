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
  Authenticator.SCOPE.ADMIN.SETTINGS,
  Authenticator.SCOPE.ADMIN.DEFAULT
];

var testAccount = {
  userId: 1, username: 'bob', password: 'abc', scope: rootAdminPermissions
};

var admin = {
  username: 'Bob',
  password: 'generated'
};

var adminForDB = Object.assign({}, admin);
adminForDB.permissions = Authenticator.SCOPE.ADMIN.DEFAULT;

var rootAdmin = {
  username: 'Jane',
  password: 'manual',
  permissions: rootAdminPermissions
};

var rootAdminForDB = Object.assign({}, rootAdmin);
rootAdminForDB.permissions = rootAdminPermissions.join(';');

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

  lab.test('Get list of admins', function(done) {
    Promise.all([
      Service.createNewAdmin(adminForDB),
      Service.createNewAdmin(rootAdminForDB)
    ])
    .then(() => Service.getListOfAdmins({order: 'asc'}))
    .then(function(list) {
      expect(list[0].username).to.equal(admin.username);
      expect(list[1].username).to.equal(rootAdmin.username);
      done();
    });
  });

  lab.test('Update admin', function(done) {
    Service.createNewAdmin(adminForDB)
    .then(function(result) {
      var newAdmin = Object.assign({}, adminForDB);
      newAdmin.username = 'Bobby';
      return Service.updateAdmin(result.userId, newAdmin);
    })
    .then((admin) => Service.getAdminByUsername(admin.username))
    .then(function(result) {
      expect(result.username).to.equal('Bobby');
      done();
    });
  });

  lab.test('Delete admin', function(done) {
    Service.createNewAdmin(adminForDB)
    .then((admin) => Service.deleteAdmin(admin.userId))
    .then(() => Service.getAdminByUsername(adminForDB.username))
    .then(function(result) {
      expect(result).to.be.null();
      done();
    });
  });
});

lab.experiment('AdminController Routes tests', function() {
  lab.beforeEach(function(done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('Unauthorized-to-public routes', function(done) {
    var routes = {
      GET: [
        '/api/admins',
        '/api/admins/username'
      ],
      POST: [
        '/api/admins'
      ],
      PUT: [
        '/api/admins/id'
      ],
      DELETE: [
        '/api/admins/id'
      ]
    };

    var checkUnauthorized = function(method, url) {
      Router.inject({method: method, url: url}, function(res) {
        expect(res.statusCode).to.equal(401);
      });
    };

    Object.keys(routes).forEach(
        (method) => routes[method].forEach(
            (url) => checkUnauthorized(method, url)));
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

  lab.test('Get admin by username', function(done) {
    Router.inject({
      method: 'POST', url: '/api/admins', credentials: testAccount,
      payload: admin
    }, function getAdmin(res) {
      expect(res.statusCode).to.equal(201);

      Router.inject({
        method: 'GET', url: '/api/admins/' + admin.username,
        credentials: testAccount
      }, function checkValid(res) {
        expect(res.statusCode).to.equal(200);
        expect(JSON.parse(res.payload).username).to.equal(admin.username);

        done();
      });
    });
  });

  lab.test('Get list of admins', function(done) {
    Router.inject({
      method: 'POST', url: '/api/admins', credentials: testAccount,
      payload: admin
    }, function createAnotherAdmin(res) {
      expect(res.statusCode).to.equal(201);

      Router.inject({
        method: 'POST', url: '/api/admins', credentials: testAccount,
        payload: rootAdmin
      }, function getAdmins(res) {
        expect(res.statusCode).to.equal(201);

        Router.inject({
          method: 'GET', url: '/api/admins', credentials: testAccount
        }, function checkAdmins(res) {
          expect(res.statusCode).to.equal(200);

          var admins = JSON.parse(res.payload);
          expect(admins.length).to.equal(2);
          expect(admins[0].username).to.equal(admin.username);
          expect(admins[1].username).to.equal(rootAdmin.username);

          done();
        });
      });
    });
  });

  lab.test('Update admin', function(done) {
    Router.inject({
      method: 'POST', url: '/api/admins', credentials: testAccount,
      payload: admin
    }, function updateAdmin(res) {
      expect(res.statusCode).to.equal(201);

      Router.inject({
        method: 'PUT', url: '/api/admins/' + JSON.parse(res.payload).userId,
        credentials: testAccount, payload: rootAdmin
      }, function getAdmins(res) {
        expect(res.statusCode).to.equal(200);
        expect(TestUtils.isEqualOnProperties(
            rootAdmin, JSON.parse(res.payload)
        )).to.be.true();

        Router.inject({
          method: 'GET', url: '/api/admins/' + rootAdmin.username,
          credentials: testAccount
        }, function checkAdmin(res) {
          expect(res.statusCode).to.equal(200);
          expect(JSON.parse(res.payload).username).to.equal(rootAdmin.username);

          done();
        });
      });
    });
  });

  lab.test('Delete admin', function(done) {
    Router.inject({
      method: 'POST', url: '/api/admins', credentials: testAccount,
      payload: admin
    }, function deleteAdmin(res) {
      expect(res.statusCode).to.equal(201);

      Router.inject({
        method: 'DELETE', url: '/api/admins/' + JSON.parse(res.payload).userId,
        credentials: testAccount
      }, function getDeletedAdmin(res) {
        expect(res.statusCode).to.equal(200);

        Router.inject({
          method: 'GET', url: '/api/admins/' + admin.username,
          credentials: testAccount
        }, function checkDeleted(res) {
          expect(res.statusCode).to.equal(400);

          done();
        });
      });
    });
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

  lab.test(
    'Create admin, login, and access authorized route', {timeout: 5000},
    (done) => {
      Router.inject({
        method: 'POST', url: '/api/admins', credentials: testAccount,
        payload: rootAdmin
      }, function checkCreation(res) {
        expect(res.statusCode).to.equal(201);
        var resAdmin = JSON.parse(res.payload);
        expect(resAdmin.username).to.equal(rootAdmin.username);
        expect(resAdmin.password).to.equal(rootAdmin.password);

        Router.inject({
          method: 'POST', url: '/api/admins/login', payload: rootAdmin
        }, function checkLoggedIn(res) {
          expect(res.statusCode).to.equal(200);
          var resAdmin = JSON.parse(res.payload);
          expect(resAdmin.username).to.equal(rootAdmin.username);
          expect(resAdmin.password).to.equal(rootAdmin.password);

          Router.inject({
            method: 'POST', url: '/api/admins', payload: {},
            headers: {
              'Cookie': res.headers['set-cookie'][0].split(';')[0],
              'x-csrf-token': res.headers['set-cookie'][0].split(';')[0]
            }
          }, function checkValidCredentials(res) {
            // 401 if invalid credentials
            expect(res.statusCode).to.equal(400);
            done();
          });
        });
      });
    });

  lab.test('Login and Logout', {timeout: 5000}, (done) => {
    Router.inject({
      method: 'POST', url: '/api/admins', credentials: testAccount,
      payload: rootAdmin
    }, function login() {
      Router.inject({
        method: 'POST', url: '/api/admins/login', payload: rootAdmin
      }, function checkLoggedIn(res) {
        expect(res.statusCode).to.equal(200);

        var cookie = res.headers['set-cookie'][0].split(';')[0];
        var token = cookie;

        Router.inject({
          method: 'POST', url: '/api/admins', payload: {},
          headers: {
            'Cookie': cookie,
            'x-csrf-token': token
          }
        }, function checkValidCredentials(res) {
          // 401 if invalid credentials
          expect(res.statusCode).to.equal(400);

          Router.inject({
            method: 'GET', url: '/api/admins/logout',
            headers: {
              'Cookie': cookie,
              'x-csrf-token': token
            }
          }, function checkLoggedOut(res) {
            expect(res.statusCode).to.equal(200);
            token = cookie = res.headers['set-cookie'][0].split(';')[0];

            Router.inject({
              method: 'POST', url: '/api/admins', payload: {},
              headers: {
                'Cookie': cookie,
                'x-csrf-token': token
              }
            }, function checkInvalidCredentials(res) {
              expect(res.statusCode).to.equal(401);
              done();
            });
          });
        });
      });
    });
  });
});
