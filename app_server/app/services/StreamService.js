var rfr = require('rfr');
var util = require('util');

var Utility = rfr('app/util/Utility');
var Storage = rfr('app/models/Storage');

var logger = Utility.createLogger(__filename);

var streamBaseUrl = 'rtmp://multimedia.worldscope.tk:1935/live';
var viewBaseUrl = 'http://worldscope.tk:1935/live';

function StreamService() {
}

var Class = StreamService.prototype;

Class.ERRORS = {
  INVALID_USER: 'User account is invalid',
  INVALID_FIELDS: 'Missing or invalid parameters'
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
    logger.error('Error in stream creation: %j', err);
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

  return Storage.createStream(userId, streamAttributes)
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
  var streamValues = stream.dataValues;
  var streamLink = util.format('%s/%s/%s', streamBaseUrl,
                               streamValues.appInstance,
                               streamValues.streamId);
  streamValues.streamLink = streamLink;

  return streamValues;
};

/**
 * Formats to be viewed stream object
 * @param  {Sequelize<Stream>} stream
 * @return {Stream}
 */
var formatViewObject = function (stream) {
  var streamValues = stream.dataValues;
  var viewLink = util.format('%s/%s/%s.manifest.mpd', viewBaseUrl,
                             streamValues.appInstance,
                             streamValues.streamId);
  streamValues.viewLink = viewLink;

  return streamValues;
};

module.exports = new StreamService();
