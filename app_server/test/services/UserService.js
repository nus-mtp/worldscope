var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var expect = Code.expect;
var Promise = require('bluebird');

var Router = rfr('app/Router');
var Storage = rfr('app/models/Storage');
var Service = rfr('app/services/Service');
var CustomError = rfr('app/util/Error');
var TestUtils = rfr('test/TestUtils');

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
  title: 'this is a title from user service',
  description: 'arbitrary description',
  appInstance: '123-123-123-123'
};

lab.experiment('UserService Tests', function () {

  lab.beforeEach({timeout: 10000}, function (done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('createNewUser missing particulars returns null', function(done) {
    Service.createNewUser().then(function (result) {
      Code.expect(result).to.be.null();
      done();
    });
  });

  lab.test('createNewUser invalid fields returns null', function(done) {
    Service.createNewUser({something: 'abc'}).then(function (result) {
      Code.expect(result).to.be.null();
      done();
    });
  });

  lab.test('createNewUser valid particulars', function(done) {
    Service.createNewUser(bob).then(function (result) {
      Code.expect(result.username).to.equal(bob.username);
      Code.expect(result.password).to.equal(bob.password);
      done();
    });
  });

  lab.test('getUserByPlatform invalid platformType', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.getUserByPlatform('bogusmedia', result.platformId);
    }).then(function(user) {
      Code.expect(user).to.be.null();
      done();
    });
  });

  lab.test('getUserByPlatform invalid platformId', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.getUserByPlatform(result.platformType,
                                       TestUtils.invalidId);
    }).then(function(user) {
      Code.expect(user).to.be.null();
      done();
    });
  });

  lab.test('getUserByPlatform valid arguments', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.getUserByPlatform(result.platformType,
                                       result.platformId);
    }).then(function(user) {
      Code.expect(user.username).to.equal(bob.username);
      Code.expect(user.password).to.equal(bob.password);
      done();
    });
  });

  lab.test('getUserById valid arguments', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.getUserById(result.userId);
    }).then(function(user) {
      Code.expect(user.username).to.equal(bob.username);
      Code.expect(user.password).to.equal(bob.password);
      done();
    });
  });

  lab.test('getUserById invalid arguments', function(done) {
    return Service.getUserById('123xyz')
    .then(function(user) {
      Code.expect(user).to.be.null();
      done();
    });
  });

  lab.test('getListOfUsers valid empty', function(done) {
    var filters = {
      order: 'desc'
    };

    Service.getListOfUsers(filters).then(function(result) {
      Code.expect(result).to.have.length(0);
      done();
    });
  });

  lab.test('getListOfUsers valid desc', function(done) {
    var filters = {
      order: 'desc'
    };

    Service.createNewUser(bob).then(() => Service.createNewUser(alice))
      .then(function(user) {
        return Service.getListOfUsers(filters).then(function(result) {
          Code.expect(result[0].username).to.equal(bob.username);
          Code.expect(result[1].username).to.equal(alice.username);
          done();
        });
      });
  });

  lab.test('getListOfUsers invalid order param', function(done) {
    var filters = {
      order: '<script>try a javascript hack</script>'
    };

    Service.createNewUser(bob).then(() => Service.createNewUser(alice))
      .then(function(user) {
        return Service.getListOfUsers(filters).then(function(result) {
          Code.expect(result).to.be.null();
          done();
        });
      });
  });

  lab.test('updateUser invalid userId', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.updateUser(TestUtils.invalidId,
                                {description: 'blahblah'});
    }).then(function(user) {
      Code.expect(user).to.be.null();
      done();
    });
  });

  lab.test('updateUser invalid missing email', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.updateUser(result.userId,
                                {email: ''});
    }).then(function(user) {
      Code.expect(user).to.be.null();
      done();
    });
  });

  lab.test('updateUser valid', function(done) {
    var updates = {
      email: 'newemail@lahlahland.candy',
      alias: 'Taeng',
      description: 'wooohoo! I am fun!'
    };

    Service.createNewUser(bob).then(
      (result) => Service.updateUser(result.userId, updates)
    ).then(function(user) {
      Code.expect(TestUtils.isEqualOnProperties(updates, user)).to.be.true();
      done();
    });
  });

  lab.test('Get number of users', function(done) {
    Service.createNewUser(bob).then(() => Service.createNewUser(alice))
      .then(() => Service.getNumberOfUsers())
      .then(function(number) {
        Code.expect(number).to.equal(2);
        done();
      });
  });

});

