/**
 * Router module. The main entry point for worldscope application server
 * @module app/Router
 */
var rfr = require('rfr');
var Hapi = require('hapi');
var Utility = rfr('app/util/Utility');

var logger = Utility.createLogger(__filename);

/* Configure Hapi server connection */
var server = new Hapi.Server();
server.connection({ port: 3000 });
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
    events: { log: '*', response: '*' }
  }, {
    reporter: require('good-file'),
    events: { ops: '*' },
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
  routes: { prefix: '/user' }
}, function (err) {
  if (err) {
    logger.error('Unable to register UserController: %j', err);
  }
});

server.start(function () {
  logger.info('Server running at: ' + server.info.uri);
});
