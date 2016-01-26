var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var io = require('socket.io-client');
var Promise = require('bluebird');
var Iron = Promise.promisifyAll(require('iron'));

var Router = rfr('app/Router');
var TestUtils = rfr('test/TestUtils');
var Authenticator = rfr('app/policies/Authenticator');
var ServerConfig = rfr('config/ServerConfig.js');
var Service = rfr('app/services/Service');

var options ={
  transports: ['websocket'],
  'force new connection': true
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

lab.experiment('socket.io connection and identify', function () {
  lab.before({timeout: 10000}, function (done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('missing cookie', function (done) {
    var client = io.connect('http://localhost:3000', options);

    client.once('connect', () => { 
      client.once('identify', (msg) => {
        Code.expect(msg).to.equal('ERR');
        client.disconnect();
        done();
      });

      client.emit('identify');
    });
  });

  lab.test('invalid cookie', function (done) {
    var client = io.connect('http://localhost:3000', options);

    client.once('connect', () => { 
      client.once('identify', (msg) => {
        Code.expect(msg).to.equal('ERR');
        client.disconnect();
        done();
      });

      client.emit('identify', 'abcdef');
    });
  });

  lab.test('valid cookie invalid credentials', function (done) {
    var client = io.connect('http://localhost:3000', options);
    var account = {userId: 1, username: 'bob', password: 'abc',
                   scope: Authenticator.SCOPE.USER};
    Iron.sealAsync(account, ServerConfig.cookiePassword, Iron.defaults)
    .then((sealed) => {
      client.once('connect', () => { 
        client.once('identify', (msg) => {
          Code.expect(msg).to.equal('ERR');
          client.disconnect();
          done();
        });

        client.emit('identify', sealed);
      });
    });
  });

  lab.test('valid cookie valid credentials', {timeout: 10000}, (done) => {
    var client = io.connect('http://localhost:3000', options);
    Service.createNewUser(bob).then((user) => {
      var account = TestUtils.copyObj(Authenticator.generateUserToken(user),
                                      ['userId', 'username', 'password']);
      account.scope = Authenticator.SCOPE.USER;
      return Iron.sealAsync(account, ServerConfig.cookiePassword, Iron.defaults)
      .then((sealed) => {
        client.once('connect', () => {
          client.once('identify', (msg) => {
            Code.expect(msg).to.equal('OK');
            client.disconnect();
            done();
          });

          client.emit('identify', sealed);
        });
      });
    });
  });
});
