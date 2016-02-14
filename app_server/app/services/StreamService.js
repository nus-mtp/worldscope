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
}

var Class = StreamService.prototype;

Class.createNewStream = function(userId, streamAttributes) {
  logger.debug('Creating new stream: %j', streamAttributes);

  return Storage.createStream(userId, streamAttributes)
    .then((result) => {
      if (result) {
        initializeChatRoomForStream(userId, streamAttributes);
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
        return new CustomError.NotFoundError('User not found');
      } else {
        return new CustomError.UnknownError();
      }
    });
};

Class.getStreamById = function(streamId) {
  logger.debug('Getting stream by Id: %j', streamId);

  return Storage.getStreamById(streamId).then(function receiveResult(result) {
    if (result) {
      return Utility.formatStreamObject(result, 'view');
    } else {
      return new CustomError.NotFoundError('Stream not found');
    }
  });
};

Class.getListOfStreams = function(filters) {
  logger.debug('Getting list of streams with filters: %j', filters);

  return Storage.getListOfStreams(filters)
    .then(function receiveResult(results) {
      if (results) {
        return results.map((singleStream) =>
          Utility.formatStreamObject(singleStream, 'view'));
      } else {
        return new CustomError.NotFoundError('Stream not found');
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
        return new CustomError.NotFoundError('Stream not found');
      } else if (err.name === 'InvalidColumnError') {
        return err;
      } else {
        return new CustomError.UnknownError();
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
    .then(function(stream) {
      if (stream.owner === userId) {
        return Storage.updateStream(streamId, {live: false})
          .then((res) => 'Success');
      } else {
        return new CustomError
          .NotAuthorisedError('Not authorised to end stream');
      }

    }).catch(function(err) {
      logger.error(err);
      if (err.name === 'TypeError') {
        return new CustomError.NotFoundError('Stream not found');
      }
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
    return this.mediaServerAdapter.stopStream(appName, appInstance, streamId);
  }).catch((err) => {
    return err;
  });
};

/**
 * Creates a new chat room for a new stream and add the streamer to that room
 * @param userId {string}
 * @param streamAttributes {object}
 */
function initializeChatRoomForStream(userId, streamAttributes) {
  if (!SocketAdapter.isInitialized) {
    logger.error('SocketAdapter is not isInitialized');
    return;
  }

  let room = SocketAdapter.createNewRoom(streamAttributes.appInstance);
  if (!room || room instanceof Error) {
    logger.error('Unable to create new chat room for stream %s',
                 streamAttributes.title);
  }
}

module.exports = new StreamService();
