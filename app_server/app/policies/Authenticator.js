/**
 * Singleton used for authenticating users
 * @module app/policies/Authenticator
 */
var rfr = require('rfr');
var util = require('util');
var Promise = require('bluebird');
var bcrypt = Promise.promisifyAll(require('bcrypt'));

var SocialMediaAdapter = rfr('app/adapters/social_media/SocialMediaAdapter');
var Service = rfr('app/services/Service');
var Utility = rfr('app/util/Utility');

var logger = Utility.createLogger(__filename);

function Authenticator() {
}
var Class = Authenticator.prototype;

Class.ERRORS = {
  RETRIEVE_PROFILE: 'Error retrieving user\'s social media profile',
};

/**
 * Authenticate a user through a social media platform
 * @param platformType the name of the social media platform
 * @param credentials the user's credentials in that platform
 * @return {Promise} of the user's profile and credentials for worldscope
 *                   or null if failed to authenticate user
 */
Class.authenticateUser = function (platformType, credentials) {
  logger.info('Authenticating with %s', platformType);

  var profilePromise =
    Promise.method(function getSocialMediaAdapter() {
      return new SocialMediaAdapter(platformType, credentials);
    })().then(function (adapter) { return adapter.getUser(); });

  var userPromise = profilePromise.then(function receiveProfile(profile) {
    if (!profile || profile instanceof Error || !('id' in profile)) {
      throw new Error(Class.ERRORS.RETRIEVE_PROFILE + ' ' +
                      JSON.stringify(profile));
    }

    return Service.getUserByPlatform(platformType, profile.id);
  });

  return Promise.all([profilePromise, userPromise]).bind(this)
  .spread(function (profile, user) {
    if (!user || user instanceof Error) {
      return this.generateNewUser(platformType, profile, credentials);
    }

    return this.changeUserPassword(user);
  }).catch(function (err) {
    logger.debug(err);
    return err;
  });
};

/**
 * Generate a new user's particulars from a social media profile
 * and store in database
 * @param platformType {string}
 * @param profile {object}
 * @param credentials {object}
 * @return {Promise} of new user
 */
Class.generateNewUser = function (platformType, profile, credentials) {
  var generatedPassword = Utility.randomValueBase64(20);

  return bcrypt.genSaltAsync(10)
  .then(function generateHash(salt) {
    return bcrypt.hashAsync(generatedPassword, salt);
  }).then(function generateUser(hash) {
    var newUser = {
      platformType: platformType,
      platformId: profile.id,
      username: util.format('%s@%s', profile.id, platformType),
      password: hash,
      alias: profile.name,
      email: '',
      accessToken: credentials.accessToken
    };

    return newUser;
  }).then(function createNewUser(generatedUser) {
    return Service.createNewUser(generatedUser);
  }).then(function returnUser(user) {
    user.password = generatedPassword;
    return user;
  });
};

Class.changeUserPassword = function (user) {
  var generatedPassword = Utility.randomValueBase64(20);

  return bcrypt.genSaltAsync(10)
  .then(function generateHash(salt) {
    return bcrypt.hashAsync(generatedPassword, salt);
  }).then(function updateUser(hash) {
    return Service.updateUserParticulars(user.userId, {password: hash});
  }).then(function afterUpdateUser(updatedUser) {
    if (updatedUser) {
      user.password = generatedPassword;
      return user;
    }

    throw new Error('Unable to update password for user ' + user);
  });
};

module.exports = new Authenticator();
