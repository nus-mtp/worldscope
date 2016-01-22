var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');

var Authenticator = rfr('app/policies/Authenticator');
var Utility = rfr('app/util/Utility')
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

var streamPayload = {
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

  lab.test('Create stream valid', function (done) {
    Service.createNewUser(bob).then(function (user) {
      return user.userId;
    }).then(function(userId) {
      testAccount.userId = userId;
      Router.inject({method: 'POST', url: '/api/streams',
                     credentials: testAccount,
                     payload: streamPayload}, function (res) {

        var urlParts = res.result.streamLink.split("/");
        Code.expect(urlParts[urlParts.length-1]).to.have.length(36);
        Code.expect(urlParts[urlParts.length-2]).to.have.length(64);
        Code.expect(res.result.title).to.equal('this is the title');
        done();
      });
    });
  });

  lab.test('Create stream missing userId', function (done) {
    delete testAccount.userId;
    Router.inject({method: 'POST', url: '/api/streams',
                   credentials: testAccount,
                   payload: streamPayload}, function (res) {
      Code.expect(res.result.statusCode).to.equal(401);
      Code.expect(res.result.error).to.equal('Unauthorized');
      done();
    });
  });

  lab.test('Create stream invalid userId', function (done) {
    testAccount.userId = 'non-existing-user'
    Router.inject({method: 'POST', url: '/api/streams',
                   credentials: testAccount,
                   payload: streamPayload}, function (res) {
      Code.expect(res.result.statusCode).to.equal(401);
      Code.expect(res.result.error).to.equal('Unauthorized');
      Code.expect(res.result.message).to.equal('User not found');
      done();
    });
  });

  lab.test('Create stream empty title', function (done) {
    var streamPayload = {
      title: '',
      description: 'this is the description of the stream'
    };
    Service.createNewUser(bob).then(function (user) {
      return user.userId;
    }).then(function(userId) {
      testAccount.userId = userId;

      Router.inject({method: 'POST', url: '/api/streams',
                     credentials: testAccount,
                     payload: streamPayload}, function (res) {
        Code.expect(res.result.statusCode).to.equal(400);
        Code.expect(res.result.error).to.equal('Bad Request');
        done();
      });
    });
  });


/*  lab.test('Get by streamId valid', function (done) {
    var streamInfo = {
      title: 'this is the title',
      description: 'this is the description of the stream',
      appInstance: 'generated'
    };

    Service.createNewUser(bob).then(function (user) {
      return user.userId;
    }).then(function(userId) {
      return Service.createNewStream(userId, streamInfo);
    }).then(function(stream) {
      Router.inject({method: 'GET', url: '/api/streams/' + stream.streamId,
                     credentials: testAccount}, function (res) {

        Code.expect(res.result.appInstance).to.equal('generated');
        Code.expect(res.result.title).to.equal('this is the title');
        done();
      });
    });
  });

  lab.test('Get by streamId invalid', function (done) {
    Router.inject({method: 'GET', url:'/api/streams/213',
                  credentials: testAccount}, function (res) {
      Code.expect(res.result.statusCode).to.equal(404);
      done();
    });
  });
*/
});

// when createNewStream() with misssing streamInfo, it will go through the then loop.

// so reject or resolve??
