var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var expect = Code.expect;

var Storage = rfr('app/models/Storage');
var Service = rfr('app/services/Service');
var CustomError = rfr('app/util/Error');
var TestUtils = rfr('test/TestUtils');

lab.experiment('UserService Tests', function () {
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
      return Service.getUserByPlatform(result.platformType, 'invalidId');
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
      return Service.updateUser('3388ffff-aa00-1111a222-00000044888c',
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
