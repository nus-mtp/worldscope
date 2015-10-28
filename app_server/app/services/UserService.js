var rfr = require('rfr');

var Utility = rfr('app/util/Utility');
var Storage = rfr('app/models/Storage');

var logger = Utility.createLogger(__filename);

function UserService() {
}

var Class = UserService.prototype;

Class.createNewUser = function(particulars) {
  logger.debug('Creating new user: %j', particulars);
  return Storage.createUser(particulars)
  .then(function receiveResult(result) {
    if (result) {
      return result.dataValues;
    }

    return null;
  });
};

Class.getUserByPlatform = function(platformType, platformId) {
  // TODO: Call Storage's API
  return new Promise(function (resolve, reject) {
    resolve(false);
  });
};

module.exports = new UserService();
