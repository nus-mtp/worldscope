var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var expect = Code.expect;

var Storage = rfr('app/models/Storage');
var Service = rfr('app/services/Service');
var CustomError = rfr('app/util/Error');
var TestUtils = rfr('test/TestUtils');

/*lab.experiment('Service tests for User', function () {
  var bob = {
    username: 'Bob',
    alias: 'Bob the Builder',
    email: 'bob@bubblegum.com',
    password: 'generated',
    accessToken: 'xyzabc',
    platformType: 'facebook',
    platformId: '1238943948',
    description: 'bam bam bam'
  };

  lab.beforeEach(function (done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('createNewUser missing particulars returns null', function(done) {
    Service.createNewUser().then(function (result) {
      Code.expect(result).to.be.null();
      done();
    });
  });

  lab.test('createNewUser invalid fields returns null', function(done) {
    Service.createNewUser({something: 'abc'}).then(function (result) {
      Code.expect(result).to.be.null();
      done();
    });
  });

  lab.test('createNewUser valid particulars', function(done) {
    Service.createNewUser(bob).then(function (result) {
      Code.expect(result.username).to.equal(bob.username);
      Code.expect(result.password).to.equal(bob.password);
      done();
    });
  });

  lab.test('getUserByPlatform invalid platformType', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.getUserByPlatform('bogusmedia', result.platformId);
    }).then(function(user) {
      console.log(user);
      Code.expect(user).to.be.null();
      done();
    });
  });

  lab.test('getUserByPlatform invalid platformId', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.getUserByPlatform(result.platformType, 'invalidId');
    }).then(function(user) {
      Code.expect(user).to.be.null();
      done();
    });
  });

  lab.test('getUserByPlatform valid arguments', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.getUserByPlatform(result.platformType,
                                           result.platformId);
    }).then(function(user) {
      Code.expect(user.username).to.equal(bob.username);
      Code.expect(user.password).to.equal(bob.password);
      done();
    });
  });

  lab.test('getUserById valid arguments', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.getUserById(result.userId);
    }).then(function(user) {
      Code.expect(user.username).to.equal(bob.username);
      Code.expect(user.password).to.equal(bob.password);
      done();
    });
  });

  lab.test('getUserById invalid arguments', function(done) {
    return Service.getUserById('123xyz')
    .then(function(user) {
      Code.expect(user).to.be.null();
      done();
    });
  });

  lab.test('updateUserParticulars invalid userId', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.updateUserParticulars('invalidUserId',
                                           result);
    }).then(function(user) {
      Code.expect(user).to.be.null();
      done();
    });
  });

  lab.test('updateUserParticulars missing particulars', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.updateUserParticulars(result.userId);
    }).then(function(user) {
      Code.expect(user).to.be.null();
      done();
    });
  });

  lab.test('updateUserParticulars valid', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.updateUserParticulars(result.userId,
          {email: 'newemail@lahlahland.candy'});
    }).then(function(user) {
      Code.expect(user.email).to.equal('newemail@lahlahland.candy');
      done();
    });
  });
});*/


lab.experiment('Service tests for Streams', function () {
  var testStream = {
    title: 'this is a title from stream service',
    description: 'arbitrary description',
    appInstance: '123-123-123-123'
  };

  var bob = {
    username: 'Bob',
    alias: 'Bob the Builder',
    email: 'bob@bubblegum.com',
    password: 'generated',
    accessToken: 'xyzabc',
    platformType: 'facebook',
    platformId: '1238943948',
    description: 'bam bam bam'
  };

  lab.beforeEach({timeout: 10000}, function (done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('createNewStream valid', function(done) {
    Service.createNewUser(bob).then(function (user) {
      return Service.createNewStream(user.userId, testStream)
    }).then(function(result) {
      Code.expect(result.title).to.be.equal(testStream.title);
      Code.expect(result.description).to.be.equal(testStream.description);
      done();
    });
  });

  lab.test('createNewStream undefined userId', function(done) {
    Service.createNewStream(bob.userId, testStream).then(function (result) {
      Code.expect(result).to.be.an.instanceof(CustomError.NotFoundError);
      Code.expect(result.message).to.be.equal('User not found');
      done();
    });
  });

  lab.test('createNewStream invalid missing appInstance', function(done) {
    var testStream = {
      title: 'this is a title from stream service',
      description: 'arbitrary description'
    };

    Service.createNewStream(bob.userId, testStream).then(function (result) {
      Code.expect(result).to.be.an.instanceof(CustomError.InvalidFieldError);
      done();
    });
  });

  lab.test('createNewstream empty title', function(done) {
    var testStream = {
      title: '',
      description: 'arbitrary description',
      appInstance: '123-123-123-123'
    };

    Service.createNewUser(bob).then(function (user) {
      return Service.createNewStream(user.userId, testStream)
    }).then(function(result) {
      Code.expect(result).to.be.an.instanceof(CustomError.InvalidFieldError);
      Code.expect(result.extra).to.be.equal('title');
      done();
    });
  });

/*  lab.test('getStreamById valid', function(done) {
    Service.createNewUser(bob).then(function (user) {
      return Service.createNewStream(user.userId, testStream)
    }).then(function(result) {
      return Service.getStreamById(result.streamId);
    }).then(function(result) {
      Code.expect(result.title).to.be.equal(testStream.title);
      Code.expect(result.description).to.be.equal(testStream.description);
      done();
    });
  });

  lab.test('getStreamById empty id', function(done) {
    Service.createNewUser(bob).then(function (user) {
      return Service.createNewStream(user.userId, testStream)
    }).then(function(result) {
      return Service.getStreamById('');
    }).then(function(result) {
      Code.expect(result).to.be.equal(StreamService.ERRORS.NOT_FOUND);
      done();
    });
  });

  lab.test('getStreamById invalid id', function(done) {
    Service.createNewUser(bob).then(function (user) {
      return Service.createNewStream(user.userId, testStream)
    }).then(function(result) {
      return Service.getStreamById('asd-234234');
    }).then(function(result) {
      Code.expect(result).to.be.equal(StreamService.ERRORS.NOT_FOUND);
      done();
    });
  });*/

});
