/**
 * Stream Controller
 * @module StreamController
 */
var rfr = require('rfr');
var Joi = require('joi');
var Boom = require('boom');
var Promise = require('bluebird');
var crypto = require('crypto');
var hash = crypto.createHash('sha256');

var CustomError = rfr('app/util/Error');
var Utility = rfr('app/util/Utility');
var Service = rfr('app/services/Service');
var Authenticator = rfr('app/policies/Authenticator');

var logger = Utility.createLogger(__filename);

function StreamController(server, options) {
  this.server = server;
  this.options = options;
}

var Class = StreamController.prototype;

Class.registerRoutes = function () {
  this.server.route({method: 'GET', path: '/',
                     config: {
                       validate: streamListParamsValidator,
                       auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.getListOfStreams});

  this.server.route({method: 'GET', path: '/{id}',
                     config: {
                       validate: singleStreamValidator,
                       auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.getStreamById});

  this.server.route({method: 'POST', path: '/',
                     config: {
                       validate: streamCreatePayloadValidator,
                       auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.createStream});
};

/* Routes handlers */
Class.createStream = function (request, reply) {
  logger.debug('Creating stream');

  var userId = request.auth.credentials.userId;
  var currTime = Date.now();

  return Promise.method(function generateStream() {
    var newStream = {
      title: request.payload.title,
      description: request.payload.description,
      createdAt: currTime,
      appInstance: hash.update(userId + currTime).digest('hex')
    };
    return newStream;
  })().then(function createNewStream(newStream) {
    return Service.createNewStream(userId, newStream);
  }).then(function(result) {
    if (result instanceof CustomError.NotFoundError) {
      logger.error('Stream could not be created');
      reply(Boom.unauthorized(result.message));
    }

    reply(result);
  }).catch(function(err) {
    logger.error(err);
    reply(Boom.unauthorized('User not found'));
  });
};

Class.getStreamById = function (request, reply) {
  logger.debug('Getting stream by Id');

  Service.getStreamById(request.params.id).then(function(result) {
    if (result instanceof Error) {
      logger.error(result.message);
      reply(Boom.notFound(result.message));
      return;
    }

    reply(result);
  });
};

// TODO
Class.getListOfStreams = function (request, reply) {
  logger.debug('Getting list of streams');

  var filters = {
    state: request.query.state ? request.query.state : 'all',
    sort: request.query.sort ? request.query.sort : 'time',
    order: request.query.order ? request.query.order : 'desc'
  };

  //console.log(filters);

  Service.getListOfStreams(filters).then(function(listStreams) {
    if(!listStreams || listStreams instanceof Error) {
      reply(Boom.unauthorized('Stream not found'));
      return;
    }

    reply(listStreams);
  });
};

/* Validator for routes */
var singleStreamValidator = {
  params: {
    id: Joi.string().required()
  }
};

var streamCreatePayloadValidator = {
  payload: {
    title: Joi.string().required().max(50),
    description: Joi.string()
  }
};

var streamListParamsValidator = {
  params: {
    state: Joi.any().valid('live', 'done', 'all'),
    sort: Joi.any().valid('time', 'viewers', 'title'),
    order: Joi.any().valid('desc', 'asc')
  }
};

exports.register = function (server, options, next) {
  var streamController = new StreamController(server, options);
  server.bind(streamController);
  streamController.registerRoutes();
  next();
};

exports.register.attributes = {
  name: 'StreamController'
};
