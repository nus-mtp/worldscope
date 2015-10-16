/**
 * User Controller
 * @module UserController
 */
var Joi = require('joi');

function UserController(server, options) {
  this.server = server;
  this.options = options;
}
var Class = UserController.prototype;

Class.registerRoutes = function () {
  this.server.route({method: 'GET', path: '/',
                    handler: this.getListOfUsers});

  this.server.route({method: 'GET', path: '/{id}',
                    config: {validate: singleUserValidator},
                    handler: this.getUserById});

  this.server.route({method: 'POST', path: '/login',
                    handler: this.login});

  this.server.route({method: 'POST', path: '/logout',
                    handler: this.logout});
};

/* Routes handlers */
Class.getListOfUsers = function (request, reply) {
  reply('Hello Sharmine!');
};

Class.getUserById = function (request, reply) {
  reply('Hello ' + request.params.id + "!");
};

Class.login = function (request, reply) {
  reply('Logged in!');
};

Class.logout = function (request, reply) {
  reply('Logged out!');
};

/* Validator for routes */
var singleUserValidator = {
  params: {
    id: Joi.number().min(0)
  }
};

exports.register = function (server, options, next) {
  var userController = new UserController(server, options);
  userController.registerRoutes();
  next();
};

exports.register.attributes = {
  name: 'UserController'
};
