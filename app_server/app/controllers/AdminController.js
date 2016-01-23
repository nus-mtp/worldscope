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

Class.registerRoutes = function () {
  this.server.route({
    method: 'POST', path: '/',
    config: {
      auth: {scope: Authenticator.SCOPE.ADMIN}
    },
    handler: this.createAdmin
  });
};

/* Routes handlers */
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
