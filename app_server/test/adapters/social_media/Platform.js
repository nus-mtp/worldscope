var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');

var Platform = rfr('app/adapters/social_media/Platform');

lab.experiment('SocialMediaAdapter tests', function () {
  lab.test('Invalid apiDomain', function (done) {
    var platform = new Platform('www.bogus.lahlahland');
    platform.__makeAPICall('/somewhere/over/the/rainbow',
                           {wizard: 'oz'}).
    then(function (result) {
      Code.expect(result).to.be.null();
      done();
    });
  });

  lab.test('Invalid accessToken when querying facebook', function (done) {
    var platform = new Platform('https://graph.facebook.com');
    platform.__makeAPICall('/v2.5/me',
                           {accessToken: 'xyz'}).
    then(function (result) {
      Code.expect('id' in result).to.be.false();
      done();
    });
  });
});
