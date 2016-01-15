/**
 * Router module. The main entry point for worldscope application server
 * @module app/Router
 */
var rfr = require('rfr');
var Hapi = require('hapi');
var Promise = require('bluebird');

var Utility = rfr('app/util/Utility');
var ServerConfig = rfr('config/ServerConfig');
var Authenticator = rfr('app/policies/Authenticator');

var logger = Utility.createLogger(__filename);

/* Configure Hapi server connection */
var server = new Hapi.Server();
server.connection({port: 3000});
server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    reply('Welcome to WorldScope');
  }
});

/* Configure Good process monitor */
var goodOptions = {
  reporters: [{
    reporter: require('good-console'),
    events: {log: '*', response: '*'}
  }, {
    reporter: require('good-file'),
    events: {ops: '*'},
    config: './process_log.log'
  }]
};

server.register({
  register: require('good'),
  options: goodOptions
}, function (err) {
  if (err) {
    logger.error('Unable to register good process monitor: %j', err);
  }
});

/* Register controllers */
server.register({
  register: rfr('app/controllers/UserController.js')
}, {
  routes: {prefix: '/api/users'}
}, function (err) {
  if (err) {
    logger.error('Unable to register UserController: %j', err);
  }
});

/* Configure Authentication plugin */
server.register(require('hapi-auth-cookie'), function (err) {
  var cache = server.cache({segment: 'sessions',
                            expiresIn: 3 * 24 * 60 * 60 * 1000});
  server.app.cache = cache;

  server.auth.strategy('session', 'cookie', {
    password: ServerConfig.cookiePassword,
    cookie: Authenticator.SID,
    isSecure: false,
    validateFunc: function (request, session, callback) {
      logger.debug('Validating user: ' + JSON.stringify(session));

      Authenticator.validateAccount(request, session)
      .then(function (account) {
        if (!account || account instanceof Error) {
          return callback(account, false);
        }

        return callback(null, true, account);
      })
      .catch(function (err) {
        logger.error(err);
        return callback(err, false);
      });
    }
  });
});

server.auth.default({
  strategy: 'session'
});

/* Register static file handler */
server.register(require('inert'), function(err) {
  if (err) {
    logger.error('Unable to register inert file handler: %j', err);
    throw err;
  }

  server.route({
    method: 'GET',
    path: '/admin/{param*}',
    handler: {
      directory: {
        path: 'public',
        listing: true,
        index: 'index.htm'
      }
    }
  });
});

server.start(function () {
  logger.info('Server running at: ' + server.info.uri);
});

module.exports = server;
