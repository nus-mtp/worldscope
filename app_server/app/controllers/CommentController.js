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
                      auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.createNewComment});
};

Class.createNewComment = function (request, reply) {
  logger.debug(request.auth.credentials.userId + ' say ' +
               request.payload.comment);

  var userId = request.auth.credentials.userId;
  var streamId = request.payload.streamId;
  var comment = {
    content: request.payload.comment.message,
    createdAt: request.payload.comment.time
  };

  Service.createComment(userId, streamId, comment)
    .then((result) => {
      if (result instanceof Error) {
        return reply(Boom.badRequest(result.message));
      }

      return reply({status: 'OK'});
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
      time: Joi.number()
    })
  }
};
