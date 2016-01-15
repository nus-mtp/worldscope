var rfr = require('rfr');
var Hapi = require('hapi');

var Utility = rfr('app/util/Utility');
var Storage = rfr('app/models/Storage.js');

var logger = Utility.createLogger(__filename);

exports.resetDatabase = function (done) {
  return Storage.sequelize.sync()
  .then(function(res) {
    return Storage.sequelize.query('SET FOREIGN_KEY_CHECKS=0', {raw: true});
  }).then(function(res) {
    return Storage.sequelize.sync({force: true});
  }).then(function() {
    return Storage.sequelize.query('SET FOREIGN_KEY_CHECKS=1', {raw: true});
  }).then(function() {
    logger.info('Database for tests synchronised');
    return done();
  }).catch(function(err) {
    if (err.parent && err.parent.code == 'ER_NO_SUCH_TABLE') {
      logger.info('Building table');
    } else {
      logger.error('Database Connection refused');
    }
  });
};

exports.mockFacebookServer = function () {
  var facebookServer = new Hapi.Server();
  facebookServer.connection({port: 8888});
  facebookServer.route({
    method: 'GET',
    path: '/v2.5/me',
    handler: function (request, reply) {
      if (request.query.access_token == 'xyz') {
        reply({name: 'Bob The Builder', 'id': '18292522986296117'});
      } else {
        reply('Unauthorized').code(401);
      }
    }
  });

  return facebookServer;
};
