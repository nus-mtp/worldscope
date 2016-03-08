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

///// VIEW RELATED ////
Class.createView = function(userId, streamId) {
  return Storage.createView(userId, streamId).then(function(res) {
    if (!res) {
      logger.error('Unable to create view');

      return new CustomError.NotFoundError('Stream not found');
    }
    return res.dataValues;

  }).catch(function(err) {
    logger.error('Unable to create view: %j', err);

    if (err.name === 'TypeError') {
      return new CustomError.NotFoundError('User not found');
    } else {
      return new CustomError.UnknownError();
    }
  });
};

/**
 * Gets the list of users watching a particular stream.
 * @param streamId {string}
 * @return {Promise<Array<User>>||null}
 */
Class.getListOfUsersViewingStream = function(streamId) {
  logger.debug('Getting list of users watching stream: %s', streamId);

  return Storage.getListOfUsersViewingStream(streamId)
    .then(function receiveResult(result) {
      if (result) {
        return result.map(
          function(singleUser) {
            singleUser = singleUser.dataValues;
            delete singleUser.View;
            return Utility.formatUserObject(singleUser);
          });
      }

      return null;
    }).catch(function(err) {
      logger.error('Unable to get list of users viewing stream: %j', err);
      return null;
    });
};

/**
 * Gets the number of users who have viewed a particular stream.
 * @param streamId {string}
 * @return {Promise<Number>}
 */
Class.getTotalNumberOfUsersViewedStream = function(streamId) {
  logger.debug('Getting total number of users who viewed a stream: %s',
                streamId);

  return Storage.getTotalNumberOfUsersViewedStream(streamId)
    .then(function receiveResult(result) {
      return result;
    });
};

///// SUBSCRIPTION RELATED ////
/**
 * Gets the number of users who have viewed a particular stream.
 * @param subscribeFrom {string} userId of subscriber
 * @param subscribeTo   {string} userId of user being subscribed
 * @return {Promise<Subscription>}
 */
Class.createSubscription = function(subscribeFrom, subscribeTo) {
  logger.debug('Subscribing from user %s to user %s',
                subscribeFrom, subscribeTo);

  return Storage.createSubscription(subscribeFrom, subscribeTo)
    .then(function receiveResult(result) {
      if (!result || result instanceof Error) {
        return result;
      }
      return Utility.changeToUnixTime(result.dataValues);
    });
};

/**
 * Gets the list of subscriptions that a user has subscribed to.
 * @param userId {string}
 * @return {Promise<List<User>>}
 */
Class.getSubscriptions = function(userId) {
  logger.debug('Getting subscriptions for user %s', userId);

  return Storage.getSubscriptions(userId)
    .then(function receiveResult(result) {
      if (!result || result instanceof Error) {
        return result;
      }
      return result.map((singleUser) => {
        singleUser = singleUser.dataValues;
        delete singleUser.Subscription;
        return Utility.formatUserObject(singleUser);
      });
    });
};

/**
 * Gets the list of subscriptions that a user has subscribed to.
 * @param userId {string}
 * @return {Promise<List<User>> || Error}
 */
Class.getSubscribers = function(userId) {
  logger.debug('Getting subscribers for user %s', userId);

  return Storage.getSubscribers(userId)
    .then(function receiveResult(result) {
      if (!result || result instanceof Error) {
        return result;
      }
      return result.map((singleUser) => {
        singleUser = singleUser.dataValues;
        delete singleUser.Subscription;
        return Utility.formatUserObject(singleUser);
      });
    });
};

/**
 * @param  {string} subscribeFrom - userId of one who is subscribing
 * @param  {string} subscribeTo - userId of the one being subscribed to
 * @return {Promise<Boolean>}
 */
Class.deleteSubscription = function(subscribeFrom, subscribeTo) {
  logger.debug('Delete subscriptions');

  return Storage.deleteSubscription(subscribeFrom, subscribeTo)
    .then(function receiveResult(result) {
      return result;
    });
};

/**
 * @param  {string} userId
 * @param  {string} streamId
 * @param  {Object} commentObj
 * @param  {string} commentObj.content
 * @return {Promise<Comment>}
 */
Class.createComment = function(userId, streamId, comment) {
  logger.debug('Comment from user %s to stream %s',
                userId, streamId);

  comment = Utility.changeToJavascriptTime(comment);

  return Storage.createComment(userId, streamId, comment)
    .then(function receiveResult(result) {
      if (!result || result instanceof Error) {
        return result;
      }
      return Utility.changeToUnixTime(result.dataValues);
    }).catch(function(err) {
      logger.error('Unable to create comment: %j', err);

      if (err.name === 'SequelizeValidationError') {
        return new CustomError.InvalidFieldError(err.errors[0].message,
                                                 err.errors[0].path);
      } else {
        return new CustomError.UnknownError();
      }
    });

};

/**
 * @param  {string} streamId
 * @return {Promise<Array<Comment>>}
 */
Class.getListOfCommentsForStream = function(streamId) {
  logger.debug('Get list of comments for stream %s', streamId);

  return Storage.getListOfCommentsForStream(streamId)
    .then(function receiveResult(result) {
      if (!result || result instanceof Error) {
        return new CustomError.NotFoundError('Stream not found');
      }

      return result.map((res) => {
        res = Utility.changeToUnixTime(res.dataValues);
        delete res.deletedAt;
        return res;
      });

    });
};

module.exports = new UserService();
