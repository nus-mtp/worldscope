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
var Service = rfr('app/services/Service');

var logger = Utility.createLogger(__filename);

function UserController(server, options) {
  this.server = server;
  this.options = options;
  this.defaultPlatform = SocialMediaAdapter.PLATFORMS.FACEBOOK;
}
var Class = UserController.prototype;

Class.registerRoutes = function () {
  this.server.route({method: 'GET', path: '/',
                     config: {
                       auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.getListOfUsers});

  this.server.route({method: 'GET', path: '/{id}',
                     config: {
                       validate: singleUserValidator,
                       auth: {scope: Authenticator.SCOPE.ALL}
                     },
                     handler: this.getUserById});

  this.server.route({method: 'POST', path: '/login',
                     config: {
                       auth: false,
                       validate: loginPayloadValidator
                     },
                     handler: this.login});

  this.server.route({method: 'GET', path: '/logout',
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
      return reply(Boom.badRequest('Failed to authenticate user ' + user));
    }

    var account = {
      userId: user.userId,
      username: user.username,
      password: user.password,
      scope: Authenticator.SCOPE.USER
    };

    request.server.app.cache.set(account.userId, account, 0, function (err) {
      if (err) {
        logger.error(err);
      }

      request.cookieAuth.set(account);
      user = clearUserPrivateInfo(user);

      return reply(user);
    });
  }).catch(function fail(err) {
    return reply(Boom.badRequest('Failed to authenticate user: ' + err));
  });
};

Class.logout = function (request, reply) {
  request.cookieAuth.clear();

  if (request.auth.credentials) {
    var credentials = request.auth.credentials;
    request.server.app.cache.drop(credentials.userId,
                                  (err) => logger.error(err));
    Service.updateUserParticulars(credentials.userId, {password: ''})
    .then((updatedUser) => {
      if (!updatedUser) {
        logger.error('Failed to clear password: %j', updatedUser);
      }
    });
  }

  return reply('Logged out');
};

function clearUserPrivateInfo(user) {
  delete user.password;
  delete user.accessToken;

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
