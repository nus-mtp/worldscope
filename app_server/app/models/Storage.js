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
/*  sequelize
    .sync({force: true})
    .then(function(err) {
      logger.info('Table synchronized');
    }, function (err) {
      logger.info('An error occurred while synchronizing table:', err);
    });*/

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
           logger.error('Unable to retrieve user: %s', err);
           return false;
         });
  };

Class.getUserById = function(userId) {
  return this.models.User.findById(userId)
         .catch(function(err) {
           logger.error('Unable to retrieve user: %s', err);
           return false;
         });
};

Class.deleteUserById = function(userId) {
  return this.getUserById(userId)
         .then(function(user) {
           user.destroy();
         })
         .then(function() {
           return true;
         })
         .catch(function(err) {
           logger.error('Error in deleting user' + err);
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
           return true;
         })
         .catch(function(err) {
           logger.info('Error in updating user particulars');
           return false;
         });
};

module.exports = new Storage();
