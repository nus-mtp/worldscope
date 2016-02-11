var rfr = require('rfr');

var Utility = rfr('app/util/Utility');
var Storage = rfr('app/models/Storage');
var CustomError = rfr('app/util/Error');

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
  logger.debug('Getting user by platform: %s %s', platformType, platformId);

  return Storage.getUserByPlatformId(platformType, platformId)
  .then(function receiveResult(result) {
    if (result) {
      return result.dataValues;
    }

    return null;
  });
};

Class.getUserById = function(id) {
  logger.debug('Getting user by id: %s', id);

  return Storage.getUserById(id)
  .then(function receiveResult(result) {
    if (result) {
      return result.dataValues;
    }

    return null;
  });
};

Class.getListOfUsers = function(filters) {
  logger.debug('Getting list of users with filters: %j', filters);

  return Storage.getListOfUsers(filters)
  .then(function receiveResult(result) {
    if (result) {
      return result.map((res) => res.dataValues);
    }

    logger.error('Unable to retrieve list of users');
    return null;
  });
};

Class.updateUser = function(userId, particulars) {
  return Storage.updateUser(userId, particulars)
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

Class.getNumberOfUsers = function() {
  return Storage.getNumberOfUsers();
};

Class.createView = function(userId, streamId) {
  return Storage.createView(userId, streamId).then(function(res) {
    if (!res) {
      logger.error('Unable to create view');
      return Promise.resolve(new CustomError
        .NotFoundError('Stream not found'));
    }
    return res.dataValues;

  }).catch(function(err) {
    if (err.name === 'TypeError') {
      return Promise.resolve(new CustomError
        .NotFoundError('User not found'));
    } else {
      Promise.resolve(new CustomError.UnknownError());
    }
  });
};

// Get list of users who are viewing this stream

module.exports = new UserService();
