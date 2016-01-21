var rfr = require('rfr');
var util = require('util');

var Utility = rfr('app/util/Utility');
var Storage = rfr('app/models/Storage');

var logger = Utility.createLogger(__filename);

function StreamService() {
}

var Class = StreamService.prototype;

Class.ERRORS = {
  INVALID_USER: 'User account is invalid',
  INVALID_FIELDS: 'Parameters is missing or invalid'
};

Class.createNewStream = function (userId, streamAttributes) {
  logger.debug('Creating new stream: %j', streamAttributes);

  return Storage.createStream(userId, streamAttributes)
    .then(function receiveResult(result) {
      if (result) {
        return formatStreamObject(result);
      }

    return null;
  }).catch(function(err) {
    logger.error('Error in stream creation ', err);
    if (err.name === 'SequelizeValidationError') {
      return Promise.resolve(Class.ERRORS.INVALID_FIELDS);
    } else if (err.name === 'TypeError') {
      return Promise.resolve(Class.ERRORS.INVALID_USER);
    } else {
      return Promise.reject(err);
    }
  });
};

Class.getStreamById = function (streamId) {
  logger.debug('Getting stream by Id: %j', streamId);

  return Storage.getStreamById(streamId)
    .then(function receiveResult(result) {
      if (result) {
        return formatViewObject(result);
      }

    return null;
  });
};

Class.getListOfStreams = function () {
  logger.debug('Getting list of streams');

  return 'test string';
};

/**
 * Formats to be streamed stream object
 * @param  {Sequelize<Stream>} stream
 * @return {Stream}
 */
var formatStreamObject = function (stream) {

  return new Promise(function(resolve) {
    var streamLink = util.format('%s/%s/%s', Utility.streamBaseUrl,
                                 stream.appInstance,
                                 stream.streamId);
    stream.streamLink = streamLink;
    resolve(stream);
  });
};

/**
 * Formats to be viewed stream object
 * @param  {Sequelize<Stream>} stream
 * @return {Stream}
 */
var formatViewObject = function (stream) {
  return new Promise(function(resolve) {
    var viewLink = util.format('%s/%s/%s.manifest.mpd', Utility.viewBaseUrl,
                               streamValues.appInstance,
                               streamValues.streamId);
    streamValues.viewLink = viewLink;
    resolve(stream);
  });
};

module.exports = new StreamService();
