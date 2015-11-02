var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var expect = Code.expect;

var Utility = rfr('app/util/Utility');
var logger = Utility.createLogger(__filename);

var Storage = rfr('app/models/Storage.js');

lab.experiment('User Model Tests', function () {

  var user = {
    username: 'Jane Tan',
    alias: 'Jane the kid',
    email: 'jane@gmail.com',
    password: 'secretpass',
    accessToken: 'atoken',
    platformType: 'facebook',
    platformId: 'asdfadf-asdfasdf-asdfasdfaf-dfddf',
    description: 'a long long long description about jane'
  };

  lab.beforeEach(function (done) {
    // Delete database, run before every single test
    Storage.sequelize
      .sync({force: true})
      .then(function() {
        done();
      })
      .catch(function(err) {
        if (err.parent.code == 'ER_NO_SUCH_TABLE') {
          logger.info('Building table');
        } else {
          logger.error('Database Connection refused');
        }
      });
  });

  lab.test('Create User', function (done) {
    Storage.createUser(user)
      .then(function(user) {
        expect(user.username).to.equal('Jane Tan');
        done();
      });
  });

  lab.test('Get User by Id', function (done) {
    Storage.createUser(user)
      .then(function(user) {
        Storage.getUserById(user.userId)
          .then(function(data) {
            expect(data.username).to.equal('Jane Tan');
            done();
          });
      });
  });

  lab.test('Get User by Email', function (done) {
    Storage.createUser(user)
      .then(function(user) {
        Storage.getUserByEmail('jane@gmail.com')
          .then(function(data) {
            expect(data.username).to.equal('Jane Tan');
            done();
          });
      });
  });

  lab.test('Get User by platformId', function (done) {
    Storage.createUser(user)
      .then(function(user) {
        Storage.getUserByPlatformId('facebook',
            'asdfadf-asdfasdf-asdfasdfaf-dfddf')
          .then(function(data) {
            expect(data.username).to.equal('Jane Tan');
            done();
          });
      });
  });

  lab.test('Geting User by invalid platform parameters', function (done) {
    Storage.createUser(user)
      .then(function(user) {
        Storage.getUserByPlatformId('twitter',
            'asdfadf-asdfasdf-asdfasdfaf-dfddf')
          .then(function(data) {
            expect(data).to.be.null();
            done();
          });
      });
  });

  lab.test('Get Non-Existing User', function (done) {
    Storage.getUserById('19f9bd98-ffff-aaaa-bbbb-3109f617667d')
      .then(function(data) {
        expect(data).to.be.null();
        done();
      });
  });

  lab.test('Delete Non-Existing User', function (done) {
    Storage.deleteUserById('19f9bd98-ffff-aaaa-bbbb-3109f617667d')
      .then(function(err) {
        expect(err).to.equal(false);
        done();
      });
  });

  lab.test('Delete User', function (done) {
    Storage.createUser(user)
      .then(function(user) {
        Storage.deleteUserById(user.userId)
          .then(function(res) {
            expect(res).to.be.true();
            done();
          });
      });
  });

  lab.test('Duplicate Emails', function (done) {
    Storage.createUser(user)
      .then(function() {
        Storage.createUser(user)
          .then(function(res) {
            expect(res).to.be.false();
            done();
          });
      });
  });

  lab.test('Update particulars', function (done) {
    var newParticulars = {
      password: 'anewpassword',
      accessToken: 'averynewtoken',
      alias: 'anewalias',
      description: 'a new description, so new and new',
      email: 'anewemail@yahoo.com'
    };

    Storage.createUser(user)
      .then(function(user) {
        Storage.updateParticulars(user.userId, newParticulars)
          .then(function(updatedUser) {
            expect(updatedUser.alias).to.equal('anewalias');
            expect(updatedUser.password).to.equal('anewpassword');
            expect(updatedUser.accessToken).to.equal('averynewtoken');
            expect(updatedUser.description).
              to.equal('a new description, so new and new');
            expect(updatedUser.email).to.equal('anewemail@yahoo.com');
            done();
          });
      });
  });

  lab.test('Update particulars with one invalid parameter', function (done) {
    var newParticulars = {
      newColAlias: 23
    };

    Storage.createUser(user)
      .then(function(user) {
        Storage.updateParticulars(user.userId, newParticulars)
          .catch(function(err) {
            expect(err).to.be.instanceof(Error);
            done();
          });
      });
  });

  lab.test('Update particulars with one valid/invalid param', function (done) {
    var newParticulars = {
      newColAlias: 23,
      description: 'simple'
    };

    Storage.createUser(user)
      .then(function(user) {
        Storage.updateParticulars(user.userId, newParticulars)
          .catch(function(err, data) {
            expect(err).to.be.instanceof(Error);
            done();
          });
      });
  });

  lab.test('Get a list of users', function (done) {
    Storage.models.User.bulkCreate([
      {username: 'Jane', password: 'asdf', email: 'jane@gmail.com'},
      {username: 'Alan', password: 'asdf', email: 'alan@gmail.com'},
      {username: 'John', password: 'asdf', email: 'john@gmail.com'}
    ])
    .then(function() {
      Storage.getListOfUsers()
      .then(function(users) {
        expect(users[0].username).to.equal('Alan');
        expect(users[1].username).to.equal('Jane');
        expect(users[2].username).to.equal('John');
        done();
      });
    });
  });

});
