/**
 * Router module. The main entry point for worldscope application server
 * @module Router
 */
var Hapi = require('hapi');
var Utility = require('local/Utility');

var logger = Utility.createLogger(__filename);

/* Configure Hapi server instance */
var server = new Hapi.Server();
server.connection({ port: 3000 });

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
    logger.error("Unable to register good process monitor");
  }
});

server.start(function () {
  logger.info('Server running at: ' + server.info.uri);
});
