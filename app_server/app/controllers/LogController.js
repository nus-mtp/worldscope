/**
 * Log Controller
 * @module LogController
 */
'use strict';
var rfr = require('rfr');
var Joi = require('joi');

var Utility = rfr('app/util/Utility');
var MemoryLogger = rfr('app/util/MemoryLogger');
var Authenticator = rfr('app/policies/Authenticator');

function LogController(server, options) {
  this.server = server;
  this.options = options;
}

var Class = LogController.prototype;

Class.registerRoutes = function() {
  this.server.route({method: 'GET', path: '/',
    config: {
      auth: {scope: Authenticator.SCOPE.ADMIN.SETTINGS},
      validate: timeValidator
    },
    handler: this.getLog});

  this.server.route({method: 'GET', path: '/response',
    config: {
      auth: {scope: Authenticator.SCOPE.ADMIN.SETTINGS},
      validate: timeValidator
    },
    handler: this.getResponseLog});
};

/* Routes handlers */
Class.getLog = function(request, reply) {
  var after = request.query.after;
  var log = MemoryLogger.log;
  if (after) {
    log = log.filter((item) => after < new Date(item.timestamp).getTime());
  }

  return reply(log);
};

Class.getResponseLog = function(request, reply) {
  var after = request.query.after;
  var log = MemoryLogger.responseLog;
  console.log(after, log[0].timestamp, new Date(log[0].timestamp).getTime());
  if (after) {
    log = log.filter((item) => after < new Date(item.timestamp).getTime());
  }
  return reply(log);
};
/* End of route handlers */

/* Validator for routes */
var timeValidator = {
  query: {
    after: Joi.string() // use date.timestamp after updating Joi
  }
};
/* End of validators */

exports.register = function(server, options, next) {
  var memoryLogController = new LogController(server, options);
  server.bind(memoryLogController);
  memoryLogController.registerRoutes();
  next();
};

exports.register.attributes = {
  name: 'LogController'
};
