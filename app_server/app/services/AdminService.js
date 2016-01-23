var rfr = require('rfr');

var Utility = rfr('app/util/Utility');
var Storage = rfr('app/models/Storage');

var logger = Utility.createLogger(__filename);

function AdminService() {
}

var Class = AdminService.prototype;

Class.createNewAdmin = function (particulars) {
  logger.debug('Creating new admin: %j', particulars);

  return Storage.createUser(particulars)
      .then(function receiveResult(result) {
        if (result) {
          return result.dataValues;
        }

        return null;
      });
};

Class.getAdminByUsername = function (username) {
  logger.debug('Getting user by username: %s', username);

  return Storage.getUserByUsername(username)
      .then(function receiveResult(result) {
        if (result) {
          return result.dataValues;
        }

        return null;
      });
};

module.exports = new AdminService();
