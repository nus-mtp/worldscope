/**
 * CommentController
 * @module CommentController
 */
var rfr = require('rfr');
var Joi = require('joi');
var Boom = require('boom');

var Utility = rfr('app/util/Utility');

var logger = Utility.createLogger(__filename);

function CommentController(server, options) {
  this.server = server;
  this.options = options;
}

var Class = CommentController.prototype;

Class.registerRoutes = function () {
  this.server.route({method: 'POST', path: '/', config: {isInternal: true},
                     handler: this.createNewComment});
};

Class.createNewComment = function (request, reply) {
  logger.debug(request.auth.credentials.username + ' say ' +
               request.payload.comment);
  reply('OK');
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
