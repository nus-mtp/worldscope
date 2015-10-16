/*
 * Storage class is a singleton object and acts as a facade to the storage
 * internals.
 */

var rfr = require('rfr');
var Utility = rfr('app/util/Utility');
var logger = Utility.createLogger(__filename);

function Storage() {
  var Sequelize = require('sequelize');
  var config = require('./Config');
  var db = {};

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

  // import each model
  models.forEach(function(model) {
    logger.info(model + " imported");
    db[model] = sequelize.import(__dirname + '/' + model);
  });

  Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
      db[modelName].associate(db);
    }
  });
}

var Class = Storage.protoype;

module.exports = new Storage();
