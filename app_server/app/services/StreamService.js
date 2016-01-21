var rfr = require('rfr');

var Utility = rfr('app/util/Utility');
var Storage = rfr('app/models/Storage');

var logger = Utility.createLogger(__filename);

var streamBaseUrl = 'multimedia.worldscope.tk:1935/live/'
var viewBaseUrl = 'http://worldscope.tk:1935/live/streamkey/manifest.mpd'

function StreamService() {
}

var Class = StreamService.prototype;

Class.createNewStream = function (userId, streamAttributes) {
  logger.debug('Creating new stream: %j', streamAttributes);

  return Storage.createStream(userId, streamAttributes)
    .then(function receiveResult(result) {
      if (result) {
        return formatStreamObject(result, streamBaseUrl);
      }

    return null;
  });
};

Class.getStreamById = function (streamId) {
  logger.debug('Getting stream by Id: %j', streamId);

  return Storage.createStream(userId, streamAttributes)
    .then(function receiveResult(result) {
      if (result) {
        return formatStreamObject(result, viewBaseUrl);
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
var formatStreamObject = function (stream, baseUrl) {
  var formattedStream = stream.dataValues;
  formattedStream.streamLink = baseUrl + formattedStream.appInstance +
                               formattedStream.streamId
  return formattedStream;
};

module.exports = new StreamService();
