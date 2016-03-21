var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');

var Facebook = rfr('app/adapters/social_media/Facebook');

lab.experiment('Facebook tests', {timeout: 10000}, function () {
  lab.test('Missing appId should throw error', function (done) {
    Code.expect(function () {
      var facebook = new Facebook({accessToken: 'qwoei'});
    }).to.throw(Error);
    done();
  });

  lab.test('Wrong appId should throw error', function (done) {
    Code.expect(function () {
      var facebook = new Facebook({appId: 'xyz', accessToken: 'qwoei'});
    }).to.throw(Error);
    done();
  });

  lab.test('Empty appId should throw error', function (done) {
    Code.expect(function () {
      var facebook = new Facebook({appId: '', accessToken: 'qwoei'});
    }).to.throw(Error);
    done();
  });

  lab.test('Missing accessToken should throw error', function (done) {
    Code.expect(function () {
      var facebook = new Facebook({appId: '123456789'});
    }).to.throw(Error);
    done();
  });

  lab.test('getUser when given wrong accessToken', {timeout: 5000}, (done) => {
    var facebook = new Facebook({appId: '123456789', accessToken: 'xyz'});
    facebook.getUser().then(function (result) {
      Code.expect('id' in result).to.be.false();
      done();
    });
  });
});
