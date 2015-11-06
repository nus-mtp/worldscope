var rfr = require('rfr');

var Utility = rfr('app/util/Utility');
var UserService = rfr('app/services/UserService');

var logger = Utility.createLogger(__filename);

function Service() {
}

var Class = Service.prototype;

/////// USER APIs ///////
Class.createNewUser = function (particulars) {
  logger.debug('Creating new user: %j', particulars);
  return UserService.createNewUser(particulars);
};

Class.getUserByPlatform = function (platformType, platformId) {
  logger.debug('Getting user by platform %s %s', platformType, platformId);
  return UserService.getUserByPlatform(platformType, platformId);
};

Class.updateUserParticulars = function (userId, particulars) {
  logger.debug('Updating user particulars %s %j', userId, particulars);
  return UserService.updateParticulars(userId, particulars);
};
///////////////////////

module.exports = new Service();
