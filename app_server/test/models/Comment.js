var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var expect = Code.expect;
var Promise = require('bluebird');

var Utility = rfr('app/util/Utility');
var CustomError = rfr('app/util/Error');
var logger = Utility.createLogger(__filename);

var Storage = rfr('app/models/Storage.js');
var TestUtils = rfr('test/TestUtils');

lab.experiment('Comment Model Tests', function() {

  var user1 = {
    username: 'Noob Nie',
    alias: 'the noobie',
    email: 'noob@gmail.com',
    password: 'secretpass',
    accessToken: 'atoken',
    platformType: 'facebook',
    platformId: 'asdfadf-asdfasdf-asdfasdfaf-dfddf',
    description: 'noob has a noobie description'
  };

  var user2 = {
    username: 'Miss Pro',
    alias: 'Pro in the wonderland',
    email: 'pro@prototype.com',
    password: 'generated',
    accessToken: 'anaccesstoken',
    platformType: 'facebook',
    platformId: '45454545454',
    description: 'pro is too cool for description'
  };

  var streamDetails = {
    title: 'I am going to dance',
    appInstance: 'appInstance',
    roomId: '123',
  };

  var comment1 = {
    content: 'How do I live without you',
    createdAt: new Date('2016-01-01')
  };

  var comment2 = {
    content: 'I want to know',
    createdAt: new Date('2016-01-02')
  };

  var comment3 = {
    content: 'If you ever go',
    createdAt: new Date('2016-01-03')
  };

  var comment4 = {
    content: 'How do I ever, ever',
    createdAt: new Date('2016-01-04')
  };

  lab.beforeEach({timeout: 10000}, function(done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('Create Comment valid', function(done) {
    var userPromise = Storage.createUser(user1);
    var streamPromise = userPromise.then((user) =>
      Storage.createStream(user.userId, streamDetails));

    Promise.join(userPromise, streamPromise,
      function(user, stream) {
        Storage.createComment(user.userId, stream.streamId, comment1)
          .then(function(res) {
            expect(res.content).to.equal(comment1.content);
            expect(res.userId).to.equal(user.userId);
            expect(res.streamId).to.equal(stream.streamId);
            done();
          });
      });
  });

  lab.test('Create Comment invalid empty string', function(done) {
    var userPromise = Storage.createUser(user1);
    var streamPromise = userPromise.then((user) =>
      Storage.createStream(user.userId, streamDetails));

    Promise.join(userPromise, streamPromise,
      function(user, stream) {
        Storage.createComment(user.userId, stream.streamId, {content: ''})
          .catch(function(err) {
            expect(err).to.be.an.instanceof(Error);
            done();
          });
      });
  });

  lab.test('Create Comment non-existing stream', function(done) {
    var userPromise = Storage.createUser(user1);

    userPromise.then(function(user) {
      Storage.createComment(user.userId,
                            '3388ffff-aa00-1111a222-00000044888c', comment1)
        .then(function(res) {
          expect(res).to.be.an.instanceof(Error);
          done();
        });
    });
  });

  lab.test('Create Comment non-existing user', function(done) {
    var userPromise = Storage.createUser(user1);
    var streamPromise = userPromise.then((user) =>
      Storage.createStream(user.userId, streamDetails));

    streamPromise.then(function(stream) {
      Storage.createComment('3388ffff-aa00-1111a222-00000044888c',
                            stream.streamId, comment1)
        .then(function(res) {
          expect(res).to.be.an.instanceof(Error);
          done();
        });
    });
  });

  lab.test('Get all comments for a particular stream', function(done) {
    var userPromise = Storage.createUser(user1);
    var streamPromise = userPromise.then((user) =>
      Storage.createStream(user.userId, streamDetails));

    Promise.join(userPromise, streamPromise,
      function(user, stream) {
        Storage.createComment(user.userId, stream.streamId, comment1)
          .then(() => Storage.createComment(user.userId, stream.streamId,
                                            comment2))
          .then(() => Storage.createComment(user.userId, stream.streamId,
                                            comment3))
          .then(() => Storage.createComment(user.userId, stream.streamId,
                                            comment4))
          .then(() => Storage.getListOfCommentsForStream(stream.streamId))
          .then(function(res) {
            expect(res).to.have.length(4);
            expect(res[0].content).to.equal(comment4.content);
            expect(res[1].content).to.equal(comment3.content);
            expect(res[2].content).to.equal(comment2.content);
            expect(res[3].content).to.equal(comment1.content);
            done();
          });
      });
  });

  lab.test('Get all comments for a stream valid empty', function(done) {
    var userPromise = Storage.createUser(user1);
    var streamPromise = userPromise.then((user) =>
      Storage.createStream(user.userId, streamDetails));

    Promise.join(userPromise, streamPromise,
      function(user, stream) {
        Storage.getListOfCommentsForStream(stream.streamId)
          .then(function(res) {
            expect(res).to.deep.equal([]);
            done();
          });
      });
  });

  lab.test('Get all comments for a stream invalid streamId', function(done) {
    var userPromise = Storage.createUser(user1);
    var streamPromise = userPromise.then((user) =>
      Storage.createStream(user.userId, streamDetails));

    Promise.join(userPromise, streamPromise,
      function(user, stream) {
        Storage.getListOfCommentsForStream('3388ffff-aa00-1111' +
                                           'a222-00000044888c')
          .then(function(res) {
            expect(res).to.be.an.instanceof(CustomError.NotFoundError);
            done();
          });
      });
  });
});
