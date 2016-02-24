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
                     handler: this.getSubscriptions});

  this.server.route({method: 'GET', path: '/subscribers/{id}',
                     config: {
                       auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.getSubscribers});

  this.server.route({method: 'DELETE', path: '/{id}',
                     config: {
                       validate: singleSubscriptionValidator,
                       auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.deleteSubscription});

  this.server.route({method: 'DELETE', path: '/subscribers/{id}',
                     config: {
                       validate: singleSubscriptionValidator,
                       auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.deleteSubscriber});
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

      return reply(result);
    });
};

Class.getSubscriptions = function(request, reply) {
  logger.debug('Get list of subscriptions');

  var userId = request.auth.credentials.userId;

  Service.getSubscriptions(userId)
    .then(function receiveResult(result) {
      if (result instanceof Error) {
        logger.error('Could not retrieve list of subscriptions');
        return reply(Boom.badRequest(result.message));
      }

      return reply(result);
    });
};

Class.getSubscribers = function(request, reply) {
  logger.debug('Get list of subscribers');

  var userId = request.params.id;

  Service.getSubscribers(userId)
    .then(function receiveResult(result) {
      if (result instanceof Error) {
        logger.error('Could not retrieve list of subscribers');
        return reply(Boom.badRequest(result.message));
      }

      return reply(result);
    });
};

Class.deleteSubscription = function(request, reply) {
  logger.debug('Deleting Subscription');

  var userId = request.auth.credentials.userId;
  var targetId = request.params.id;

  Service.deleteSubscription(userId, targetId)
    .then(function receiveResult(result) {

      if (!result || result instanceof Error) {
        return reply({'status': 'Unsuccessful'});
      }

      return reply({'status': 'OK'});

    });

};

Class.deleteSubscriber = function(request, reply) {
  logger.debug('Deleting Subscriber');

  var userId = request.auth.credentials.userId;
  var targetId = request.params.id;

  Service.deleteSubscription(targetId, userId)
    .then(function receiveResult(result) {

      if (!result || result instanceof Error) {
        return reply({'status': 'Unsuccessful'});
      }

      return reply({'status': 'OK'});

    });
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
