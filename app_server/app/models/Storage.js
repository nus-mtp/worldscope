/*
 * Storage class is a singleton object and acts as a facade to the storage
 * internals.
 * @module Storage
 */
var rfr = require('rfr');
var Utility = rfr('app/util/Utility');
var logger = Utility.createLogger(__filename);
var _ = require('underscore');

/**
 * Initialises the database connection and load the models written in
 * modelArr. Model files have to be stored in the models directory
 * @constructor
 */
function Storage() {
  var config = rfr('config/DatabaseConfig');
  this.models = {};
  this.Sequelize = require('sequelize');

  // initialize database connection
  this.sequelize = new this.Sequelize(
      config.name,
      config.username,
      config.password, {
        host: config.host,
        dialect: config.dialect,
        logging: config.logging,
        define: {
          hooks: {
            beforeUpdate: isFieldsMatched
          }
        }
      });

  // load models
  var modelArr = [
    'User'
  ];

  // importing models
  for (var i = 0; i < modelArr.length; i++) {
    var modelName = modelArr[i];
    this.models[modelName] = this.sequelize.import(__dirname + '/' + modelName);
    logger.info(modelName + ' model imported');
  }

  // create the tables
  this.sequelize
    .sync()
    .then(function(res) {
      logger.info('Table synchronized');
    }, function(err) {
      if (err.parent.code === 'ER_NO_SUCH_TABLE') {
        logger.info('Building table');
      } else {
        logger.error('An error occurred while synchronizing table: %j', err);
      }
    });
}

var Class = Storage.prototype;

/**
 * @param  {object} particulars
 * @param  {string} particulars.username
 * @param  {string} particulars.password
 * @return {Promise<Sequelize.object> | False}
 */
Class.createUser = function(particulars) {
  return this.models.User.create(particulars)
    .then(function(user) {
      return user;
    }).catch(function(err) {
      logger.error('Error in creating user: %j', err);
      return false;
    });
};

/**
 * @param  {string} email - the user's email
 * @return {Promise<Sequelize.object> | False}
 */
Class.getUserByEmail = function(email) {
  return this.models.User.findOne({
    where: {
      email: email
    }
  }).then(function(res) {
    if (res === null) {
      logger.info('No such user');
      return false;
    } else {
      return res;
    }
  }).catch(function(err) {
    logger.error('Error in retrieving user: %j', err);
    return false;
  });
};

/**
 * @param  {string} userId
 * @return {Promise<Sequelize.object> | False}
 */
Class.getUserById = function(userId) {
  return this.models.User.findById(userId).then(function(res) {
    if (res === null) {
      logger.info('No such user: %s', userId);
      return false;
    } else {
      return res;
    }
  }).catch(function(err) {
    logger.error('Error in retrieving user: %j', err);
    return false;
  });
};

/**
 * @param  {string} platformType
 * @param  {string} platformId
 * @return {Promise<Sequelize.object> | False}
 */
Class.getUserByPlatformId = function(platformType, platformId) {
  return this.models.User.findOne({
    where: {
      platformType: platformType,
      platformId: platformId
    }
  }).then(function(res) {
    if (res === null) {
      logger.info('No such user at %s with id %s', platformType, platformId);
      return false;
    } else {
      return res;
    }
  }).catch(function(err) {
    logger.error('Error in retrieving user: %j', err);
    return false;
  });
};

/**
 * @param  {string} username
 * @param  {string} password
 * @return {Promise<Sequelize.object> | False}
 */
Class.getUserByUsernamePassword = function(username, password) {
  return this.models.User.findOne({
    where: {
      username: username,
      password: password
    }
  }).then(function(res) {
    if (res === null) {
      logger.info('No user found');
      return false;
    } else {
      return res;
    }
  }).catch(function(err) {
    logger.error('Error in retrieving user: %j', err);
    return false;
  });
};

/**
 * @param  {string} userId
 * @return {boolean}
 */
Class.deleteUserById = function(userId) {
  return this.getUserById(userId)
    .then(function(user) {
      user.destroy();
    })
    .then(function() {
      logger.info('User deleted');
      return true;
    })
    .catch(function(err) {
      logger.error('Error in deleting user: %j', err);
      return false;
    });
};

/**
 * @param  {string}
 * @param  {object} newParticulars
 * @param  {string} newParticulars.username
 * @param  {string} newParticulars.password
 * @return {Promise<Sequelize.object>} on success
           {Error} on fail
 */
Class.updateParticulars = function(userId, newParticulars) {
  return this.getUserById(userId).then(function(user) {
    return user.update(newParticulars, {
      fields: Object.keys(newParticulars)
    });
  });
};

/**
 * @return {Promise<List<Sequelize.object>>} - a list of users
 *         {False} on fail
 */
Class.getListOfUsers = function() {
  return this.models.User.findAll({
    order: [['username', 'ASC']]
  }).catch(function(err) {
    logger.error('Error in fetching list of users: %j', err);
    return false;
  });
};

/**
 * Check if the fields to be changed match the fields available in object
 * @private
 */
function isFieldsMatched(user, options, fn) {
  var fieldsToChange = options.fields;
  var index = fieldsToChange.indexOf('updatedAt');

  if (index > -1) {
    fieldsToChange.splice(index, 1);
  }

  if (user.changed() === false ||
      !_.isEqual(user.changed().sort(), fieldsToChange.sort())) {
    return fn('Invalid parameters');
  } else {
    return fn();
  }
}

module.exports = new Storage();
