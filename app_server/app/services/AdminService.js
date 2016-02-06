var rfr = require('rfr');

var Utility = rfr('app/util/Utility');
var Storage = rfr('app/models/Storage');

var logger = Utility.createLogger(__filename);

function AdminService() {
}

var Class = AdminService.prototype;

Class.createNewAdmin = function(particulars) {
  logger.debug('Creating new admin: %j', particulars);

  return Storage.createUser(particulars)
  .then(function receiveResult(result) {
    if (result) {
      return result.dataValues;
    }

    return null;
  });
};

Class.getAdminByUsername = function(username) {
  logger.debug('Getting user by username: %s', username);

  return Storage.getUserByUsername(username)
  .then(function receiveResult(result) {
    if (result) {
      return result.dataValues;
    }

    return null;
  });
};

Class.getListOfAdmins = function(filters) {
  logger.debug('Getting list of admins with filters: %j', filters);

  return Storage.getListOfAdmins(filters)
  .then(function receiveResult(result) {
    if (result) {
      return result.map((res) => res.dataValues);
    }

    logger.error('Unable to retrieve list of admins');
    return null;
  });
};

Class.updateParticulars = function(id, particulars) {
  return Storage.updateUser(id, particulars)
  .then(function receiveAdmin(admin) {
    if (!admin || admin instanceof Error) {
      logger.error('Unable to update admin particulars %s %j: %j',
          id, particulars, admin);
      return null;
    }

    return admin.dataValues;
  }).catch(function fail(err) {
    logger.error('Unable to update admin particulars %s %j: %j',
        id, particulars, err);
    return null;
  });
};

Class.deleteAdminById = function(id) {
  return Storage.deleteUserById(id)
  .then(function receiveResult(result) {
    if (!result) {
      logger.error('Unable to delete admin %s', id);
    }

    return result;
  }).catch(function fail(err) {
    logger.error('Unable to delete admin %s: %j', id, err);
    return false;
  });
};

module.exports = new AdminService();
