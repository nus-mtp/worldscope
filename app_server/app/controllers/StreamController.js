/**
 * Stream Controller
 * @module StreamController
 */
var rfr = require('rfr');
var Joi = require('joi');
var Boom = require('boom');
var Promise = require('bluebird');
var bcrypt = Promise.promisifyAll(require('bcrypt'));

var Service = rfr('app/services/Service');

var logger = Utility.createLogger(__filename);

function StreamController(server, options) {
  this.server = server;
  this.options = options;
}

var Class = StreamController.prototype;

Class.registerRoutes = function () {
  this.server.route({method: 'GET', path: '/',
                     handler: this.getListOfStreams});

  this.server.route({method: 'GET', path: '/{id}',
                     config: {validate: singleStreamValidator},
                     handler: this.getStreamById});

  this.server.route({method: 'POST', path: '/',
                     config: {validate: streamCreatePayloadValidator},
                     handler: this.createStream});
};

/* Routes handlers */
Class.createStream = function (request, reply) {

  var userId = request.auth.credentials.userId;
  var currTime = Date.now();

  return bcrypt.genSaltAsync(10).then(function generateHash(salt) {
    return bcrypt.hashAsync(userId + currTime, salt);
  }).then(function generateStream(hash) {
    var newStream = {
      title: request.payload.title,
      description: request.payload.description,
      createdAt: currTime,
      appInstance: hash
    };
    return newStream;
  }).then(function createNewStream(newStream) {
    return Service.createNewStream(newStream);
  }).then(function returnStream(stream) {
    var streamLink = stream.appInstance + stream.streamId;
    return reply(streamLink);
  });
};

Class.getListOfStreams = function (request, reply) {
  Service.getListOfStreams().then(function(listStreams) {
    if(!listStreams || listStreams instanceof Error) {
      reply(Boom.badRequest('Unable to get streams');
      return;
    }

    reply(listStreams);
  })
};

Class.getStreamById = function (request, reply) {
  Service.getStreamById(request.params.id).then(function(stream) {
    if (!stream || stream instanceof Error) {
      reply(Boom.badRequest('Unable to get stream with id ' +
                            request.params.id));
      return;
    }

    reply(stream);
  });
};

/* Validator for routes */
var singleStreamValidator = {
  params: {
    id: Joi.string().required()
  }
};

// TODO: more validators
var streamCreatePayloadValidator = {
  payload: {
    title: Joi.string().required().max(50),
    description: Joi.string()
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
