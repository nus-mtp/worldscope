var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var expect = Code.expect;

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
        Storage.getUserByEmail(user.email)
          .then(function(data) {
            expect(data.username).to.equal('Jane Tan');
            done();
          });
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
            expect(res).to.equal(true);
            done();
          });
      });
  });

  lab.test('Duplicate Emails', function (done) {
    Storage.createUser(user)
      .then(function() {
        Storage.createUser(user)
          .then(function(res) {
            expect(res).to.equal(false);
            done();
          });
      });
  });

  lab.test('Update particulars', function (done) {
    var newParticulars = {
      alias: 'anewalias',
      description: 'a new description, so new and new'
    };

    Storage.createUser(user)
      .then(function(user) {
        Storage.updateParticulars(user.userId, newParticulars)
          .then(function(res) {
            expect(res).to.equal(true);
            done();
          });
      });
  });

});
