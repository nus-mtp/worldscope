/**
 * @module RequestInjector
 * Contain methods that inject REST API requests to the main pipeline
 * from socket adapter components
 */

var Promise = require('bluebird');
var rfr = require('rfr');

var Utility = rfr('app/util/Utility');

var logger = Utility.createLogger(__filename);

function RequestInjector(server) {
  this.server = server;
}

var Class = RequestInjector.prototype;

RequestInjector.API_PATHS = Class.API_PATHS = {
  CREATE_COMMENT: '/api/comments'
};

/**
 * Create a new comment in the main pipeline
 * @param credentials {Object} {userId: <string>}
 * @param msg {Object} {data: <comment>, streamId: <string>}
 * @return {Promise}
 */
Class.createComment = function(credentials, msg) {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'POST',
      url: RequestInjector.API_PATHS.CREATE_COMMENT,
      credentials: credentials,
      payload: {
        streamId: msg.streamId,
        comment: {
          alias: msg.message.alias,
          message: msg.message.message,
          time: msg.message.time
        }
      },
      allowInternals: true
    };

    logger.debug('Making internal request: %s', JSON.stringify(options)),
    this.server.inject(options, function(res) {
      res = JSON.parse(res.payload);
      if (res.status === 'OK') {
        resolve(res);
      } else {
        logger.error('Error requesting interal route %s', options.url);
        reject(res);
      }
    });
  });
};

Class.updateStickers = function(credentials, msg) {
  return true;
};

module.exports = RequestInjector;
