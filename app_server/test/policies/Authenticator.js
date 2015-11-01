var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');

var Authenticator = rfr('app/policies/Authenticator');

lab.experiment('Authenticator Tests', function () {
  lab.test('Invalid platform return Error', function (done) {
    Authenticator.authenticateUser('bogusbook',
                                   {appId: '123456789',
                                    accessToken: 'qwoei'})
    .then(function (result) {
      Code.expect(result).to.be.an.instanceOf(Error);
      done();
    });
  });

  lab.test('Missing appId should return error', function (done) {
    Authenticator.authenticateUser('facebook',
                                   {accessToken: 'qwoei'})
    .then(function (result) {
      Code.expect(result).to.be.an.instanceOf(Error);
      done();
    });
  });

  lab.test('Wrong appId should throw error', function (done) {
    Authenticator.authenticateUser('facebook',
                                   {appId: 'xyz', accessToken: 'qwoei'})
    .then(function (result) {
      Code.expect(result).to.be.an.instanceOf(Error);
      done();
    });
  });

  lab.test('Empty appId should throw error', function (done) {
    Authenticator.authenticateUser('facebook',
                                   {appId: '', accessToken: 'qwoei'})
    .then(function (result) {
      Code.expect(result).to.be.an.instanceOf(Error);
      done();
    });
  });

  lab.test('Missing accessToken should throw error', function (done) {
    Authenticator.authenticateUser('facebook',
                                   {appId: '123456789'})
    .then(function (result) {
      Code.expect(result).to.be.an.instanceOf(Error);
      done();
    });
  });

  lab.test('Wrong accessToken', function (done) {
    Authenticator.authenticateUser('facebook',
                                   {appId: '123456789', accessToken: 'xyz'})
    .then(function (result) {
      Code.expect('id' in result).to.be.false();
      done();
    });
  });
});
