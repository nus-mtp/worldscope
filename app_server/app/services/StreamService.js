var rfr = require('rfr');
var util = require('util');

var CustomError = rfr('app/util/Error');
var Utility = rfr('app/util/Utility');
var Storage = rfr('app/models/Storage');

var logger = Utility.createLogger(__filename);

function StreamService() {
}

var Class = StreamService.prototype;

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
    if (err.name === 'SequelizeValidationError' ||
        err.message === 'Validation error') {
      return Promise.resolve(new CustomError
        .InvalidFieldError(err.errors[0].message, err.errors[0].path));
    } else if (err.name === 'TypeError') {
      return Promise.resolve(new CustomError
        .NotFoundError('User not found'));
    } else {
      return Promise.resolve(new CustomError.UnknownError());
    }
  });
};

Class.getStreamById = function (streamId) {
  logger.debug('Getting stream by Id: %j', streamId);

  return Storage.getStreamById(streamId).then(function receiveResult(result) {
    if (result) {
      return formatViewObject(result);
    } else {
      return Promise.resolve(new CustomError
        .NotFoundError('Stream not found'));
    }
  });
};

Class.getListOfStreams = function(filters) {
  logger.debug('Getting list of streams with filters: %j', filters);

  return Storage.getListOfStreams(filters).then(function receiveResult(result) {
    if (result) {
      return result.map(formatViewObject);
    } else {
      return Promise.resolve(new CustomError
        .NotFoundError('Stream not found'));
    }
  }).catch(function(err) {
    logger.error('not supposed to enter here, reject at joi validate');
    logger.error(err);
    return null;
  });
};

/**
 * Formats to be streamed stream object
 * @param  {Sequelize<Stream>} stream
 * @return {Stream}
 */
var formatStreamObject = function (stream) {
  logger.debug('Format stream object');

  return new Promise(function(resolve) {
    var formattedStream = stream.dataValues;
    var streamLink = util.format('%s/%s/%s', Utility.streamBaseUrl,
                                 stream.appInstance,
                                 stream.streamId);
    formattedStream.streamLink = streamLink;
    resolve(formattedStream);
  });
};

/**
 * Formats to be viewed stream object
 * @param  {Sequelize<Stream>} stream
 * @return {Stream}
 */
var formatViewObject = function (stream) {
  logger.debug('Format view object');

  var formattedStream = stream.dataValues;
  var viewLink = util.format('%s/%s/%s/manifest.mpd', Utility.viewBaseUrl,
                             stream.appInstance,
                             stream.streamId);
  formattedStream.viewLink = viewLink;
  return formattedStream;

};

module.exports = new StreamService();
