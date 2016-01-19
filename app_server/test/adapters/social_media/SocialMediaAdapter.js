var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');

var SocialMediaAdapter = rfr('app/adapters/social_media/SocialMediaAdapter');

lab.experiment('SocialMediaAdapter tests', function () {
  lab.test('Invalid platform should throw Error', function (done) {
    Code.expect(function () {
      var adapter = new SocialMediaAdapter('bogusbook',
                                           {appId: '123456789',
                                            accessToken: 'qwoei'});
    }).to.throw(Error);
    done();
  });

  lab.test('Missing appId should throw error', function (done) {
    Code.expect(function () {
      var adapter = new SocialMediaAdapter('facebook',
                                           {accessToken: 'qwoei'});
    }).to.throw(Error);
    done();
  });

  lab.test('Wrong appId should throw error', function (done) {
    Code.expect(function () {
      var adapter = new SocialMediaAdapter('facebook',
                                           {appId: 'xyz',
                                            accessToken: 'qwoei'});
    }).to.throw(Error);
    done();
  });

  lab.test('Empty appId should throw error', function (done) {
    Code.expect(function () {
      var adapter = new SocialMediaAdapter('facebook',
                                           {appId: '', accessToken: 'qwoei'});
    }).to.throw(Error);
    done();
  });

  lab.test('Missing accessToken should throw error', function (done) {
    Code.expect(function () {
      var adapter = new SocialMediaAdapter('facebook', {appId: '123456789'});
    }).to.throw(Error);
    done();
  });

  lab.test('getUser when given wrong accessToken', {timeout: 5000},
           (done) => {
    var adapter = new SocialMediaAdapter('facebook',
                                         {appId: '123456789',
                                          accessToken: 'xyz'});
    adapter.getUser().then(function (result) {
      Code.expect('id' in result).to.be.false();
      done();
    });
  });
});
