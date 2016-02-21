/**
 * Subscription Controller
 * @module SubscriptionController
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

function SubscriptionController(server, options) {
  this.server = server;
  this.options = options;
}

var Class = SubscriptionController.prototype;

Class.registerRoutes = function() {

  this.server.route({method: 'POST', path: '/{id}',
                     config: {
                       validate: singleSubscriptionValidator,
                       auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.createSubscription});

  this.server.route({method: 'GET', path: '/',
                     config: {
                       auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.getListOfSubscriptions});

  this.server.route({method: 'GET', path: '/{id}',
                     config: {
                       auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.getListOfSubscribers});

  this.server.route({method: 'DELETE', path: '/{id}',
                     config: {
                       validate: singleSubscriptionValidator,
                       auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.deleteSubscription});
};

/* Routes handlers */
Class.createSubscription = function(request, reply) {
  logger.debug('Creating Subscription');

  var userId = request.auth.credentials.userId;
  var subscribeToId = request.params.id;

  Service.createSubscription(userId, subscribeToId)
    .then(function receiveResult(result) {
      if (result instanceof Error) {
        logger.error('Subscription could not be created');
        return reply(Boom.badRequest(result.message));
      }

      reply({status: 'OK'}).code(200);
    });
};

Class.getListOfSubscriptions = function(request, reply) {
  logger.debug('Get list of subscriptions');

  reply('hello');
};

Class.getListOfSubscribers = function(request, reply) {
  logger.debug('Get list of subscribers');

  reply('hello');
};

Class.deleteSubscription = function(request, reply) {
  logger.debug('Deleting Subscription');

  reply('delete');
};

/* Validator for routes */
var singleSubscriptionValidator = {
  params: {
    id: Joi.string().guid().required()
  }
};

exports.register = function(server, options, next) {
  var subscriptionController = new SubscriptionController(server, options);
  server.bind(subscriptionController);
  subscriptionController.registerRoutes();
  next();
};

exports.register.attributes = {
  name: 'SubscriptionController'
};
