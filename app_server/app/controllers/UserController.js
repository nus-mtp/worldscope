/**
 * User Controller
 * @module UserController
 */
var rfr = require('rfr');
var Joi = require('joi');
var Boom = require('boom');

var Utility = rfr('app/util/Utility');
var Authenticator = rfr('app/policies/Authenticator');
var SocialMediaAdapter = rfr('app/adapters/social_media/SocialMediaAdapter');

var logger = Utility.createLogger(__filename);

function UserController(server, options) {
  this.server = server;
  this.options = options;
  this.defaultPlatform = SocialMediaAdapter.PLATFORMS.FACEBOOK;
}
var Class = UserController.prototype;

Class.registerRoutes = function () {
  this.server.route({method: 'GET', path: '/',
                     handler: this.getListOfUsers});

  this.server.route({method: 'GET', path: '/{id}',
                     config: {validate: singleUserValidator},
                     handler: this.getUserById});

  this.server.route({method: 'POST', path: '/login',
                     config: {
                       auth: false,
                       validate: loginPayloadValidator
                     },
                     handler: this.login});

  this.server.route({method: 'POST', path: '/logout',
                     config: {auth: false},
                     handler: this.logout});
};

/* Routes handlers */
Class.getListOfUsers = function (request, reply) {
  reply('Hello Sharmine!');
};

Class.getUserById = function (request, reply) {
  Service.getUserById(request.params.id)
  .then(function (user) {
    if (!user || user instanceof Error) {
      reply(Boom.badRequest('Unable to get user with id '+ request.params.id));
      return;
    }

    user = clearUserPrivateInfo(user);
    reply(user);
  });
};

Class.login = function (request, reply) {
  var credentials = {
    accessToken: request.payload.accessToken,
    appId: request.payload.appId
  };

  return Authenticator.authenticateUser(this.defaultPlatform, credentials)
  .then(function afterAuthentication(user) {
    if (!user || user instanceof Error) {
      return reply(Boom.unauthorized('Failed to authenticate user ' + user));
    }

    var account = {
      userId: user.userId,
      username: user.username,
      password: user.password
    };

    request.server.app.cache.set(account.userId, account, 0, function (err) {
      if (err) {
        return reply(Boom.badImplementation(err.message));
      }

      request.cookieAuth.set(account);
      user = clearUserPrivateInfo(user);

      return reply(user);
    });
  }).catch(function fail(err) {
    return reply(Boom.unauthorized('Failed to authenticate user: ' + err));
  });
};

Class.logout = function (request, reply) {
  reply('Logged out!');
};

function clearUserPrivateInfo(user) {
  if (user.password) {
    delete user.password;
  }
  if (user.accessToken) {
    delete user.accessToken;
  }

  return user;
}

/* Validator for routes */
var singleUserValidator = {
  params: {
    id: Joi.string().guid()
  }
};

var loginPayloadValidator = {
  payload: {
    appId: Joi.string().required(),
    accessToken: Joi.string().required()
  }
};

exports.register = function (server, options, next) {
  var userController = new UserController(server, options);
  server.bind(userController);
  userController.registerRoutes();
  next();
};

exports.register.attributes = {
  name: 'UserController'
};
