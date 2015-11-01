var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var expect = Code.expect;

var Storage = rfr('app/models/Storage');
var Service = rfr('app/services/Service');

lab.experiment('Service tests', function () {
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
        console.log('Database Connection refused');
      });
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
      console.log(user);
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

  lab.test('updateUserParticulars invalid userId', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.updateUserParticulars('invalidUserId',
                                           result);
    }).then(function(status) {
      Code.expect(status).to.be.false();
      done();
    });
  });

  lab.test('updateUserParticulars missing particulars', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.updateUserParticulars(result.userId);
    }).then(function(status) {
      Code.expect(status).to.be.false();
      done();
    });
  });

  lab.test('updateUserParticulars valid', function(done) {
    Service.createNewUser(bob).then(function (result) {
      var newParticular = result;
      newParticular.email = 'newemail';
      return Service.updateUserParticulars(result.userId, newParticular);
    }).then(function(status) {
      Code.expect(status).to.be.true();
      done();
    });
  });
});
