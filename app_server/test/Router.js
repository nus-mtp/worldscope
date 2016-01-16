var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');

var Router = rfr('app/Router.js');
var testAccount = {userId: 1, username: 'bob', password: 'abc'};

lab.experiment('Router Tests', function () {
  lab.test('Root request', function (done) {
    Router.inject({url: '/', credentials: testAccount}, function (res) {
      Code.expect(res.result).to.equal('Welcome to WorldScope');
      done();
    });
  });
});
