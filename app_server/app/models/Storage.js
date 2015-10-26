/*
 * Storage class is a singleton object and acts as a facade to the storage
 * internals.
 */

var rfr = require('rfr');
var Utility = rfr('app/util/Utility');
var logger = Utility.createLogger(__filename);

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

Class.createUser = function(particulars) {
  return this.models.User.create(particulars)
    .catch(function(err) {
      logger.error('Error in creating user');
      return false;
    });
};

Class.getUserByEmail = function(email) {
  return this.models.User.findOne({
    email: email
  })
    .catch(function(err) {
      logger.error('Unable to retrieve user');
      return false;
    });
};

Class.getUserById = function(userId) {
  return this.models.User.findById(userId)
    .catch(function(err) {
      logger.error('Unable to retrieve user');
      return false;
    });
};

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
