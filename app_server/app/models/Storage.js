/*
 * Storage class is a singleton object and acts as a facade to the storage
 * internals.
 */

var rfr = require('rfr');
var Utility = rfr('app/util/Utility');
var logger = Utility.createLogger(__filename);
var Promise = require('bluebird');

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
  var that = this;
  return new Promise(function(resolve, reject) {
    that.models.User.create(particulars)
      .then(function(user) {
        logger.info('User created');
        resolve(user);
      }).catch(function(err) {
        logger.error('Error in creating user');
        resolve(false);
      });
  });
};

Class.getUserByEmail = function(email) {
  var user = this.models.User.findOne({
    where: {
      email: email
    }
  });
  return user;
};

Class.getUserById = function(userId) {
  var user = this.models.User.findById(userId);
  return user;
};

Class.deleteUserById = function(userId) {
  var that = this;
  return new Promise(function(resolve, reject){
    that.models.User.findById(userId)
      .then(function(user) {
        user.destroy();
      })
      .then(function() {
        logger.info('User deleted');
        resolve(true);
      })
      .catch(function(err) {
        resolve(false);
      });
  });
};

Class.deleteUserByEmail = function(email) {
  var that = this;
  return new Promise(function(resolve, reject){
    that.getUserByEmail(email)
      .then(function(user) {
        user.destroy();
      })
      .then(function() {
        resolve(true);
      })
      .catch(function(err) {
        resolve(false);
      });
  });
};

Class.updateParticulars = function(email, newParticulars) {
  var that = this;
  return new Promise(function(resolve, reject) {
    that.getUserByEmail(email)
      .then(function(user) {
        user.update(newParticulars, {
          fields: newParticulars.keys
        })
        .then(function(value){
          logger.info('Particulars updated');
          resolve(true);
        })
        .catch(function(err) {
          logger.info('Error in updating user particulars');
          resolve(false);
        });
      });
  });
};

module.exports = new Storage();
