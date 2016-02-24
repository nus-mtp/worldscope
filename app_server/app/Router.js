/**
 * Router module. The main entry point for worldscope application server
 * @module app/Router
 */
var rfr = require('rfr');
var process = require('process');
var Hapi = require('hapi');
var Promise = require('bluebird');

var Utility = rfr('app/util/Utility');
var ServerConfig = rfr('config/ServerConfig');
var Authenticator = rfr('app/policies/Authenticator');

var logger = Utility.createLogger(__filename);

/* Configure Hapi server connection */
var server = new Hapi.Server();
server.connection({port: 3000});

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

/* Configure Authentication plugin */
server.register(require('hapi-auth-cookie'), function (err) {
  server.app.cache = server.cache({segment: 'sessions',
                                   expiresIn: 3 * 24 * 60 * 60 * 1000});

  server.auth.strategy('session', 'cookie', {
    password: ServerConfig.cookiePassword,
    cookie: Authenticator.SID,
    isSecure: false,
    isHttpOnly: false,
    validateFunc: function (request, session, callback) {
      logger.debug('Validating user: ' + JSON.stringify(session));

      Authenticator.validateAccount(server, session, request)
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

server.app.authenticator = Authenticator;

server.auth.default({
  strategy: 'session',
  scope: Authenticator.SCOPE.ADMIN.DEFAULT
});

/* Register controllers */
server.register({
  register: rfr('app/controllers/UserController.js')
}, {
  routes: {prefix: '/api/users'}
}, function (err) {
  if (err) {
    logger.error('Unable to register UserController: %j', err);
    throw err;
  }
});

server.register({
  register: rfr('app/controllers/StreamController.js')
}, {
  routes: {prefix: '/api/streams'}
}, function (err) {
  if (err) {
    logger.error('Unable to register StreamController: %j', err);
    throw err;
  }
});

server.register({
  register: rfr('app/controllers/AdminController.js')
}, {
  routes: {prefix: '/api/admins'}
}, function (err) {
  if (err) {
    logger.error('Unable to register AdminController: %j', err);
  }
});

server.register({
  register: rfr('app/controllers/ViewController.js')
}, {
  routes: {prefix: '/api/views'}
}, function (err) {
  if (err) {
    logger.error('Unable to register ViewController: %j', err);
  }
});

server.register({
  register: rfr('app/controllers/SubscriptionController.js')
}, {
  routes: {prefix: '/api/subscriptions'}
}, function (err) {
  if (err) {
    logger.error('Unable to register SubscriptionController: %j', err);
  }
});

server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    reply('Welcome to WorldScope');
  },
  config: {
    auth: {scope: Authenticator.SCOPE.ALL}
  }
});

server.register({
  register: rfr('app/controllers/CommentController.js')
}, {
  routes: {prefix: '/api/comments'}
}, function (err) {
  if (err) {
    logger.error('Unable to register CommentController: %j', err);
    throw err;
  }
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
    config: {
      auth: false
    },
    handler: {
      directory: {
        path: 'public',
        listing: true,
        index: 'index.htm'
      }
    }
  });

  if (process.env.NODE_ENV == 'development') {
    server.route({
      method: 'GET',
      path: '/prototype/{param*}',
      handler: {
        directory: {
          path: 'prototype',
          listing: true
        }
      },
      config: {auth: {scope: Authenticator.SCOPE.ALL}}
    });
  }
});

/* Register SocketAdapter */
var socketAdapter = rfr('app/adapters/socket/SocketAdapter');
socketAdapter.init(server);

server.start(function () {
  logger.info('Server running at: ' + server.info.uri);
});

module.exports = server;
