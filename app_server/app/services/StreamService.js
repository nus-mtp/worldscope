var rfr = require('rfr');

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
        return Utility.formatStreamObject(result);
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
      return Utility.formatViewObject(result);
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
      return result.map(Utility.formatViewObject);
    } else {
      return Promise.resolve(new CustomError
        .NotFoundError('Stream not found'));
    }
  }).catch(function(err) {
    logger.error(err);
    return null;
  });
};

module.exports = new StreamService();
