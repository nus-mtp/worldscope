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
 * Initialises the datbase connection and load the models written in
 * modelArr. Model files have to be stored in the models directory
 * @constructor
 */
function Storage() {
  var Sequelize = require('sequelize');
  var config = rfr('config/DatabaseConfig');
  this.models = {};

  // initialize database connection
  this.sequelize = new Sequelize(
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
    .sync({force: true})
    .then(function(res) {
      logger.info('Table synchronized');
    }, function(err) {
      if (err.parent.code == 'ER_NO_SUCH_TABLE') {
        logger.info('Building table');
      } else {
        logger.error('An error occurred while synchronizing table');
      }
    });
}

var Class = Storage.prototype;

/**
 * @param  {object} particulars
 * @param  {string} particulars.username
 * @param  {string} particulars.password
 * @return {Promise<Sequelize.object>}
 */
Class.createUser = function(particulars) {
  return this.models.User.create(particulars)
    .catch(function(err) {
      logger.error('Error in creating user');
      return false;
    });
};

/**
 * @param  {string} email - the user's email
 * @return {Promise<Sequelize.object>}
 */
Class.getUserByEmail = function(email) {
  return this.models.User.findOne({
    where: {
      email: email
    }
  })
    .catch(function(err) {
      logger.error('Unable to retrieve user');
      return false;
    });
};

/**
 * @param  {string} userId
 * @return {Promise<Sequelize.object>}
 */
Class.getUserById = function(userId) {
  return this.models.User.findById(userId)
    .catch(function(err) {

      logger.error('Unable to retrieve user');
      return false;
    });
};

/**
 * @param  {string} platformType
 * @param  {string} platformId
 * @return {Promise<Sequelize.object>}
 */
Class.getUserByPlatformId = function(platformType, platformId) {
  return this.models.User.findOne({
    where: {
      platformType: platformType,
      platformId: platformId
    }
  })
    .catch(function(err) {
      logger.error('Unable to retrieve user');
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
      logger.error('Error in deleting user');
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
  return this.getUserById(userId)
    .then(function(user) {
      return user.update(newParticulars, {
        fields: Object.keys(newParticulars)
      });
    });
};

/**
 * @return {Promise<List<Sequelize.object>>} - a list of users
 */
Class.getListOfUsers = function() {
  return this.models.User.findAll({
    order: [['username', 'ASC']]
  })
    .catch(function(err) {
      logger.error('Error in fetching list of users');
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
