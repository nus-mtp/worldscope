var rfr = require('rfr');

var Utility = rfr('app/util/Utility');
var UserService = rfr('app/services/UserService');

var logger = Utility.createLogger(__filename);

function Service() {
}

var Class = Service.prototype;

Class.createNewUser = function (particulars) {
  logger.debug('Creating new user: %j', particulars);
  return UserService.createNewUser(particulars);
};

Class.getUserByPlatform = function (platformType, platformId) {
  return UserService.getUserByPlatform(platformType, platformId);
};

module.exports = new Service();
