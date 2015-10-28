/**
 * Singleton used for authenticating users
 * @module app/policies/Authenticator
 */

var rfr = require('rfr');
var util = require('util');
var Promise = require('bluebird');

var SocialMediaAdapter = rfr('app/adapters/social_media/SocialMediaAdapter');
var Service = rfr('app/services/Service');
var Utility = rfr('app/util/Utility');

var logger = Utility.createLogger(__filename);

function Authenticator() {
}
var Class = Authenticator.prototype;

Class.ERRORS = {
  RETRIEVE_PROFILE: 'Error retrieving user\'s social media profile'
};

/**
 * Authenticate a user through a social media platform
 * @param platformType the name of the social media platform
 * @param credentials the user's credentials in that platform
 * @return {Promise} of the user's profile and credentials for worldscope
 *                   or null if failed to authenticate user
 */
Class.authenticateUser = function (platformType, credentials) {
  var socialMediaAdapter = new SocialMediaAdapter(platformType, credentials);

  var profilePromise = socialMediaAdapter.getUser();
  var userPromise = profilePromise.then(function receiveProfile(profile) {
    if (!profile || profile instanceof Error || !('id' in profile)) {
      throw new Error(Class.ERRORS.RETRIEVE_PROFILE);
    }

    return Service.getUserByPlatform(platformType, profile.id);
  });

  return Promise.all([profilePromise, userPromise])
  .spread(function (profile, user) {
    if (!user || user instanceof Error) {
      var newUser = {
        platformType: platformType,
        platformId: profile.id,
        username: util.format('%s@%s', profile.id, platformType),
        password: 'to_be_generated', // TODO
        alias: profile.name,
        email: '',
        accessToken: credentials.accessToken
      };
      return Service.createNewUser(newUser);
    }

    return user;
  }).catch(function (err) {
    logger.debug(err);
    return err;
  });
};

module.exports = new Authenticator();
