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

Class.registerRoutes = function() {
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
    method: 'GET', path: '/{username}',
    config: {
      auth: {scope: Authenticator.SCOPE.ADMIN.ADMINS}
    },
    handler: this.getAdminByUsername
  });

  this.server.route({
    method: 'GET', path: '/',
    config: {
      auth: {scope: Authenticator.SCOPE.ADMIN.ADMINS}
    },
    handler: this.getListOfAdmins
  });

  this.server.route({
    method: 'POST', path: '/',
    config: {
      auth: {scope: Authenticator.SCOPE.ADMIN.ADMINS},
      validate: accountPayloadValidator
    },
    handler: this.createAdmin
  });

  this.server.route({
    method: 'PUT', path: '/{id}',
    config: {
      auth: {scope: Authenticator.SCOPE.ADMIN.ADMINS},
      validate: updatePayloadValidator
    },
    handler: this.updateAdmin
  });

  this.server.route({
    method: 'DELETE', path: '/{id}',
    config: {
      auth: {scope: Authenticator.SCOPE.ADMIN.ADMINS}
    },
    handler: this.deleteAdmin
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
    config: {
      auth: {scope: Authenticator.SCOPE.ADMIN.DEFAULT}
    },
    handler: this.logout
  });
};

/* Routes handlers */
Class.getAdminByUsername = function(request, reply) {
  Service.getAdminByUsername(request.params.username)
  .then(function(admin) {
    if (!admin || admin instanceof Error) {
      return reply(Boom.badRequest(
          'Unable to get user with id ' + request.params.username
      ));
    }

    admin.permissions = unwrapPermissionsFromDB(admin.permissions);
    return reply(Utility.clearUserProfile(admin));
  });
};

Class.getListOfAdmins = function(request, reply) {
  var filters = {
    order: request.query.order || 'asc'
  };

  Service.getListOfAdmins(filters).then(function(admins) {
    if (!admins || admins instanceof Error) {
      return reply(Boom.badRequest('Unable to get list of admins'));
    }

    return reply(admins);
  });
};

/*
Class.createRootAdmin = function(request, reply) {
  var generatedPassword = Utility.randomValueBase64(20);
  request.payload = {
    username: ROOT_ADMIN_USERNAME,
    password: generatedPassword,
    permissions: [
      Authenticator.SCOPE.ADMIN.METRICS,
      Authenticator.SCOPE.ADMIN.STREAMS,
      Authenticator.SCOPE.ADMIN.USERS,
      Authenticator.SCOPE.ADMIN.ADMINS,
      Authenticator.SCOPE.ADMIN.SETTINGS
    ]
  };
  Class.createAdmin(request, reply);
};
*/

Class.createAdmin = function(request, reply) {
  var permissions = request.payload.permissions;
  permissions = ensureDefaultAdminScope(permissions);
  permissions = wrapPermissionsForDB(permissions);

  var credentials = {
    username: request.payload.username,
    password: encrypt(request.payload.password),
    email: request.payload.email || null,
    permissions: permissions
  };

  Service.createNewAdmin(credentials)
  .then(function(admin) {
    if (!admin || admin instanceof Error) {
      return reply(Boom.badRequest('Unable to create admin ' + credentials));
    }

    // overwrite with unencrypted password
    admin.password = request.payload.password;
    admin.permissions = unwrapPermissionsFromDB(admin.permissions);
    reply(admin).created();
  });
};

Class.updateAdmin = function(request, reply) {
  var id = request.params.id;
  var password = request.payload.password;
  var particulars = request.payload;

  if (particulars.password) {
    particulars.password = encrypt(particulars.password);
  } else {
    // no password provided, don't change
    delete particulars.password;
  }

  particulars.permissions = ensureDefaultAdminScope(particulars.permissions);
  particulars.permissions = wrapPermissionsForDB(particulars.permissions);

  return Service.updateAdmin(id, particulars)
  .then(function(admin) {
    if (!admin || admin instanceof Error) {
      return reply(Boom.badRequest('Unable to update admin with id ' + id));
    }

    admin.permissions = unwrapPermissionsFromDB(admin.permissions);

    if (particulars.password) {
      // overwrite with unencrypted password
      admin.password = password;
      return reply(admin);
    } else {
      return reply(Utility.clearUserProfile(admin));
    }
  });
};

Class.deleteAdmin = function(request, reply) {
  var id = request.params.id;

  return Service.deleteAdmin(id)
  .then(function(result) {
    if (!result) {
      return reply(Boom.badRequest('Unable to delete admin with id ' + id));
    }

    return reply();
  });
};

Class.login = function(request, reply) {
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
      password: credentials.password,
      scope: unwrapPermissionsFromDB(admin.permissions)
    };

    return updateCache(request, account, function() {
      request.cookieAuth.set(account);

      // rewrite with unencrypted password
      admin.password = credentials.password;
      return reply(admin);
    });
  }).catch(function fail(err) {
    return reply(Boom.badRequest('Failed to authenticate admin: ' + err));
  });
};

Class.logout = function(request, reply) {
  request.server.app.cache.drop(request.auth.credentials.userId);
  request.cookieAuth.clear();
  return reply('Logged out');
};

/* Validator for routes */
var validPermissions = Joi.string().valid([
  Authenticator.SCOPE.ADMIN.DEFAULT,
  Authenticator.SCOPE.ADMIN.METRICS,
  Authenticator.SCOPE.ADMIN.STREAMS,
  Authenticator.SCOPE.ADMIN.USERS,
  Authenticator.SCOPE.ADMIN.ADMINS,
  Authenticator.SCOPE.ADMIN.SETTINGS
]);

var accountPayloadValidator = {
  payload: {
    username: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string().optional(),
    permissions: Joi.array().items(validPermissions).unique().default([])
  }
};

var updatePayloadValidator = {
  payload: {
    username: Joi.string().required(),
    password: Joi.string().optional(),
    email: Joi.string().optional(),
    permissions: Joi.array().items(validPermissions).unique().required()
  }
};

/* Helpers for everything above */
var encrypt = function(password) {
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

var updateCache = function(request, account, callback) {
  request.server.app.cache.set(account.userId, account, 0, function (err) {
    if (err) {
      logger.error(err);
    }

    return callback();
  });
};

var ensureDefaultAdminScope = function(scopes) {
  if (scopes.indexOf(Authenticator.SCOPE.ADMIN.DEFAULT) === -1) {
    scopes.push(Authenticator.SCOPE.ADMIN.DEFAULT);
  }
  return scopes;
};

var wrapPermissionsForDB = (permissionsArr) => permissionsArr.join(';');
var unwrapPermissionsFromDB = (permissions) => permissions.split(';');

exports.register = function(server, options, next) {
  var adminController = new AdminController(server, options);
  server.bind(adminController);
  adminController.registerRoutes();
  next();
};

exports.register.attributes = {
  name: 'AdminController'
};
