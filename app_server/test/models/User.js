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
    acessToken:'atoken',
    platformType: 'facebook',
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

  lab.test('Add User', function (done) {
    Storage.createUser(user)
      .then(function(user) {
        console.log(user.username);
        expect(user.username).to.equal('Jane Tan');
        done();
      });
  });

  lab.test('Delete non-existing user', function (done) {
    Storage.deleteUserByEmail('nouser@gmail.com')
      .then(function(res) {
        console.log(res);
        expect(res).to.equal(false);
        done();
      });
  });

  lab.test('Delete User', function (done) {
    Storage.createUser(user)
      .then(function(user) {
        Storage.deleteUserByEmail(user.email)
          .then(function(res) {
            console.log(res);
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
            console.log(res);
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
        Storage.updateParticulars(user.email, newParticulars)
          .then(function(res) {
            console.log(res);
            expect(res).to.equal(true);
            done();
          });
      });
  });

});
