var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var expect = Code.expect;

var Utility = rfr('app/util/Utility');
var logger = Utility.createLogger(__filename);

var Storage = rfr('app/models/Storage.js');
var TestUtils = rfr('test/TestUtils');

lab.experiment('Stream Model Tests', function () {

  var streamDetails = {
    title: 'I am going to dance',
    appInstance: 'key given by media server',
    roomId: '123',
  };

  var userDetails = {
    username: 'Alex Chan',
    email: 'alex@gmail.com',
    password: 'secretpass',
  };

  lab.beforeEach({timeout: 10000}, function(done) {
    // Delete database, run before every single test
    TestUtils.resetDatabase(done);
  });

  lab.test('Create Stream', function(done) {
    Storage.createUser(userDetails).then(function(user) {
      return user.userId;
    }).then(function(userId) {
      return Storage.createStream(userId, streamDetails);
    }).then(function(stream) {
      expect(stream.title).to.equal('I am going to dance');
      done();
    });
  });

  lab.test('Create Stream with invalid userId', function(done) {
    Storage.createStream('123-123-123', streamDetails).catch(function(err) {
      expect(err.name).to.equal('TypeError');
      expect(err.message).to.equal("Cannot read property 'addStream' of null");
      done();
    });
  });

  lab.test('Get Stream by Id', function(done) {
    Storage.createUser(userDetails).then(function(user) {
      return user.userId;
    }).then(function(userId) {
      return Storage.createStream(userId, streamDetails);
    }).then(function(stream) {
      return Storage.getStreamById(stream.streamId);
    }).then(function(res) {
      expect(res.title).to.equal('I am going to dance');
      done();
    });
  });

});
