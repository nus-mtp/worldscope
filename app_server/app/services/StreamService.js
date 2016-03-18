/**
 * @module StreamService
 */
'use strict';

var rfr = require('rfr');

var CustomError = rfr('app/util/Error');
var Utility = rfr('app/util/Utility');
var Storage = rfr('app/models/Storage');
var SocketAdapter = rfr('app/adapters/socket/SocketAdapter');
var MediaServerAdapter = rfr('app/adapters/MediaServerAdapter');
var ServerConfig = rfr('config/ServerConfig');

var logger = Utility.createLogger(__filename);

function StreamService() {
  let mediaConfig = ServerConfig.mediaServer;
  this.mediaServerAdapter = new MediaServerAdapter(
    mediaConfig.host, mediaConfig.username, mediaConfig.password);

  Storage.dbSyncPromise.then((status) => {
    if (status) {
      this.createChatRoomsForLiveStreams();
    }
  });
}

var Class = StreamService.prototype;

Class.createNewStream = function(userId, streamAttributes) {
  logger.info('Creating new stream: ', streamAttributes);

  return Storage.createStream(userId, streamAttributes)
    .then((result) => {
      if (result) {
        initializeChatRoomForStream(result);
        return Utility.formatStreamObject(result, 'stream');
      }

      return null;
    }).catch(function(err) {
      logger.error('Error in stream creation ', err);
      if (err.name === 'SequelizeValidationError' ||
          err.message === 'Validation error') {
        return new CustomError.InvalidFieldError(err.errors[0].message,
                                                 err.errors[0].path);
      } else if (err.name === 'TypeError') {
        return new CustomError.NotFoundError('User');
      } else {
        return new CustomError.UnexpectedError(err);
      }
    });
};

Class.getStreamById = function(streamId) {
  logger.debug('Getting stream by Id: %j', streamId);

  return Storage.getStreamById(streamId).then(function receiveResult(result) {
    if (result) {
      return Utility.formatStreamObject(result, 'view');
    } else {
      return new CustomError.NotFoundError('Stream', streamId);
    }
  });
};

Class.getListOfStreams = function(filters, userId) {
  logger.debug('Getting list of streams for user %s with filters: %j',
               userId, filters);

  // not include subscribers
  if (!userId) {
    return Storage.getListOfStreams(filters, userId)
    .then(function receiveResult(results) {
      if (results) {
        return results.map((singleStream) =>
          Utility.formatStreamObject(singleStream, 'view'));

      } else {
        return new CustomError.NotFoundError('Stream');
      }
    }).catch(function(err) {
      logger.error(err);
      return null;
    });
  }

  // include subscribers
  return Storage.getListOfStreamsForUser(filters)
    .then(function receiveResult(results) {
      if (results) {
        results = results.map((singleStream) =>
          Utility.formatStreamObject(singleStream, 'view'));

        // Allocate isSubscribedField
        results = addIsSubscribedField(userId, results);

        return results;
      } else {
        return new CustomError.NotFoundError('Stream');
      }
    }).catch(function(err) {
      logger.error(err);
      return null;
    });
};

/**
 * Gets a list of streams from a user's subscriptions
 * @param userId {string}
 */
Class.getStreamsFromSubscriptions = function(userId) {
  logger.debug('Getting streams from subscriptions for user %s', userId);

  return Storage.getStreamsFromSubscriptions(userId)
    .then(function receiveResult(results) {
      if (results) {
        return results.map((singleStream) =>
          Utility.formatStreamObject(singleStream, 'view'));
      } else {
        var err = new CustomError.NotFoundError('Stream');
        logger.error(err.message);
        return err;
      }
    }).catch(function(err) {
      logger.error(err);
      return null;
    });
};

/**
 * Updates a stream. Used for admin updates and end stream
 * @param streamId {string}
 * @param updates  {object}
 */