lab.experiment('UserService Tests for View', function () {

  lab.beforeEach({timeout: 10000}, function (done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('Create View valid', function(done) {
    var userPromise = Service.createNewUser(bob);

    var viewPromise = userPromise
      .then((user) => Service.createNewStream(user.userId, stream))
      .then((stream) => Service.createView(stream.owner, stream.streamId));

    Promise.join(userPromise, viewPromise, function(user, view) {
      Code.expect(view.userId).to.equal(user.userId);
      done();
    });
  });

  lab.test('Create View valid repeated user/stream', function(done) {
    Service.createNewUser(bob)
      .then((user) => {
        Service.createNewStream(user.userId, stream)
          .then((stream) => Service.createView(stream.owner, stream.streamId))
          .then((view) => Service.createView(view.userId, view.streamId))
          .then((view) => {
            Code.expect(view.userId).to.equal(user.userId);
            done();
          });
      });
  });

  lab.test('Create View invalid user', function(done) {
    Service.createNewUser(bob)
    .then((user) => Service.createNewStream(user.userId, stream))
    .then((stream) => Service.createView(TestUtils.invalidId, stream.streamId))
    .then(function(res) {
      Code.expect(res).to.be.an.instanceof(CustomError.NotFoundError);
      done();
    });
  });

  lab.test('Create View invalid stream', function(done) {
    Service.createNewUser(bob)
      .then((user) => Service.createNewStream(user.userId, stream))
      .then((stream) =>
        Service.createView(stream.owner, TestUtils.invalidId))
      .then(function(res) {
        Code.expect(res).to.be.an.instanceof(CustomError.NotFoundError);
        done();
      });
  });

  lab.test('Update Stream invalid fields', function(done) {
    var updates = {
      randomField: 'new title'
    };

    Service.createNewUser(bob).then(function(user) {
      return Service.createNewStream(user.userId, stream);
    }).then(function(stream) {
      return Service.updateStream(stream.streamId, updates);
    }).then(function(result) {
      Code.expect(result).to.be.an.instanceof(CustomError.InvalidColumnError);
      done();
    });
  });

  lab.test('Get list of users watching a particular stream valid',
    function(done) {

      Service.createNewUser(bob).then(function(user) {
        return Service.createNewStream(user.userId, stream);
      }).then(function(stream) {
        return Service.createView(stream.owner, stream.streamId);
      }).then(function(view) {
        return Service.getListOfUsersViewingStream(view.streamId);
      }).then(function(result) {
        Code.expect(result).to.have.length(1);
        Code.expect(result[0].username).to.equal(bob.username);
        done();
      });
    });

  lab.test('Get list of users watching a particular stream invalid',
    function(done) {

      Service.getListOfUsersViewingStream(TestUtils.invalidId)
        .then(function(result) {
          Code.expect(result).to.be.null();
          done();
        });
    });

  lab.test('Get number of users who have watched a stream valid',
    function(done) {

      Service.createNewUser(bob).then(function(user) {
        return Service.createNewStream(user.userId, stream);
      }).then(function(stream) {
        return Service.createView(stream.owner, stream.streamId);
      }).then(function(view) {
        return Service.getTotalNumberOfUsersViewedStream(view.streamId);
      }).then(function(result) {
        Code.expect(result).to.equal(1);
        done();
      });
    });

  lab.test('Get number of users who have watched a stream invalid',
    function(done) {
      Service.getTotalNumberOfUsersViewedStream(TestUtils.invalidId)
        .then(function(result) {
          Code.expect(result).to.equal(0);
          done();
        });
    });
});

lab.experiment('UserService Tests for Subscriptions', function () {

  lab.beforeEach({timeout: 10000}, function (done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('Create Subscription valid', function(done) {
    var userPromise1 = Service.createNewUser(alice);
    var userPromise2 = Service.createNewUser(bob);

    Promise.join(userPromise1, userPromise2,
      function(user1, user2) {
        Service.createSubscription(user1.userId, user2.userId)
          .then(function(res) {
            expect(res.subscriber).to.equal(user1.userId);
            expect(res.subscribeTo).to.equal(user2.userId);
            done();
          });
      });
  });

  lab.test('Create Subscription invalid subscribeTo', function(done) {
    var userPromise1 = Service.createNewUser(alice);

    userPromise1.then(function(user1) {
      Service.createSubscription(user1.userId, TestUtils.invalidId)
        .then(function(res) {
          expect(res).to.be.an.instanceof(CustomError.NotFoundError);
          expect(res.message)
            .to.be.equal('User not found');
          done();
        });
    });
  });

  lab.test('Create Subscription invalid self subscribe', function(done) {
    var userPromise1 = Service.createNewUser(alice);

    userPromise1.then(function(user1) {
      Service.createSubscription(user1.userId, user1.userId)
        .then(function(res) {
          expect(res).to.be.an.instanceof(CustomError.NotFoundError);
          expect(res.message).to.be.equal('User not found');
          done();
        });
    });
  });

  lab.test('Create Subscription invalid duplicate', function(done) {
    var userPromise1 = Service.createNewUser(alice);
    var userPromise2 = Service.createNewUser(bob);

    Promise.join(userPromise1, userPromise2,
      function(user1, user2) {
        Service.createSubscription(user1.userId, user2.userId)
          .then((subscription) =>
            Service.createSubscription(subscription.subscriber,
                                       subscription.subscribeTo))
          .then(function(res) {
            expect(res).to.be.an.instanceof(Error);
            expect(res.message).to.be.equal('Duplicate Subscription');
            done();
          });
      });
  });

  lab.test('Get Subscriptions valid', function(done) {
    var userPromise1 = Service.createNewUser(alice);
    var userPromise2 = Service.createNewUser(bob);
    var userPromise3 = Service.createNewUser(carlos);

    Promise.join(userPromise1, userPromise2, userPromise3,
      function(user1, user2, user3) {
        Service.createSubscription(user1.userId, user2.userId)
          .then(() => Service.createSubscription(user1.userId, user3.userId))
          .then(function(subscription) {
            Service.getSubscriptions(subscription.subscriber)
              .then(function(res) {
                expect(res).to.have.length(2);
                expect(res[0].username).to.equal(bob.username);
                expect(res[1].username).to.equal(carlos.username);
                done();
              });
          });
      });
  });

  lab.test('Get Subscriptions invalid userId', function(done) {
    Service.getSubscriptions(TestUtils.invalidId)
      .then(function(res) {
        expect(res).to.be.an.instanceof(CustomError.NotFoundError);
        expect(res.message).to.be.equal('User not found');
        done();
      });
  });

  lab.test('Get Number of Subscriptions valid', function(done) {
    var userPromise1 = Service.createNewUser(alice);
    var userPromise2 = Service.createNewUser(bob);
    var userPromise3 = Service.createNewUser(carlos);

    var setUpRelations =
      Promise.join(userPromise1, userPromise2, userPromise3,
        function(user1, user2, user3) {
          return Service.createSubscription(user1.userId, user2.userId)
            .then(() => Service.createSubscription(user1.userId, user3.userId));
        });

    setUpRelations.then(function(subscription) {
      Service.getNumberOfSubscriptions(subscription.subscriber)
        .then((res) => {
          expect(res).to.equal(2);
          done();
        });
    });
  });

  lab.test('Get Number of Subscriptions valid zero', function(done) {
    var userPromise1 = Service.createNewUser(alice);

    userPromise1.then((user) =>
      Service.getNumberOfSubscriptions(user.userId))
        .then((res) => {
          expect(res).to.equal(0);
          done();
        });
  });

  lab.test('Get Number of Subscriptions invalid', function(done) {
    Service.getNumberOfSubscriptions(TestUtils.invalidId)
      .then((res) => {
        expect(res).to.be.an.instanceof(CustomError.NotFoundError);
        done();
      });
  });

  lab.test('Get Subscribers valid', function(done) {
    var userPromise1 = Service.createNewUser(alice);
    var userPromise2 = Service.createNewUser(bob);
    var userPromise3 = Service.createNewUser(carlos);

    Promise.join(userPromise1, userPromise2, userPromise3,
      function(user1, user2, user3) {
        Service.createSubscription(user1.userId, user3.userId)
          .then(() => Service.createSubscription(user3.userId, user2.userId))
          .then(() => Service.createSubscription(user2.userId, user3.userId))
          .then((subscription) => {
            Service.getSubscribers(subscription.subscribeTo)
              .then((res) => {
                expect(res).to.have.length(2);
                expect(res[0].username).to.equal(alice.username);
                expect(res[0].isSubscribed).to.be.false();
                expect(res[1].username).to.equal(bob.username);
                expect(res[1].isSubscribed).to.be.true();
                done();
              });
          });
      });
  });

  lab.test('Get Subscribers invalid userId', function(done) {
    Service.getSubscribers(TestUtils.invalidId)
      .then(function(res) {
        expect(res).to.be.an.instanceof(CustomError.NotFoundError);
        expect(res.message).to.be.equal('User not found');
        done();
      });
  });

  lab.test('Get Number of Subscribers valid', function(done) {
    var userPromise1 = Service.createNewUser(alice);
    var userPromise2 = Service.createNewUser(bob);
    var userPromise3 = Service.createNewUser(carlos);

    var setUpRelations =
      Promise.join(userPromise1, userPromise2, userPromise3,
        function(user1, user2, user3) {
          return Service.createSubscription(user1.userId, user2.userId)
            .then(() => Service.createSubscription(user1.userId, user3.userId));
        });

    setUpRelations.then(function(subscription) {
      Service.getNumberOfSubscribers(subscription.subscribeTo)
        .then((res) => {
          expect(res).to.equal(1);
          done();
        });
    });
  });

  lab.test('Get Number of Subscribers valid zero', function(done) {
    var userPromise1 = Service.createNewUser(alice);

    userPromise1.then((user) =>
      Service.getNumberOfSubscribers(user.userId))
        .then((res) => {
          expect(res).to.equal(0);
          done();
        });
  });

  lab.test('Get Number of Subscribers invalid', function(done) {
    Service.getNumberOfSubscribers(TestUtils.invalidId)
      .then((res) => {
        expect(res).to.be.an.instanceof(CustomError.NotFoundError);
        done();
      });
  });

  lab.test('Delete Subscription valid', function(done) {
    var userPromise1 = Service.createNewUser(alice);
    var userPromise2 = Service.createNewUser(bob);

    function deleteSubscription(user1, user2) {
      Service.deleteSubscription(user1.userId, user2.userId)
        .then(function(res) {
          expect(res).to.be.true();
          done();
        });
    }

    Promise.join(userPromise1, userPromise2,
      function(user1, user2) {
        Service.createSubscription(user1.userId, user2.userId)
          .then((res) => deleteSubscription(user1, user2));
      });
  });

  lab.test('Delete Subscription non-existent subscription', function(done) {
    var userPromise1 = Service.createNewUser(alice);
    var userPromise2 = Service.createNewUser(bob);

    Promise.join(userPromise1, userPromise2,
      function(user1, user2) {
        Service.deleteSubscription(user1.userId, user2.userId)
          .then(function(res) {
            expect(res).to.be.an.instanceof(CustomError.NotFoundError);
            expect(res.message).to.equal('Subscription not found');
            done();
          });
      });
  });

  lab.test('Delete Subscription invalid user', function(done) {
    var userPromise1 = Service.createNewUser(alice);

    userPromise1.then(function(user) {
      Service.deleteSubscription(TestUtils.invalidId, user.userId)
        .then(function(res) {
          expect(res).to.be.an.instanceof(CustomError.NotFoundError);
          expect(res.message).to.equal('User not found');
          done();
        });
    });
  });

  lab.test('Delete Subscription invalid user to subscribe', function(done) {
    var userPromise1 = Service.createNewUser(alice);

    userPromise1.then(function(user) {
      Service.deleteSubscription(user.userId, TestUtils.invalidId)
        .then(function(res) {
          expect(res).to.be.an.instanceof(Error);
          expect(res.message).to.equal('User not found');
          done();
        });
    });
  });

});

lab.experiment('UserService Tests for Comments', function () {

  var comment1 = {
    content: 'How do I live without you',
    createdAt: 1457431895187
  };

  var comment2 = {
    content: 'How do I breathe without you',
    createdAt: 1457431905187
  };

  var comment3 = {
    content: 'How do I ever',
    createdAt: 1457431915187
  };

  lab.beforeEach({timeout: 10000}, function (done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('Create Comment valid', function(done) {
    var userPromise = Service.createNewUser(alice);
    var streamPromise = userPromise
      .then((user) => Service.createNewStream(user.userId, stream));

    Promise.join(userPromise, streamPromise,
      function(user, stream) {
        Service.createComment(user.userId, stream.streamId, comment1)
          .then(function(res) {
            expect(res.content).to.equal(comment1.content);
            expect(res.userId).to.equal(user.userId);
            expect(res.streamId).to.equal(stream.streamId);
            done();
          });
      });
  });

  lab.test('Create Comment invalid empty string', function(done) {
    var userPromise = Service.createNewUser(alice);
    var streamPromise = userPromise
      .then((user) => Service.createNewStream(user.userId, stream));

    Promise.join(userPromise, streamPromise,
      function(user, stream) {
        Service.createComment(user.userId, stream.streamId, {content: ''})
          .then(function(err) {
            expect(err).to.be.an.instanceof(Error);
            done();
          });
      });
  });

  lab.test('Create Comment valid duplicate', function(done) {
    var userPromise = Service.createNewUser(alice);
    var streamPromise = userPromise
      .then((user) => Service.createNewStream(user.userId, stream));

    Promise.join(userPromise, streamPromise,
      function(user, stream) {
        Service.createComment(user.userId, stream.streamId, comment1)
          .then(() => Service.createComment(user.userId, stream.streamId,
                                            comment1))
          .then((res) => {
            expect(res.content).to.equal(comment1.content);
            expect(res.userId).to.equal(user.userId);
            expect(res.streamId).to.equal(stream.streamId);
            done();
          });
      });
  });

  lab.test('Get list of comments', function(done) {
    var userPromise = Service.createNewUser(alice);
    var streamPromise = userPromise
      .then((user) => Service.createNewStream(user.userId, stream));

    Promise.join(userPromise, streamPromise,
      function(user, stream) {
        Service.createComment(user.userId, stream.streamId, comment1)
          .then(() => Service.createComment(user.userId, stream.streamId,
                                            comment2))
          .then(() => Service.createComment(user.userId, stream.streamId,
                                            comment3))
          .then(() => Service.getListOfCommentsForStream(stream.streamId))
          .then((res) => {
            expect(res).to.have.length(3);
            done();
          });
      });
  });

  lab.test('Get list of comments non-existing stream', function(done) {
    var userPromise = Service.createNewUser(alice);
    var streamPromise = userPromise
      .then((user) => Service.createNewStream(user.userId, stream));

    Promise.join(userPromise, streamPromise,
      function(user, stream) {
        Service.createComment(user.userId, stream.streamId, comment1)
          .then(() => Service.getListOfCommentsForStream(TestUtils.invalidId))
          .then((res) => {
            expect(res).to.be.an.instanceof(CustomError.NotFoundError);
            done();
          });
      });
  });
});

