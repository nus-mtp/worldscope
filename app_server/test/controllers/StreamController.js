var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');

var Router = rfr('app/Router.js');

lab.experiment('StreamController Tests', function () {

  var testAccount = {
    userId: '123-123',
    username: 'dfsfd',
    password: 'dff'
  };

  var streamInfo = {
    title: 'this is the title',
    description: 'this is the description of the stream'
  };

  lab.test('Get list of streams', function (done) {
    Router.inject('/api/streams', function (res) {
      Code.expect(res.result).to.equal('Hello Thien!');
      done();
    });
  });

  lab.test('Valid streamId', function (done) {
    Router.inject('/api/streams/213', function (res) {
      Code.expect(res.result).to.equal('Hello 213!');
      done();
    });
  });

  lab.test('Valid create stream', function (done) {
    Router.inject({method: 'POST', url: '/api/streams',
                   credentials: testAccount,
                   payload: streamInfo}, function (res) {
      Code.expect(res.result).to.equal('bogusinstancebogusid');
      done();
    });
  });

});

