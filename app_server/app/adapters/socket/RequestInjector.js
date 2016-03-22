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
  CREATE_COMMENT: '/api/comments',
  CREATE_VIEW: '/api/views'
};

/**
 * Creates a new comment in the main pipeline
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
      if (res.status === 'OK') {
        resolve(res.result);
      } else {
        logger.error('Error requesting interal route %s', options.url);
        reject(new Error(res.result));
      }
    });
  });
};

/**
 * Creates a new view in the main pipeline
 * @param credentials {Object} {userId: <string>}
 * @param streamId {string}
 * @return {Promise}
 */
Class.createView = function(credentials, streamId) {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'POST',
      url: `${RequestInjector.API_PATHS.CREATE_VIEW}/${streamId}`,
      credentials: credentials,
      allowInternals: true
    };

    logger.debug('Making internal request: %s', JSON.stringify(options)),
    this.server.inject(options, function(res) {
      if (res.statusCode === 200) {
        resolve(res.result);
      } else {
        logger.error('Error requesting interal route %s', options.url);
        reject(new Error(res.result));
      }
    });
  });
};

Class.updateStickers = function(credentials, msg) {
  return true;
};

module.exports = RequestInjector;
