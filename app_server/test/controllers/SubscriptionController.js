var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var util = require('util');
var Promise = require('bluebird');

var Authenticator = rfr('app/policies/Authenticator');
var Utility = rfr('app/util/Utility');
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

var stream = {
  title: 'this is the title',
  description: 'this is the description of the stream',
  appInstance: '123-123'
};

lab.experiment('SubscriptionController Tests', function() {

  lab.beforeEach({timeout: 10000}, function(done) {
    TestUtils.resetDatabase(done);
  });

/*  lab.test('Create subscription valid', function(done) {
    var userPromise1 = Service.createNewUser(bob);
    var userPromise2 = Service.createNewUser(alice);

    Promise.join(userPromise1, userPromise2,
      function(user1, user2) {
        testAccount.userId = user1.userId;
         Router.inject({method: 'POST',
                        url: '/api/subscriptions/' + user2.userId,
                        credentials: testAccount}, function(res) {
          Code.expect(res.statusCode).to.equal(200);
          Code.expect(res.result.status).to.equal('OK');
          done();
        });
      })
  });

  lab.test('Create subscription invalid subscribeTo Id', function(done) {
    var userPromise1 = Service.createNewUser(bob);

    userPromise1.then(function(user) {
      testAccount.userId = user.userId;
       Router.inject({method: 'POST',
                      url: '/api/subscriptions/' +
                      '3388ffff-aa00-1111a222-00000044888c',
                      credentials: testAccount}, function(res) {
        Code.expect(res.result.statusCode).to.equal(400);
        Code.expect(res.result.message).to.equal('User not found');
        done();
      });
    });
  });*/

  lab.test('Create subscription invalid duplicate', function(done) {
    var userPromise1 = Service.createNewUser(bob);
    var userPromise2 = Service.createNewUser(alice);

    Promise.join(userPromise1, userPromise2,
      function(user1, user2) {
        testAccount.userId = user1.userId;
         Router.inject({method: 'POST',
                        url: '/api/subscriptions/' + user2.userId,
                        credentials: testAccount}, function(res) {
            // Duplicate Request
            Router.inject({method: 'POST',
                           url: '/api/subscriptions/' + user2.userId,
                           credentials: testAccount}, function(res) {
                Code.expect(res.result.statusCode).to.equal(400);
                Code.expect(res.result.message).
                  to.equal('Duplicate Subscription');
                done();
            });
          });
      });
  });
});
