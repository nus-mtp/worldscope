/**
 * Stream Controller
 * @module StreamController
 */
'use strict';
var rfr = require('rfr');
var Joi = require('joi');
var Boom = require('boom');
var Promise = require('bluebird');
var crypto = require('crypto');

var CustomError = rfr('app/util/Error');
var Utility = rfr('app/util/Utility');
var Service = rfr('app/services/Service');
var Authenticator = rfr('app/policies/Authenticator');
var ServerConfig = rfr('config/ServerConfig');

var logger = Utility.createLogger(__filename);

function StreamController(server, options) {
  this.server = server;
  this.options = options;
}

var Class = StreamController.prototype;

Class.registerRoutes = function() {
  this.server.route({method: 'GET', path: '/',
                     config: {
                       validate: streamListParamsValidator,
                       auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.getListOfStreams});

  this.server.route({method: 'GET', path: '/{id}',
                     config: {
                       validate: singleStreamValidator,
                       auth: {
                         mode: 'optional',
                         scope: Authenticator.SCOPE.ALL
                       }
                     },
                     handler: this.getStreamById});

  this.server.route({method: 'GET', path: '/subscriptions',
                     config: {
                       auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.getStreamsFromSubscriptions});

  this.server.route({method: 'POST', path: '/control/stop',
                     config: {
                       validate: streamControlStopValidator,
                       auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.controlStopStream});

  this.server.route({method: 'POST', path: '/control/end',   // for users
                     config: {
                       validate: singleStreamPayloadValidator,
                       auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.endStream});

  this.server.route({method: 'POST', path: '/',
                     config: {
                       validate: streamCreatePayloadValidator,
                       auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.createStream});

  this.server.route({method: 'DELETE', path: '/{id}', //for admins only
                     config: {
                       validate: singleStreamValidator,
                       auth: {scope: Authenticator.SCOPE.ADMIN.ADMINS}
                     },
                     handler: this.deleteStream});

  this.server.route({method: 'GET', path: '/statistics',
                     config: {
                       validate: streamsStatsValidator,
                       auth: {scope: Authenticator.SCOPE.ADMIN.ADMINS}
                     },
                     handler: this.getStreamsStats});
};

/* Routes handlers */
Class.createStream = function(request, reply) {
  logger.debug('Creating stream');

  var userId = request.auth.credentials.userId;
  var currTime = Date.now();

  return Promise.method(function generateStream() {
    var newStream = {
      title: request.payload.title,
      description: request.payload.description,
      appInstance: crypto.createHash('sha256').update(userId + currTime)
                         .digest('hex')
    };

    return newStream;
  })().then(function createNewStream(newStream) {
    return Service.createNewStream(userId, newStream);
  }).then(function(result) {
    if (result instanceof CustomError.NotFoundError) {
      logger.error('Stream could not be created');
      return reply(Boom.unauthorized(result.message));
    }

    return reply(result);
  }).catch(function(err) {
    logger.error(err);
    return reply(Boom.unauthorized('User not found'));
  });
};

Class.getStreamById = function(request, reply) {
  logger.debug('Getting stream by Id');

  Service.getStreamById(request.params.id).then(function(result) {
    if (result instanceof Error) {
      logger.error(result.message);
      return reply(Boom.notFound(result.message));
    }

    return reply(result);
  });
};

Class.getListOfStreams = function(request, reply) {
  logger.debug('Getting list of streams');

  var userId = request.auth.credentials.userId;
  var filters = {
    state: request.query.state,
    sort: request.query.sort,
    order: request.query.order
  };

  Service.getListOfStreams(filters, userId).then(function(listStreams) {
    if (!listStreams || listStreams instanceof Error) {
      return reply(Boom.notFound('Stream not found'));
    }

    return reply(listStreams);
  });
};

Class.getStreamsFromSubscriptions = function(request, reply) {
  logger.debug('Getting list of streams from subscriptions');

  var userId = request.auth.credentials.userId;

  Service.getStreamsFromSubscriptions(userId).then(function(listStreams) {
    if (!listStreams || listStreams instanceof Error) {
      return reply(Boom.notFound('Stream not found'));
    }

    return reply(listStreams);
  });
};

Class.controlStopStream = function(request, reply) {
  Service.stopStream(ServerConfig.mediaServer.appName,
                     request.payload.appInstance,
                     request.payload.streamId)
  .then((result) => {
    if (result instanceof Error) {
      return reply(Boom.badRequest(result.message));
    }

    return reply({status: 'OK', message: ''});
  });
};

Class.endStream = function(request, reply) {
  logger.debug('Ending a stream');

  Service.endStream(request.auth.credentials.userId, request.payload.streamId)
  .then(function(res) {
    if (!res || res instanceof Error) {
      return reply(Boom.badRequest(res.message));
    }
    return reply({status: 'OK', message: ''}).code(200);
  });
};

Class.deleteStream = function(request, reply) {
  logger.debug('Ending a stream %s', request.params.id);

  var streamId = request.params.id;

  Service.deleteStream(streamId)
  .then(function(res) {
    if (!res || res instanceof Error) {
      return reply(Boom.badRequest(res.message));
    }
    return reply({status: 'OK'});
  });
};

Class.getStreamsStats = function(request, reply) {
  logger.info(`Getting statistics for ${request.query.state} streams`);

  let state = request.query.state; 
  if (state !== 'live') {
    return reply({});
  }

  Service.getLiveStreamsStats()
  .then((liveStreamsStats) => {
    if (liveStreamsStats instanceof Error) {
      return reply(Boom.badGateway(liveStreamsStats.message));
    }
    return reply(liveStreamsStats);
  });
};

/* End of route handlers */

/* Validator for routes */
var singleStreamValidator = {
  params: {
    id: Joi.string().guid().required()
  },
  failAction: Utility.addValidationDetailsForJoi
};

var singleStreamPayloadValidator = {
  payload: {
    streamId: Joi.string().guid().required()
  },
  failAction: Utility.addValidationDetailsForJoi
};

var streamCreatePayloadValidator = {
  payload: {
    title: Joi.string().required().max(50),
    description: Joi.string()
  }
};

var streamListParamsValidator = {
  query: {
    state: Joi.any().valid('live', 'done', 'all').default('live'),
    sort: Joi.any().valid('time', 'viewers', 'title').default('time'),
    order: Joi.any().valid('desc', 'asc').default('desc')
  },
  failAction: Utility.addValidationDetailsForJoi
};

var streamControlStopValidator = {
  payload: {
    appInstance: Joi.string().required(),
    streamId: Joi.string().required()
  },
  failAction: Utility.addValidationDetailsForJoi
};

var streamsStatsValidator = {
  query: {
    state: Joi.any().valid('live', 'done', 'all').default('live'),
  }
};
/* End of validators */

exports.register = function(server, options, next) {
  var streamController = new StreamController(server, options);
  server.bind(streamController);
  streamController.registerRoutes();
  next();
};

exports.register.attributes = {
  name: 'StreamController'
};
