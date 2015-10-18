/**
 * An generic class for a social media platform
 * @module app/adapters/social_media/Platform
 */

var rfr = require('rfr');
var _ = require('underscore');
var Promise = require('bluebird');
var Wreck = Promise.promisifyAll(require('wreck'));
var util = require('util');

var Utility = rfr('app/util/Utility');

var logger = Utility.createLogger(__filename);

function Platform(apiDomain) {
  this.apiDomain = apiDomain;
}
var Class = Platform.prototype;

/**
 * Making an API call to this.apiDoman
 * @param apiPath {string}
 * @param pathParams {object} object of string keys to string values
 * @param payload {object}
 * @return {Promise} a promise of response string
 */
Class.__makeAPICall = function makeAPICall(apiPath, pathParams, payload) {
    var paramsArr = _.map(pathParams, function(value, key) {
      return util.format('%s=%s', key, value);
    });

    var query = '?' + paramsArr.join('&');
    var request = this.apiDomain + apiPath + query;

    logger.info('Requesting: ' + request);

    return Wreck.getAsync(request, {json: 'force'})
    .spread(function processAPICallResponse(res, payload) {
      return payload;
    }).catch(function processAPICallError(err) {
      logger.error(util.format('Unable to make API request %s: %s',
                               request, err));
    });
};

module.exports = Platform;
