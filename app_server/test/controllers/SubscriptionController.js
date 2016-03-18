'use strict';
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

var carlos = {
  username: 'Carlos',
  alias: 'Carlos hehe',
  email: 'carlos@car.com',
  password: 'generated',
  accessToken: 'an accesstoken',
  platformType: 'facebook',
  platformId: '111112222',
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

  lab.test('Create subscription valid', function(done) {
    var userPromise1 = Service.createNewUser(bob);
    var userPromise2 = Service.createNewUser(alice);

    Promise.join(userPromise1, userPromise2,
      function(user1, user2) {
        testAccount.userId = user1.userId;
        Router.inject({method: 'POST',
                       url: '/api/subscriptions/' + user2.userId,
                       credentials: testAccount}, function(res) {
          Code.expect(res.statusCode).to.equal(200);
          done();
        });
      });
  });

  lab.test('Create subscription invalid subscribeTo Id', function(done) {
    var userPromise1 = Service.createNewUser(bob);

    userPromise1.then(function(user) {
      testAccount.userId = user.userId;
      Router.inject({method: 'POST',
                     url: '/api/subscriptions/' + TestUtils.invalidId,
                     credentials: testAccount}, function(res) {
        Code.expect(res.result.statusCode).to.equal(400);
        Code.expect(res.result.message).to.equal('User not found');
        done();
      });
    });
  });

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
            Code.expect(res.result.message)
              .to.equal('Duplicate Subscription');
            done();
          });
        });
      });
  });

  lab.test('Get subscriptions valid', function(done) {
    var userPromise1 = Service.createNewUser(bob);
    var userPromise2 = Service.createNewUser(alice);
    var userPromise3 = Service.createNewUser(carlos);

    // First subscription
    Promise.join(userPromise1, userPromise2, userPromise3,
      function(user1, user2, user3) {
        testAccount.userId = user1.userId;
        Router.inject({method: 'POST',
                        url: '/api/subscriptions/' + user2.userId,
                        credentials: testAccount}, (res) => {
          subscribePromise(user3);
        });
      });

    // Second Subscription
    function subscribePromise(user3) {
      Router.inject({method: 'POST',
                     url: '/api/subscriptions/' + user3.userId,
                     credentials: testAccount}, (res) => {
        querySubscriptions();
      });
    }

    function querySubscriptions() {
      Router.inject({method: 'GET',
                     url: '/api/subscriptions',
                     credentials: testAccount}, function(res) {
        Code.expect(res.result).to.have.length(2);
        Code.expect(res.result[0].username).to.equal(alice.username);
        Code.expect(res.result[1].username).to.equal(carlos.username);
        done();
      });
    }
  });

  lab.test('Get subscriptions valid empty', function(done) {
    var userPromise1 = Service.createNewUser(bob);

    userPromise1.then(function(user) {
      testAccount.userId = user.userId;
      Router.inject({method: 'GET',
                     url: '/api/subscriptions',
                     credentials: testAccount}, function(res) {
        Code.expect(res.result).deep.equal([]);
        done();
      });
    });
  });

  lab.test('Get subscriptions invalid userId', function(done) {
    testAccount.userId = TestUtils.invalidId;

    Router.inject({method: 'GET',
                   url: '/api/subscriptions',
                   credentials: testAccount}, function(res) {
      Code.expect(res.result.statusCode).to.equal(400);
      Code.expect(res.result.message).to.equal('User not found');
      done();
    });
  });

  lab.test('Get number of subscriptions valid', function(done) {
    var userPromise1 = Service.createNewUser(bob);
    var userPromise2 = Service.createNewUser(alice);
    var userPromise3 = Service.createNewUser(carlos);

    // First subscription
    Promise.join(userPromise1, userPromise2, userPromise3,
      function(user1, user2, user3) {
        testAccount.userId = user1.userId;
        Router.inject({method: 'POST',
                        url: '/api/subscriptions/' + user2.userId,
                        credentials: testAccount}, (res) => {
          subscribePromise(user3);
        });
      });

    // Second Subscription
    function subscribePromise(user3) {
      Router.inject({method: 'POST',
                     url: '/api/subscriptions/' + user3.userId,
                     credentials: testAccount}, (res) => {
        querySubscriptions();
      });
    }

    function querySubscriptions() {
      Router.inject({method: 'GET',
                     url: '/api/subscriptions/statistics',
                     credentials: testAccount}, function(res) {
        Code.expect(res.result).to.be.equal(2);
        done();
      });
    }
  });

  lab.test('Get number of subscriptions valid zero', function(done) {
    var userPromise1 = Service.createNewUser(bob);

    userPromise1.then((user) => {
      testAccount.userId = user.userId;
      querySubscriptions();
    });

    function querySubscriptions() {
      Router.inject({method: 'GET',
                     url: '/api/subscriptions/statistics',
                     credentials: testAccount}, function(res) {
        Code.expect(res.result).to.be.equal(0);
        done();
      });
    }
  });

  lab.test('Get number of subscriptions unauthorized', function(done) {
    var userPromise1 = Service.createNewUser(bob);

    userPromise1.then((user) => {
      testAccount.userId = user.userId;
      querySubscriptions();
    });

    function querySubscriptions() {
      Router.inject({method: 'GET',
                     url: '/api/subscriptions/statistics'}, function(res) {
        Code.expect(res.result.statusCode).to.be.equal(401);
        done();
      });
    }

  });

  lab.test('Get subscribers valid', function(done) {
    var userPromise1 = Service.createNewUser(bob);
    var userPromise2 = Service.createNewUser(alice);
    var userPromise3 = Service.createNewUser(carlos);

    // First subscription
    Promise.join(userPromise1, userPromise2, userPromise3,
      function(user1, user2, user3) {
        testAccount.userId = user1.userId;
        Router.inject({method: 'POST',
                        url: '/api/subscriptions/' + user2.userId,
                        credentials: testAccount}, (res) => {
          subscribePromise(user2, user3);
        });
      });

    // Second subscription
    function subscribePromise(user2, user3) {
      testAccount.userId = user3.userId;
      Router.inject({method: 'POST',
                     url: '/api/subscriptions/' + user2.userId,
                     credentials: testAccount}, (res) => {
        querySubscribers(user2);
      });
    }

    function querySubscribers(user2) {
      Router.inject({method: 'GET',
                     url: '/api/subscriptions/subscribers/' + user2.userId,
                     credentials: testAccount}, function(res) {
        Code.expect(res.result).to.have.length(2);
        Code.expect(res.result[0].username).to.equal(bob.username);
        Code.expect(res.result[1].username).to.equal(carlos.username);
        done();
      });
    }
  });

  lab.test('Get self subscribers valid', function(done) {
    var userPromise1 = Service.createNewUser(bob);
    var userPromise2 = Service.createNewUser(alice);
    var userPromise3 = Service.createNewUser(carlos);

    // First subscription
    Promise.join(userPromise1, userPromise2, userPromise3,
      (user1, user2, user3) => {
        testAccount.userId = user1.userId;
        Router.inject({method: 'POST',
                        url: '/api/subscriptions/' + user2.userId,
                        credentials: testAccount}, (res) => {
          subscribePromise(user2, user3);
        });
      });

    // Second subscription
    function subscribePromise(user2, user3) {
      testAccount.userId = user3.userId;
      Router.inject({method: 'POST',
                     url: '/api/subscriptions/' + user2.userId,
                     credentials: testAccount}, (res) => {
        querySubscribers(user2);
      });
    }

    function querySubscribers(user2) {
      let credentials = TestUtils.copyObj(user2,
                                          ['userId', 'username', 'password']);
      credentials.scope = Authenticator.SCOPE.USER;
      Router.inject({method: 'GET',
                     url: '/api/subscriptions/subscribers/me',
                     credentials: credentials}, (res) => {
        Code.expect(res.result).to.have.length(2);
        Code.expect(res.result[0].username).to.equal(bob.username);
        Code.expect(res.result[1].username).to.equal(carlos.username);
        done();
      });
    }
  });

  lab.test('Get subscribers valid empty', function(done) {
    var userPromise1 = Service.createNewUser(bob);

    userPromise1.then(function(user) {
      testAccount.userId = user.userId;
      Router.inject({method: 'GET',
                     url: '/api/subscriptions/subscribers/' + user.userId,
                     credentials: testAccount}, function(res) {
        Code.expect(res.result).deep.equal([]);
        done();
      });
    });
  });

  lab.test('Get subscribers invalid userId', function(done) {
    Router.inject({method: 'GET',
                   url: '/api/subscriptions/subscribers/' + TestUtils.invalidId,
                   credentials: testAccount}, function(res) {
      Code.expect(res.result.statusCode).to.equal(400);
      Code.expect(res.result.message).to.equal('User not found');
      done();
    });
  });

  lab.test('Delete subscription valid', function(done) {
    var userPromise1 = Service.createNewUser(bob);
    var userPromise2 = Service.createNewUser(alice);

    Promise.join(userPromise1, userPromise2,
      function(user1, user2) {
        testAccount.userId = user1.userId;
        Router.inject({method: 'POST',
                        url: '/api/subscriptions/' + user2.userId,
                        credentials: testAccount}, (res) => {
          deleteSubscription(user2);
        });
      });

    function deleteSubscription(user2) {
      Router.inject({method: 'DELETE',
                     url: '/api/subscriptions/' + user2.userId,
                     credentials: testAccount}, function(res) {

        Code.expect(res.result.status).to.equal('OK');
        done();
      });
    }

  });

  lab.test('Get number of subscribers valid', function(done) {
    var userPromise1 = Service.createNewUser(bob);
    var userPromise2 = Service.createNewUser(alice);
    var userPromise3 = Service.createNewUser(carlos);

    // First subscription
    Promise.join(userPromise1, userPromise2, userPromise3,
      function(user1, user2, user3) {
        testAccount.userId = user1.userId;
        Router.inject({method: 'POST',
                        url: '/api/subscriptions/' + user2.userId,
                        credentials: testAccount}, (res) => {
          subscribePromise(user3);
        });
      });

    // Second Subscription
    function subscribePromise(user3) {
      Router.inject({method: 'POST',
                     url: '/api/subscriptions/' + user3.userId,
                     credentials: testAccount}, (res) => {
        querySubscribers(user3);
      });
    }

    function querySubscribers(user3) {
      Router.inject({method: 'GET',
                     url: '/api/subscriptions/subscribers/' +
                           user3.userId + '/statistics',
                     credentials: testAccount}, function(res) {
        Code.expect(res.result).to.be.equal(1);
        done();
      });
    }
  });

  lab.test('Get number of subscribers valid zero', function(done) {
    var userPromise1 = Service.createNewUser(bob);

    function querySubscribers(user) {
      Router.inject({method: 'GET',
                     url: '/api/subscriptions/subscribers/' +
                     user.userId + '/statistics',
                     credentials: testAccount}, function(res) {
        Code.expect(res.result).to.be.equal(0);
        done();
      });
    }

    userPromise1.then((user) => {
      testAccount.userId = user.userId;
      querySubscribers(user);
    });

  });

  lab.test('Get number of subscribers unauthorized', function(done) {
    var userPromise1 = Service.createNewUser(bob);

    userPromise1.then((user) => {
      testAccount.userId = user.userId;
      querySubscribers(user);
    });

    function querySubscribers(user) {
      Router.inject({method: 'GET',
                     url: '/api/subscriptions/subscribers/' +
                     user.userId + '/statistics'}, function(res) {
        Code.expect(res.result.statusCode).to.be.equal(401);
        done();
      });
    }
  });

  lab.test('Delete subscription non-existent subscription', function(done) {
    var userPromise1 = Service.createNewUser(bob);
    var userPromise2 = Service.createNewUser(alice);

    function deleteSubscription(user2) {
      Router.inject({method: 'DELETE',
                     url: '/api/subscriptions/' + user2.userId,
                     credentials: testAccount}, function(res) {

        Code.expect(res.result.status).to.equal('Unsuccessful');
        done();
      });
    }

    Promise.join(userPromise1, userPromise2,
      function(user1, user2) {
        testAccount.userId = user1.userId;
        deleteSubscription(user2);

      });
  });

  lab.test('Delete subscription invalid user', function(done) {
    var userPromise1 = Service.createNewUser(bob);

    userPromise1.then(function(user) {
      Router.inject({method: 'DELETE',
                     url: '/api/subscriptions/' + TestUtils.invalidId,
                     credentials: testAccount}, function(res) {

        Code.expect(res.result.status).to.equal('Unsuccessful');
        done();
      });
    });
  });

  lab.test('Delete subscriber valid', function(done) {
    var userPromise1 = Service.createNewUser(bob);
    var userPromise2 = Service.createNewUser(alice);

    function deleteSubscription(user1, user2) {
      testAccount.userId = user2.userId;
      Router.inject({method: 'DELETE',
                     url: '/api/subscriptions/subscribers/' + user1.userId,
                     credentials: testAccount}, function(res) {

        Code.expect(res.result.status).to.equal('OK');
        done();
      });
    }

    Promise.join(userPromise1, userPromise2,
      function(user1, user2) {
        testAccount.userId = user1.userId;
        Router.inject({method: 'POST',
                        url: '/api/subscriptions/' + user2.userId,
                        credentials: testAccount}, (res) => {
          deleteSubscription(user1, user2);
        });
      });
  });

  lab.test('Delete subscriber non-existent subscription', function(done) {
    var userPromise1 = Service.createNewUser(bob);
    var userPromise2 = Service.createNewUser(alice);

    Promise.join(userPromise1, userPromise2,
      function(user1, user2) {
        testAccount.userId = user1.userId;
        deleteSubscription(user2);

      });

    function deleteSubscription(user2) {
      Router.inject({method: 'DELETE',
                     url: '/api/subscriptions/subscribers/' + user2.userId,
                     credentials: testAccount}, function(res) {

        Code.expect(res.result.status).to.equal('Unsuccessful');
        done();
      });
    }
  });

  lab.test('Delete subscriber invalid user', function(done) {
    var userPromise1 = Service.createNewUser(bob);

    userPromise1.then(function(user) {
      Router.inject({method: 'DELETE',
                     url: '/api/subscriptions/subscribers/' +
                     TestUtils.invalidId,
                     credentials: testAccount}, function(res) {

        Code.expect(res.result.status).to.equal('Unsuccessful');
        done();
      });
    });
  });

  lab.test('Delete subscriber invalid authorised', function(done) {
    var userPromise1 = Service.createNewUser(bob);
    var userPromise2 = Service.createNewUser(alice);

    Promise.join(userPromise1, userPromise2,
      function(user1, user2) {
        testAccount.userId = user1.userId;
        Router.inject({method: 'POST',
                        url: '/api/subscriptions/' + user2.userId,
                        credentials: testAccount}, (res) => {
          deleteSubscription(user1, user2);
        });
      });

    function deleteSubscription(user1, user2) {
      Router.inject({method: 'DELETE',
                     url: '/api/subscriptions/subscribers/' + user1.userId,
                     credentials: testAccount}, function(res) {

        Code.expect(res.result.status).to.equal('Unsuccessful');
        done();
      });
    }
  });
});
