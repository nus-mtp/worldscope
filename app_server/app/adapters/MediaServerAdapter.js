/**
 * @module MediaServerAdapter
 */
'use strict';

var rfr = require('rfr');
var querystring = require('querystring');
var Promise = require('bluebird');
var Wreck = require('wreck');
var Xml2Js = Promise.promisifyAll(require('xml2js'));

var Utility = rfr('app/util/Utility');

var logger = Utility.createLogger(__filename);

/**
 * Creates a new adapter to communicate with the media server.
 * @param host {string} hostname and port of the media server
 * @param username {string} username to access the server
 * @param password {string} password to access the server
 */
function MediaServerAdapter(host, username, password) {
  this.host = host;
  let authToken = new Buffer(`${username}:${password}`, 'utf8');
  this.wreck = Promise.promisifyAll(Wreck.defaults({
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + authToken.toString('base64')
    }
  }), {multiArgs: true});
}

var Class = MediaServerAdapter.prototype;

/**
 * Makes POST request to media server at `path` with `data`
 * @param path {string}
 * @param data {Object}
 */
Class.__makePOST = function(path, data) {
  let url = `http://${this.host}${path}`;
  let payload = querystring.stringify(data);

  logger.info(`Requesting: ${url} with ${payload}`);
  return this.wreck.postAsync(url, {payload: payload, json: 'true'})
  .spread((res, payload) => {
    logger.info('Response from media server: ', payload);
    return payload;
  }).catch((err) => {
    logger.error('Unable to request media server at %s: ', url, err);
    return err;
  });
};

Class.__makeGET = function(path) {
  let url = `http://${this.host}${path}`;

  logger.info(`Requesting: ${url}`);
  return this.wreck.getAsync(url)
  .spread((res, payload) => {
    let response = payload.toString('utf8');
    return response;
  }).catch((err) => {
    logger.error('Unable to request media server at %s: ', url, err);
    return err;
  });
};

Class.stopStream = function(appName, appInstance, streamName) {
  let data = {
    stop: 1,
    app: appName,
    appInstance: appInstance,
    stream: streamName
  };

  return this.__makePOST('/control', data)
  .then((response) => {
    if (!response || response instanceof Error
        || !(response instanceof Object)) {
      return new Error('Failed to request media server ' + response);
    }

    if (response.status !== 'OK') {
      return new Error(response.message);
    }
  });
};

Class.getConnectionCounts = function(appName) {
  return this.__makeGET('/connectioncounts')
  .then((response) => {
    if (!response || response instanceof Error) {
      return new Error('Failed to request media server ' + response);
    }

    return Xml2Js.parseStringAsync(response, {
      valueProcessors: [Xml2Js.processors.parseNumbers],
      trim: true,
      explicitArray: false
    });
  });
}; 

module.exports = MediaServerAdapter;
