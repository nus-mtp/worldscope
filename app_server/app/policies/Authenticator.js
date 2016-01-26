/**
 * Singleton used for authenticating users
 * @module app/policies/Authenticator
 */
var rfr = require('rfr');
var util = require('util');
var Promise = require('bluebird');
var bcrypt = Promise.promisifyAll(require('bcryptjs'));
var crypto = require('crypto');

var SocialMediaAdapter = rfr('app/adapters/social_media/SocialMediaAdapter');
var Service = rfr('app/services/Service');
var Utility = rfr('app/util/Utility');
var ServerConfig = rfr('config/ServerConfig');

var logger = Utility.createLogger(__filename);

function Authenticator() {
  this.SID = 'sid-worldscope';
}
var Class = Authenticator.prototype;

Class.ERRORS = {
  RETRIEVE_PROFILE: 'Error retrieving user\'s social media profile',
  INVALID_CREDENTIALS: 'Username or password is invalid',
  INVALID_SESSION: 'Session cookie is invalid',
  UNKNOWN_SCOPE: 'Unknown scope'
};

Class.SCOPE = {
  USER: 'user',
  ADMIN: 'admin',
  ALL: ['user', 'admin']
};

Class.CRYPTO = {
  METHOD: 'aes-256-ctr',
  ENCODING: 'base64'
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
    })().then((adapter) => adapter.getUser());

  var userPromise = profilePromise.then(function receiveProfile(profile) {
    if (!profile || profile instanceof Error || !('id' in profile)) {
      throw new Error(Class.ERRORS.RETRIEVE_PROFILE + ' ' +
                      JSON.stringify(profile));
    }

    return Service.getUserByPlatform(platformType, profile.id);
  });

  return Promise.join(profilePromise, userPromise, function (profile, user) {
    if (!user || user instanceof Error) {
      return Class.generateNewUser(platformType, profile, credentials);
    }

    return Class.updateUser(user, credentials);
  })
  .then((resultUser) => Class.generateUserToken(resultUser))
  .catch(function (err) {
    logger.debug(err);
    return err;
  });
};

Class.generateUserToken = function (user) {
  var cipher = crypto.createCipher(Class.CRYPTO.METHOD,
                                   ServerConfig.tokenPassword);
  var rawToken = util.format('%s;%s;%s', user.password,
                              user.userId, user.accessToken);

  var encrypted = cipher.update(rawToken, 'utf8', Class.CRYPTO.ENCODING);
  encrypted += cipher.final(Class.CRYPTO.ENCODING);
  user.password = encrypted;

  return user;
};

/**
 * Check if a user exists in database using the user's credentials
 * @param credentials {object} user's credentials
 * @return {bool} true if user exists
 */
Class.validateUser = function (credentials) {
  return Promise.resolve(true);
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
  var newUser = {
    platformType: platformType,
    platformId: profile.id,
    username: util.format('%s@%s', profile.id, platformType),
    password: Utility.randomValueBase64(20),
    alias: profile.name,
    accessToken: credentials.accessToken
  };

  return Service.createNewUser(newUser);
};

Class.updateUser = function (user, credentials) {
  var updatedFields = {
    accessToken: credentials.accessToken
  };

  return Service.updateUserParticulars(user.userId, updatedFields);
};

Class.verifyUserToken = function (user, token) {
  var decipher = crypto.createDecipher(Class.CRYPTO.METHOD,
                                       ServerConfig.tokenPassword);
  var rawToken = decipher.update(token, Class.CRYPTO.ENCODING, 'utf8');
  rawToken += decipher.final('utf8');

  var parsedToken = rawToken.split(';');
  return user.password === parsedToken[0] && user.userId === parsedToken[1];
};

/**
 * Authenticate an admin through username and password
 * @param credentials the user's credentials in that platform
 * @return {Promise} of the admin credentials for worldscope
 *                   or null if failed to authenticate admin
 */
Class.authenticateAdmin = function (credentials) {
  logger.info('Authenticating admin with %j', credentials);

  var adminPromise = Service.getAdminByUsername(credentials.username);
  var checkPassword = adminPromise.then(function checkPassword(admin) {
    if (admin) {
      return bcrypt.compareAsync(credentials.password, admin.password);
    }

    return false;
  });

  return Promise.join(adminPromise, checkPassword,
      function returnAuthenticationResult(admin, isAuthenticated) {
        return isAuthenticated ? admin : null;
      });
};

Class.validateAccount = function (server, session) {
  return Promise.resolve(session.userId)
  .then(function getAccountFromCache(userId) {
    if (!userId) {
      throw new Error(Class.ERRORS.INVALID_SESSION);
    }

    return new Promise(function (resolve, reject) {
      server.app.cache.get(userId, function (err, cached) {
        if (err) {
          logger.error(err);
          return resolve(null);
        }

        return resolve(cached || null);
      });
    });
  }).then(function receiveAccountFromCache(cached) {
    if (!cached) {
      return null;
    }

    return session.username === cached.username &&
           session.password === cached.password;
  }).then(function getAccountFromDatabase(cacheValidateResult) {
    if (cacheValidateResult) {
      return session;
    }

    return Service.getUserById(session.userId)
    .then(function receiveUser(user) {
      if (!user || user.username !== session.username) {
        return new Error(Class.ERRORS.INVALID_CREDENTIALS);
      }

      if (session.scope === Class.SCOPE.USER) {
        return Class.verifyUserToken(user, session.password);
      } else if (session.scope === Class.SCOPE.ADMIN) {
        return bcrypt.compareAsync(session.password, user.password);
      } else {
        return new Error(Class.ERRORS.UNKNOWN_SCOPE);
      }
    })
    .then(function compareResult(res) {
      if (!res) {
        return new Error(Class.ERRORS.INVALID_CREDENTIALS);
      }

      if (res instanceof Error) {
        return res;
      }

      server.app.cache.set(session.userId, session, 0,
                           function (err) {
                             if (err) {
                               logger.error(err);
                             }
                           });
      return session;
    });
  });
};

module.exports = new Authenticator();
