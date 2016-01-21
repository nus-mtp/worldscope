var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');

var Authenticator = rfr('app/policies/Authenticator');
var Service = rfr('app/services/Service');
var TestUtils = rfr('test/TestUtils');
var Router = rfr('app/Router.js');

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

var streamInfo = {
  title: 'this is the title',
  description: 'this is the description of the stream'
};

lab.experiment('StreamController Tests', function () {

  lab.beforeEach({timeout: 10000}, function (done) {
    TestUtils.resetDatabase(done);
  });

/*  lab.test('Get list of streams', function (done) {
    Router.inject({method: 'GET', url: '/api/streams',
                   credentials: testAccount}, function (res) {
      //console.log(res);
      Code.expect(res.result).to.equal([]);
      done();
    });
  });*/

/*  lab.test('Valid streamId', function (done) {
    Router.inject('/api/streams/213', function (res) {
      Code.expect(res.result).to.equal('Hello 213!');
      done();
    });
  });
*/
  lab.test('Valid create stream', function (done) {
    Service.createNewUser(bob).then(function (user) {
      return user.userId;
    }).then(function(userId) {
      testAccount.userId = userId;
      Router.inject({method: 'POST', url: '/api/streams',
                     credentials: testAccount,
                     payload: streamInfo}, function (res) {
        Code.expect(res.result.title).to.equal('this is the title');

        done();
      });
    });
  });

});

/*
 urlParts = res.streamLink.split("/");
        Code.expect(resParts[0]).to.equal(Utility.streamBaseUrl);
        Code.expect(resParts[1]).to.have.length(64);
        Code.expect(resParts[2]).to.have.length(36);*/

