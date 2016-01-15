var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var expect = Code.expect;

var Storage = rfr('app/models/Storage');
var UserService = rfr('app/services/UserService');
var Utility = rfr('app/util/Utility');

var logger = Utility.createLogger(__filename);

lab.experiment('UserService tests', function () {
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

  lab.beforeEach(function (done) {
    Storage.sequelize
      .sync({force: true})
      .then(function() {
        done();
      })
      .catch(function(err) {
        logger.error('Database Connection refused');
      });
  });

  lab.test('createNewUser missing particulars returns null', function(done) {
    UserService.createNewUser().then(function (result) {
      Code.expect(result).to.be.null();
      done();
    });
  });

  lab.test('createNewUser invalid fields returns null', function(done) {
    UserService.createNewUser({something: 'abc'}).then(function (result) {
      Code.expect(result).to.be.null();
      done();
    });
  });

  lab.test('createNewUser valid particulars', function(done) {
    UserService.createNewUser(bob).then(function (result) {
      Code.expect(result.username).to.equal(bob.username);
      Code.expect(result.password).to.equal(bob.password);
      done();
    });
  });

  lab.test('getUserByPlatform invalid platformType', function(done) {
    UserService.createNewUser(bob).then(function (result) {
      return UserService.getUserByPlatform('bogusmedia', result.platformId);
    }).then(function(user) {
      console.log(user);
      Code.expect(user).to.be.null();
      done();
    });
  });

  lab.test('getUserByPlatform invalid platformId', function(done) {
    UserService.createNewUser(bob).then(function (result) {
      return UserService.getUserByPlatform(result.platformType, 'invalidId');
    }).then(function(user) {
      Code.expect(user).to.be.null();
      done();
    });
  });

  lab.test('getUserByPlatform valid arguments', function(done) {
    UserService.createNewUser(bob).then(function (result) {
      return UserService.getUserByPlatform(result.platformType,
                                           result.platformId);
    }).then(function(user) {
      Code.expect(user.username).to.equal(bob.username);
      Code.expect(user.password).to.equal(bob.password);
      done();
    });
  });

  lab.test('getUserById valid arguments', function(done) {
    UserService.createNewUser(bob).then(function (result) {
      return UserService.getUserById(result.userId);
    }).then(function(user) {
      Code.expect(user.username).to.equal(bob.username);
      Code.expect(user.password).to.equal(bob.password);
      done();
    });
  });

  lab.test('getUserById invalid arguments', function(done) {
    return UserService.getUserById('123xyz')
    .then(function(user) {
      Code.expect(user).to.be.null();
      done();
    });
  });

  lab.test('updateParticulars invalid userId', function(done) {
    UserService.createNewUser(bob).then(function (result) {
      return UserService.updateParticulars('invalidUserId',
                                           result);
    }).then(function(user) {
      Code.expect(user).to.be.null();
      done();
    });
  });

  lab.test('updateParticulars missing particulars', function(done) {
    UserService.createNewUser(bob).then(function (result) {
      return UserService.updateParticulars(result.userId);
    }).then(function(user) {
      Code.expect(user).to.be.null();
      done();
    });
  });

  lab.test('updateParticulars valid', function(done) {
    UserService.createNewUser(bob).then(function (result) {
      return UserService.updateParticulars(result.userId,
          {email: 'newemail@lahlahland.candy'});
    }).then(function(user) {
      Code.expect(user.username).to.equal(bob.username,
          {email: 'newemail@lahlahland.candy'});
      done();
    });
  });
});
