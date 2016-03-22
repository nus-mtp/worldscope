/**
 * View Controller
 * @module ViewController
 */
var rfr = require('rfr');
var Joi = require('joi');
var Boom = require('boom');
var Promise = require('bluebird');

var CustomError = rfr('app/util/Error');
var Utility = rfr('app/util/Utility');
var Service = rfr('app/services/Service');
var Authenticator = rfr('app/policies/Authenticator');

var logger = Utility.createLogger(__filename);

function ViewController(server, options) {
  this.server = server;
  this.options = options;
}

var Class = ViewController.prototype;

Class.registerRoutes = function() {

  this.server.route({method: 'GET', path: '/{id}',
                     config: {
                       validate: singleViewValidator,
                       auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.getListOfUsersViewingStream});

  this.server.route({method: 'POST', path: '/{id}',
                     config: {
                       validate: singleViewValidator,
                       auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.createView});

  this.server.route({method: 'GET', path: '/{id}/statistics',
                     config: {
                       validate: singleViewValidator,
                       auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.getTotalNumberOfUsersViewedStream});
};

/* Routes handlers */
Class.createView = function(request, reply) {
  logger.debug('Creating View');

  var userId = request.auth.credentials.userId;
  var streamId = request.params.id;

  Service.createView(userId, streamId).then(function receiveResult(result) {
    if (result instanceof Error) {
      logger.error('View could not be created');
      return reply(Boom.badRequest(result.message));
    }

    return reply(result);
  });
};

Class.getListOfUsersViewingStream = function(request, reply) {
  logger.debug('Get list of users view a stream');

  var streamId = request.params.id;

  Service.getListOfUsersViewingStream(streamId)
    .then(function receiveResult(result) {
      if (!result) {
        logger.error('List of users cannot be retrieved');
        return reply(Boom.badRequest('Stream not found'));
      }

      return reply(result);
    });
};

Class.getTotalNumberOfUsersViewedStream = function(request, reply) {
  logger.debug('Get number of users view a stream');

  var streamId = request.params.id;

  Service.getTotalNumberOfUsersViewedStream(streamId)
    .then(function receiveResult(result) {
      if (!result) {
        logger.error('Number of users cannot be retrieved');
        return reply(Boom.badRequest('Stream not found'));
      }

      return reply(result);
    });
};

/* Validator for routes */
var singleViewValidator = {
  params: {
    id: Joi.string().guid().required()
  }
};

exports.register = function(server, options, next) {
  var viewController = new ViewController(server, options);
  server.bind(viewController);
  viewController.registerRoutes();
  next();
};

exports.register.attributes = {
  name: 'ViewController'
};
