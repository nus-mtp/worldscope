var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');

var Authenticator = rfr('app/policies/Authenticator');
var TestUtils = rfr('test/TestUtils');
var Router = rfr('app/Router.js');
var Facebook = rfr('app/adapters/social_media/Facebook');

lab.experiment('Authenticator Tests', function () {
  var facebookServer = TestUtils.mockFacebookServer(); 

  lab.before(function (done) {
    TestUtils.resetDatabase(done);
  });

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

  lab.test('Validate cookie without cache', function (done) {
    facebookServer.start(function (err) {
      Code.expect(err).to.not.be.null();

      Facebook.FACEBOOK_API_URL = 'http://localhost:8888';

      Router.inject({method: 'POST', url: '/api/users/login',
                    payload: {appId: '123456789',
                              accessToken: 'xyz'}}, function (res) {
        Code.expect(res.statusCode).to.equal(200);

        Facebook.FACEBOOK_API_URL = 'https://graph.facebook.com';
        facebookServer.stop(function () {});

        var body = JSON.parse(res.payload);
        Router.app.cache.drop(body.userId);

        // API request with logged in cookie should now be authorized
        Router.inject({method: 'GET', url: '/',
                       headers: {
                         'Cookie': res.headers['set-cookie'][0].split(';')[0]
                       }},
                      function (res2) {
                        Code.expect(res2.statusCode).to.equal(200);
                        done();
                      });
      });
    });
  });
});
