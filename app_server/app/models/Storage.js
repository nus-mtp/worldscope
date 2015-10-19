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
  var sequelize = new Sequelize(
      config.name,
      config.username,
      config.password, {
        host: config.host,
        dialect: config.dialect
  });

  // load models
  var modelArr = [
    'User'
  ];

  // importing models
  for (var i = 0; i < modelArr.length; i++) {
    modelName = modelArr[i];
    this.models[modelName] = sequelize.import(__dirname + '/' + modelName);
    logger.info(modelName + ' model imported');
  }

  // create the tables
  sequelize
    .sync()
    .then(function(err) {
      logger.info('Table synchronized');
    }, function (err) {
      logger.info('An error occurred while synchronizing table:', err);
    });

}

var Class = Storage.prototype;


Class.createUser = function(username, alias, email, password,
                            accessToken, platformType, description) {
  var newUser = this.models.User.create({
      username: username,
      alias: alias,
      email: email,
      password: password,
      accessToken: accessToken,
      platformType: platformType,
      description: description,
  });
};

Class.getUserByEmail = function(email) {
  this.models.User.findOne({
    where: {
      email: email
    }
  }).then(function(user) {
    return user;
  });
};

Class.deleteUserById = function(userId) {
  this.models.User.findById(userId).then(function(user) {
    user.destroy().then(function() {
      logger.info('User deleted');
    });
  });
};

Class.deleteUserByEmail = function(email) {
  this.models.User.findOne({
    where: {
      email: email
    }
  }).then(function(user) {
    user.destroy().then(function() {
      logger.info('User deleted');
    });
  });
};

Class.updatePassword = function(email, newPassword) {
  this.models.User.findOne({
    where: {
      email: email
    }
  }).then(function(user) {
    user.password = newPassword;
    user.save();
  });
};

Class.updateAlias = function(email, newAlias) {
  this.models.User.findOne({
    where: {
      email: email
    }
  }).then(function(user) {
    user.alias = newAlias;
    user.save();
  });
};

module.exports = new Storage();
