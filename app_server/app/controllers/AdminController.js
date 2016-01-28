/**
 * Admin Controller
 * @module AdminController
 */
var rfr = require('rfr');
var Joi = require('joi');
var Boom = require('boom');
var bcrypt = require('bcryptjs');

var Utility = rfr('app/util/Utility');
var Authenticator = rfr('app/policies/Authenticator');
var Service = rfr('app/services/Service');

var logger = Utility.createLogger(__filename);

function AdminController(server, options) {
  this.server = server;
  this.options = options;
}
var Class = AdminController.prototype;

var ROOT_ADMIN_USERNAME = 'root';

Class.registerRoutes = function () {
  /*
  this.server.route({
    method: 'POST', path: '/rootAdmin',
    config: {
      auth: false
    },
    handler: this.createRootAdmin
  });
  */

  this.server.route({
    method: 'POST', path: '/',
    config: {
      auth: {scope: Authenticator.SCOPE.ADMIN},
      validate: accountPayloadValidator
    },
    handler: this.createAdmin
  });

  this.server.route({
    method: 'POST', path: '/login',
    config: {
      auth: false,
      validate: accountPayloadValidator
    },
    handler: this.login
  });

  this.server.route({
    method: 'GET', path: '/logout',
    config: {auth: false},
    handler: this.logout
  });
};

/* Routes handlers */
/*
Class.createRootAdmin = function (request, reply) {
  var generatedPassword = Utility.randomValueBase64(20);
  request.payload = {
    username: ROOT_ADMIN_USERNAME,
    password: generatedPassword
  };
  Class.createAdmin(request, reply);
};
*/

Class.createAdmin = function (request, reply) {
  var credentials = {
    username: request.payload.username,
    password: encrypt(request.payload.password)
  };

  Service.createNewAdmin(credentials)
  .then(function (admin) {
    if (!admin || admin instanceof Error) {
      return reply(Boom.badRequest('Unable to create admin ' + credentials));
    }

    // overwrite with unencrypted password
    admin.password = request.payload.password;
    reply(admin).created();
  });
};

Class.login = function (request, reply) {
  var credentials = {
    username: request.payload.username,
    password: request.payload.password
  };

  return Authenticator.authenticateAdmin(credentials)
  .then(function afterAuthentication(admin) {
    if (!admin || admin instanceof Error) {
      return reply(Boom.unauthorized(
          'Failed to authenticate admin ' + credentials.username
      ));
    }

    var account = {
      userId: admin.userId,
      username: admin.username,
      password: admin.password,
      scope: Authenticator.SCOPE.ADMIN
    };

    request.server.app.cache.set(account.userId, account, 0, function (err) {
      if (err) {
        logger.error(err);
      }

      request.cookieAuth.set(account);

      // rewrite with unencrypted password
      admin.password = credentials.password;
      return reply(admin);
    });
  }).catch(function fail(err) {
    return reply(Boom.badRequest('Failed to authenticate admin: ' + err));
  });
};

Class.logout = function (request, reply) {
  request.cookieAuth.clear();
  return reply('Logged out');
};

/* Validator for routes */
var accountPayloadValidator = {
  payload: {
    username: Joi.string().required(),
    password: Joi.string().required()
  }
};

/* Helpers for everything above */
var encrypt = function (password) {
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

exports.register = function (server, options, next) {
  var adminController = new AdminController(server, options);
  server.bind(adminController);
  adminController.registerRoutes();
  next();
};

exports.register.attributes = {
  name: 'AdminController'
};
