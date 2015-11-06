/**
 * Social Media Adapter
 * @module app/adapters/social_media/SocialMediaAdapter
 */

var rfr = require('rfr');
var util = require('util');

var Utility = rfr('app/util/Utility');
var Config = rfr('config/SocialMediaConfig');
var Facebook = rfr('app/adapters/social_media/Facebook');

var logger = Utility.createLogger(__filename);

/**
 * @constructor SocialMediaAdapter
 * @param platform {string} can be: "facebook"
 * @param options {object} options including accessToken
 * @return {object}
 */
function SocialMediaAdapter(platform, options) {
  if (platform === SocialMediaAdapter.PLATFORMS.FACEBOOK) {
    this.platform = new Facebook(options);
  } else {
    var errorMsg = util.format('Platform %s is not supported', platform);
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
}
var Class = SocialMediaAdapter.prototype;

SocialMediaAdapter.PLATFORMS = Class.PLATFORMS = {
  FACEBOOK: 'facebook'
};

/**
 * Get a user's profile from the social media platform
 * @return {Promise} promise of an user object
 */
Class.getUser = function () {
  return this.platform.getUser();
};

module.exports = SocialMediaAdapter;
