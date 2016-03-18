/**
 * CommentController
 * @module CommentController
 */
var rfr = require('rfr');
var Joi = require('joi');
var Boom = require('boom');

var Service = rfr('app/services/Service');
var Authenticator = rfr('app/policies/Authenticator');
var Utility = rfr('app/util/Utility');

var logger = Utility.createLogger(__filename);

function CommentController(server, options) {
  this.server = server;
  this.options = options;
}

var Class = CommentController.prototype;

Class.registerRoutes = function () {
  this.server.route({method: 'POST', path: '/',
                     config: {
                       validate: singleCommentValidator,
                       auth: {scope: Authenticator.SCOPE.ALL},
                       isInternal: true
                     },
                     handler: this.createNewComment});

  this.server.route({method: 'GET', path: '/streams/{id}',
                     config: {
                       validate: streamIdValidator,
                       auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.getListOfCommentsForStream});
};

Class.createNewComment = function(request, reply) {
  logger.debug(request.auth.credentials.userId + ' says ' +
               request.payload.comment);
  var userId = request.auth.credentials.userId;
  var streamId = request.payload.streamId;
  var comment = {
    content: request.payload.comment.message,
    createdAt: request.payload.comment.time,
    alias: request.payload.comment.alias,
  };

  Service.createComment(userId, streamId, comment)
    .then((result) => {
      if (result instanceof Error) {
        return reply(Boom.badRequest(result.message));
      }

      return reply({status: 'OK'});
    });
};

Class.getListOfCommentsForStream = function(request, reply) {
  logger.debug('Get list of comments for: %s', request.params.id);

  var streamId = request.params.id;

  Service.getListOfCommentsForStream(streamId)
    .then((result) => {
      if (result instanceof Error) {
        return reply(Boom.badRequest(result.message));
      }

      return reply(result);
    });
};

exports.register = function (server, options, next) {
  var commentController = new CommentController(server, options);
  server.bind(commentController);
  commentController.registerRoutes();
  next();
};

exports.register.attributes = {
  name: 'CommentController'
};

/* Validator for routes */
var singleCommentValidator = {
  payload: {
    streamId: Joi.string().guid().required(),
    comment: Joi.object().keys({
      message: Joi.string().required(),
      time: Joi.number(),
      alias: Joi.string().required()
    })
  }
};

var streamIdValidator = {
  params: {
    id: Joi.string().guid().required()
  }
};
