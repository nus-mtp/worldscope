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
  this.db = {};

  // initialize database connection
  var sequelize = new Sequelize(
      config.name,
      config.username,
      config.password, {
        host: config.host,
        dialect: config.dialect
  });

  // load models
  var models = [
    'User'
  ];

  for (var i = 0; i < models.length; i++) {
    model = models[i];
    this.db[model] = sequelize.import(__dirname + '/' + model);
    logger.info(model + ' model imported');
  }

  // create the tables
  sequelize
    .sync()
    .then(function(err) {
      logger.info('Table created!');
    }, function (err) {
      logger.info('An error occurred while creating the table:', err);
    });

}

var Class = Storage.prototype;

Class.createUser = function(username, alias, email, password,
                            accessToken, platformType, description) {
  var newUser = this.db.User.create({
      username: username,
      alias: alias,
      email: email,
      password: password,
      accessToken: accessToken,
      platformType: platformType,
      description: description,
  });
};

module.exports = new Storage();
