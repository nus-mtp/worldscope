var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var expect = Code.expect;
var Promise = require('bluebird');

var Utility = rfr('app/util/Utility');
var CustomError = rfr('app/util/Error');
var logger = Utility.createLogger(__filename);

var Storage = rfr('app/models/Storage.js');
var TestUtils = rfr('test/TestUtils');

lab.experiment('Subscription Model Tests', function() {

  var user1 = {
    username: 'Noob Nie',
    alias: 'the noobie',
    email: 'noob@gmail.com',
    password: 'secretpass',
    accessToken: 'atoken',
    platformType: 'facebook',
    platformId: 'asdfadf-asdfasdf-asdfasdfaf-dfddf',
    description: 'noob has a noobie description'
  };

  var user2 = {
    username: 'Miss Pro',
    alias: 'Pro in the wonderland',
    email: 'pro@prototype.com',
    password: 'generated',
    accessToken: 'anaccesstoken',
    platformType: 'facebook',
    platformId: '45454545454',
    description: 'pro is too cool for description'
  };

  var user3 = {
    username: 'Mr Workaholic',
    alias: 'workaholic',
    email: 'workaholic@office.com',
    password: 'generated',
    accessToken: 'another accesstoken',
    platformType: 'facebook',
    platformId: '22222222222',
    description: 'workaholic is too busy for description'
  };

  lab.beforeEach({timeout: 10000}, function(done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('Create Subscription valid', function(done) {
    var userPromise1 = Storage.createUser(user1);
    var userPromise2 = Storage.createUser(user2);

    Promise.join(userPromise1, userPromise2,
      function(user1, user2) {
        Storage.createSubscription(user1.userId, user2.userId)
          .then(function(res) {
            expect(res.subscriber).to.equal(user1.userId);
            expect(res.subscribeTo).to.equal(user2.userId);
            done();
        });
      });
  });

  lab.test('Create Subscription invalid subscribeTo id', function(done) {
    var userPromise1 = Storage.createUser(user1);

    userPromise1.then(function(user1) {
      Storage.createSubscription(user1.userId,
                                 '3388ffff-aa00-1111a222-00000044888c')
        .then(function(res) {
          expect(res).to.be.an.instanceof(CustomError.NotFoundError);
          expect(res.message).to.be.equal('User not found');
          done();
        });
    });
  });

  lab.test('Create Subscription invalid duplicate', function(done) {
    var userPromise1 = Storage.createUser(user1);
    var userPromise2 = Storage.createUser(user2);

    Promise.join(userPromise1, userPromise2,
      function(user1, user2) {
        Storage.createSubscription(user1.userId, user2.userId)
          .then((subscription) =>
            Storage.createSubscription(subscription.subscriber,
                                       subscription.subscribeTo))
          .then(function(res) {
            expect(res).to.be.an.instanceof(Error);
            expect(res.message).to.be.equal('Duplicate Subscription');
            done();
        });
      });
  });

  lab.test('Create Subscription invalid self subscribe', function(done) {
    var userPromise1 = Storage.createUser(user1);

    userPromise1.then(function(user1) {
      Storage.createSubscription(user1.userId, user1.userId)
        .then(function(res) {
          console.log(res);
          expect(res).to.be.an.instanceof(CustomError.NotFoundError);
          expect(res.message).to.be.equal('User not found');
          done();
        });
    });
  });

  lab.test('Get Subscriptions valid', function(done) {
    var userPromise1 = Storage.createUser(user1);
    var userPromise2 = Storage.createUser(user2);
    var userPromise3 = Storage.createUser(user3);

    var createUsers = Promise.join(userPromise1, userPromise2, userPromise3,
      function(user1, user2, user3) {
        return Storage.createSubscription(user1.userId, user2.userId)
          .then(function(res) {
            return Storage.createSubscription(user1.userId, user3.userId);
          });
      });

    createUsers.then(function(subscription) {
      Storage.getSubscriptions(subscription.subscriber)
        .then(function(res) {
          expect(res[0].username).to.equal(user2.username);
          expect(res[1].username).to.equal(user3.username);
          expect(res).to.have.length(2);
          done();
        });
    });
  });

  lab.test('Get Subscriptions valid empty', function(done) {
    var userPromise1 = Storage.createUser(user1);
    var userPromise2 = Storage.createUser(user2);

    Promise.join(userPromise1, userPromise2,
      function(user1, user2) {
        Storage.createSubscription(user1.userId, user2.userId)
          .then(function(res) {
            Storage.getSubscriptions(user2.userId).then(function(res) {
              expect(res).to.have.length(0);
              done();
            })
        });
      });
  });

  lab.test('Get Subscriptions invalid userId', function(done) {
    Storage.getSubscriptions('3388ffff-aa00-1111a222-00000044888c')
      .then(function(res) {
        expect(res).to.be.an.instanceof(CustomError.NotFoundError);
        expect(res.message).to.be.equal('User not found');
        done();
      });
  });

  lab.test('Get Subscribers valid', function(done) {
    var userPromise1 = Storage.createUser(user1);
    var userPromise2 = Storage.createUser(user2);
    var userPromise3 = Storage.createUser(user3);

    var createUsers = Promise.join(userPromise1, userPromise2, userPromise3,
      function(user1, user2, user3) {
        return Storage.createSubscription(user2.userId, user3.userId)
          .then(function(res) {
            return Storage.createSubscription(user1.userId, user3.userId);
          });
      });

    createUsers.then(function(subscription) {
      Storage.getSubscribers(subscription.subscribeTo)
        .then(function(res) {
          expect(res).to.have.length(2);
          expect(res[0].username).to.equal(user2.username);
          expect(res[1].username).to.equal(user1.username);
          done();
        });
    });
  });

  lab.test('Get Subscribers valid empty', function(done) {
    var userPromise1 = Storage.createUser(user1);
    var userPromise2 = Storage.createUser(user2);

    Promise.join(userPromise1, userPromise2,
      function(user1, user2) {
        Storage.createSubscription(user1.userId, user2.userId)
          .then(function(res) {
            Storage.getSubscribers(user1.userId).then(function(res) {
              expect(res).to.have.length(0);
              done();
            })
        });
      });
  });

  lab.test('Get Subscribers invalid userId', function(done) {
    Storage.getSubscribers('3388ffff-aa00-1111a222-00000044888c')
      .then(function(res) {
        expect(res).to.be.an.instanceof(CustomError.NotFoundError);
        expect(res.message).to.be.equal('User not found');
        done();
      });
  });

});
