var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');

var Router = rfr('app/Router.js');
var Authenticator = rfr('app/policies/Authenticator');
var TestUtils = rfr('test/TestUtils');

var testAccount = {userId: 1, username: 'bob', password: 'abc',
                   scope: Authenticator.SCOPE.USER};

lab.experiment('Router Tests', function () {
  lab.test('root request', function (done) {
    Router.inject({url: '/', credentials: testAccount}, function (res) {
      Code.expect(res.result).to.equal('Welcome to WorldScope');
      done();
    });
  });

  lab.test('missing scope authorization', function (done) {
    var account = TestUtils.copyObj(testAccount,
                                  ['userId', 'username', 'password']);
    Router.inject({url: '/', credentials: account}, function (res) {
      Code.expect(res.statusCode).to.equal(403);
      done();
    });
  });
});
