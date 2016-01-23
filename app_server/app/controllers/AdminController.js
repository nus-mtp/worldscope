/**
 * Admin Controller
 * @module AdminController
 */
var rfr = require('rfr');
var Joi = require('joi');
var Boom = require('boom');

var Utility = rfr('app/util/Utility');
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
      auth: false
    },
    handler: this.createAdmin
  });
};

/* Routes handlers */
Class.createAdmin = function (request, reply) {
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
