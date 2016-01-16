/**
 * Facebook platform
 * @module app/adapters/social_media/Facebook
 */

var rfr = require('rfr');
var util = require('util');

var Utility = rfr('app/util/Utility');
var Platform = rfr('app/adapters/social_media/Platform');
var SocialMediaConfig = rfr('config/SocialMediaConfig');

var logger = Utility.createLogger(__filename);

/**
 * Create a new Facebook platform
 * @constructor Facebook
 * @param options {object} options including accessToken
 * @return {Facebook}
 */
function Facebook(options) {
  Platform.call(this, Facebook.FACEBOOK_API_URL);

  if (!options.accessToken) {
    var errorMsg = 'Facebook platform requires an access token';
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
  if (!options.appId || options.appId !== SocialMediaConfig.facebook.appId) {
    var errorMsg = 'App id for facebook does not match';
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  this.accessToken = options.accessToken;
  this.apiVersion = 'v2.5';
}
util.inherits(Facebook, Platform);
var Class = Facebook.prototype;

Facebook.FACEBOOK_API_URL = 'https://graph.facebook.com';

/**
 * Get a user's profile from facebook
 * @return {Promise} of a response JSON object or null if error
 */
Class.getUser = function () {
  return this.__makeAPICall(util.format('/%s/me', this.apiVersion),
                            {'access_token': this.accessToken});
};

module.exports = Facebook;
