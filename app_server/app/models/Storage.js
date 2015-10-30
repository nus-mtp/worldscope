/*
 * Storage class is a singleton object and acts as a facade to the storage
 * internals.
 * @module Storage
 */

var rfr = require('rfr');
var Utility = rfr('app/util/Utility');
var logger = Utility.createLogger(__filename);

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
        logging: config.logging
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
    .then(function(err) {
      logger.info('Table synchronized');
    }, function(err) {
      logger.info('An error occurred while synchronizing table:', err);
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
    email: email
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
    platformType: platformType,
    platformId: platformId
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
 * @return {boolean}
 */
Class.updateParticulars = function(userId, newParticulars) {
  return this.getUserById(userId)
    .then(function(user) {
      user.update(newParticulars, {
        fields: newParticulars.keys
      });
    })
    .then(function() {
      logger.info('User particulars updated');
      return true;
    })
    .catch(function(err) {
      logger.error('Error in updating user particulars');
      return false;
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

module.exports = new Storage();