Class.updateStream = function(streamId, updates) {
  logger.debug('Updating stream %s with updates: %j', streamId, updates);

  return Storage.updateStream(streamId, updates)
    .then(function receiveResult(result) {
      return Utility.formatStreamObject(result, 'stream');
    }).catch(function(err) {
      logger.error(err);

      if (err.name === 'SequelizeValidationError') {
        return new CustomError.InvalidFieldError(err.errors[0].message,
                                                 err.errors[0].path);
      } else if (err.name === 'TypeError') {
        return new CustomError.NotFoundError('Stream', streamId);
      } else if (err.name === 'InvalidColumnError') {
        return err;
      } else {
        return new CustomError.UnexpectedError(err);
      }
    });
};

/**
 * Ends a stream only for a stream's owner
 * @param streamId {string}
 * @param updates  {object}
 */
Class.endStream = function(userId, streamId) {
  logger.debug('Ending stream: %s', streamId);

  // Check that userId is the owner of the stream
  return Storage.getStreamById(streamId)
  .then((stream) => {
    if (stream.owner !== userId) {
      return new CustomError.NotAuthorisedError('Not authorised to end stream');
    }

    return Storage.updateTotalViews(streamId)
    .then(() => Storage.updateStream(streamId, {live: false}))
    .then((res) => {
      closeChatRoomForStream(stream.appInstance);
      return 'Success';
    });
  }).catch((err) => {
    logger.error(err);
    if (err.name === 'TypeError') {
      return new CustomError.NotFoundError('Stream', streamId);
    }
  });
};

Class.deleteStream = function(streamId) {
  logger.debug('Deleting stream: %s', streamId);

  return Storage.deleteStream(streamId)
    .then((res) => {
      if (res === false) {
        return new CustomError.NotFoundError('Stream');
      }

      return res;
    });
};

Class.stopStream = function(appName, appInstance, streamId) {
  return this.updateStream(streamId, {live: false})
  .then((stream) => {
    if (!stream || stream instanceof Error) {
      return stream;
    }
    if (stream.appInstance !== appInstance) {
      return new Error('appInstance parameter does not match streamId');
    }
    closeChatRoomForStream(appInstance);
    return this.mediaServerAdapter.stopStream(appName, appInstance, streamId);
  }).catch((err) => {
    return err;
  });
};

Class.createChatRoomsForLiveStreams = function() {
  var filters = {
    state: 'live',
    sort: 'title',
    order: 'desc'
  };
  this.getListOfStreams(filters, null)
  .then((liveStreams) => {
    for (var i in liveStreams) {
      initializeChatRoomForStream(liveStreams[i]);
    }
  })
  .catch((err) => {
    logger.error('Error getting list of live streams to create rooms', err);
  });
};

/**
 * Creates a new chat room for a new stream and add the streamer to that room
 * @param userId {string}
 * @param streamAttributes {object}
 */
function initializeChatRoomForStream(streamAttributes) {
  try {
    let room = SocketAdapter.createNewRoom(streamAttributes.appInstance,
                                           streamAttributes.streamId);
    if (!room || room instanceof Error) {
      logger.error('Unable to create new chat room for stream %s',
                   streamAttributes.title);
    }
  } catch (e) {
    logger.error('Unable to create new chat room for stream %s',
                 e.message);
  }
}

/**
 * Creates a new chat room for a new stream and add the streamer to that room
 * @param appInstance {string}
 */
function closeChatRoomForStream(appInstance) {
  try {
    if (!SocketAdapter.isInitialized) {
      logger.error('SocketAdapter is not isInitialized');
      return;
    }
    SocketAdapter.closeRoom(appInstance);
  } catch (e) {
    logger.error('Unable to close new chat room for stream %s',
                 e.message);
  }
}

/**
 * Add isSubscribedField = true if userId is in subscribers
 * @param userId  {string}
 * @param results {Object}
 */
var addIsSubscribedField = function(userId, results) {
  for (var i = 0; i < results.length; i++) {
    var aStream = results[i];

    var subscriberIds = aStream.streamer.Subscribers.map((user) => user.userId);
    if (subscriberIds.indexOf(userId) > -1) {
      aStream.streamer.isSubscribed = true;
    } else {
      aStream.streamer.isSubscribed = false;
    }

    delete aStream.streamer.Subscribers;
  }
  return results;
};

module.exports = new StreamService();
