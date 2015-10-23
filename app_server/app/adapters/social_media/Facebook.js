/**
 * Facebook platform
 * @module app/adapters/social_media/Facebook
 */

var rfr = require('rfr');
var util = require('util');

var Utility = rfr('app/util/Utility');
var Platform = rfr('app/adapters/social_media/Platform');

var logger = Utility.createLogger(__filename);

/**
 * Create a new Facebook platform
 * @constructor Facebook
 * @param options {object} options including accessToken
 * @return {Facebook}
 */
function Facebook(options) {
  var FACEBOOK_API_URL = 'https://graph.facebook.com';

  Platform.call(this, FACEBOOK_API_URL);

  if (!options.accessToken) {
    var errorMsg = 'Facebook platform requires an access token';
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  this.accessToken = options.accessToken;
  this.apiVersion = 'v2.5';
}
util.inherits(Facebook, Platform);
var Class = Facebook.prototype;

Class.getUser = function () {
  return this.__makeAPICall(util.format('/%s/me', this.apiVersion),
                            {'access_token': this.accessToken});
};

module.exports = Facebook;
