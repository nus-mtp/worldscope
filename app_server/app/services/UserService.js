var rfr = require('rfr');

var Utility = rfr('app/util/Utility');
var Storage = rfr('app/models/Storage');

var logger = Utility.createLogger(__filename);

function UserService() {
}

var Class = UserService.prototype;

Class.createNewUser = function (particulars) {
  logger.debug('Creating new user: %j', particulars);

  return Storage.createUser(particulars)
  .then(function receiveResult(result) {
    if (result) {
      return result.dataValues;
    }

    return null;
  });
};

Class.getUserByPlatform = function (platformType, platformId) {
  logger.debug('Getting user by platform: %s %s', platformType, platformId);

  return Storage.getUserByPlatformId(platformType, platformId)
  .then(function receiveResult(result) {
    if (result) {
      return result.dataValues;
    }

    return null;
  });
};

Class.getUserById = function (id) {
  logger.debug('Getting user by id: %s', id);

  return Storage.getUserById(id)
  .then(function receiveResult(result) {
    if (result) {
      return result.dataValues;
    }

    return null;
  });
};

Class.updateParticulars = function (userId, particulars) {
  return Storage.updateParticulars(userId, particulars)
  .then(function receiveUser(user) {
    if (!user || user instanceof Error) {
      logger.error('Unable to update user particulars %s %j: %j',
                   userId, particulars, user);
      return null;
    }

    return user.dataValues;
  }).catch(function fail(err) {
    logger.error('Unable to update user particulars %s %j: %j',
                 userId, particulars, err);
    return null;
  });
};

module.exports = new UserService();
