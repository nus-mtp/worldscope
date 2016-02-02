/*
 * Storage class is a singleton object and acts as a facade to the storage
 * internals.
 * @module Storage
 */
var rfr = require('rfr');
var Promise = require('bluebird');
var Sequelize = require('sequelize');
var _ = require('underscore');

var config = rfr('config/DatabaseConfig');
var Utility = rfr('app/util/Utility');

var logger = Utility.createLogger(__filename);

var modelNames = [
  'User',
  'Stream'
];

/**
 * Initialises the database connection and load the models written in
 * modelNames. Model files have to be stored in the models directory
 * @constructor
 */
function Storage() {
  var models = {};

  // initialize database connection
  var sequelize = new Sequelize(
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

  // importing models
  for (var i = 0; i < modelNames.length; i++) {
    var modelName = modelNames[i];
    models[modelName] = sequelize.import(__dirname + '/' + modelName);
    logger.info(modelName + ' model imported');
  }

  // associate the models
  modelNames.forEach(function(modelName) {
    var srcModel = models[modelName];
    if ('associate' in srcModel) {
      srcModel.associate(models);
    }
  });

  // create the tables
  sequelize
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

  this.Sequelize = Sequelize;
  this.sequelize = sequelize;
  this.models = models;
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
      logger.info('No such user at %s with platform id %s',
                  platformType, platformId);
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
 * @return {Promise<Sequelize.object> | False}
 */
Class.getUserByUsername = function(username) {
  return this.models.User.findOne({
    where: {
      username: username
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
 * @param  {string} userId
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
Class.getListOfUsers = function(filters) {

  filters = mapParams(filters);

  return this.models.User.findAll({
    where: {
      permissions: null
    },
    order: [['username', filters.order]]
  }).catch(function(err) {
    logger.error('Error in fetching list of users: %j', err);
    return false;
  });
};

// TODO: Merge into getListOfUsers() after implementing filters
/**
 * @return {Promise<List<Sequelize.object>>} - a list of admins
 *         {False} on fail
 */
Class.getListOfAdmins = function(filters) {
  filters = mapParams(filters);

  return this.models.User.findAll({
    order: [['username', filters.order]],
    where: {permissions: {ne: null}}
  }).catch(function(err) {
    logger.error('Error in fetching list of users: %j', err);
    return false;
  });
};

/**
 * @return {Promise<Integer>} - total number of users in database
 *         {False} on fail
 */
Class.getNumberOfUsers = function() {

  return this.models.User.count({
    where: {
      permissions: null
    },
  }).catch(function(err) {
    logger.error('Error in counting users: %j', err);
    return false;
  });
};


/**
 * @return {Promise<Integer>} - total number of admins in database
 *         {False} on fail
 */
Class.getNumberOfAdmins = function() {

  return this.models.User.count({
    where: {
      permissions: {
        $ne: null
      }
    },
  }).catch(function(err) {
    logger.error('Error in counting admins: %j', err);
    return false;
  });
};

/**
 * @param  {string} userId - userid of the user who created stream
 * @param  {object} streamAttributes
 * @param  {string} streamAttributes.streamKey
 * @param  {string} streamAttributes.roomId
 * @return {Promise<Sequelize.object>}
 */
Class.createStream = function(userId, streamAttributes) {
  var userPromise = this.models.User.findById(userId);
  var streamPromise = this.models.Stream.create(streamAttributes);

  return Promise.join(userPromise, streamPromise,
      function(user, stream) {
        return user.addStream(stream).then(function() {
          return this.getStreamById(stream.streamId);
        }.bind(this));
      }.bind(this))
  .catch(function(err) {
    return Promise.reject(err);
  });

};

/**
 * Return a stream given streamId
 * @param  {string} id - stream's id
 * @return {Promise<Sequelize.object> | null}
 */
Class.getStreamById = function(streamId) {
  return this.models.Stream.findOne({
    include: [{
      model: this.models.User,
      as: 'streamer'
    }],
    where: {
      streamId: streamId
    }
  });
};

/**
 * Return a list of streams sorted with options.
 * @param  {object} filters
 * @param  {string} filters.sort
 * @param  {string} filters.state
 * @param  {object} filters.order
 * @return {Promise<List<Sequelize.object>>} - a list of streams
 */
Class.getListOfStreams = function(originalFilters) {
  // TODO: viewers

  var filters = mapParams(originalFilters);

  if (filters.sort !== 'createdAt') {
    return this.models.Stream.findAll({
      include: [{
        model: this.models.User,
        as: 'streamer'
      }],
      where: {
        live: filters.state
      },
      order: [[filters.sort, filters.order], ['createdAt', 'DESC']]
    });
  } else {
    return this.models.Stream.findAll({
      include: [{
        model: this.models.User,
        as: 'streamer'
      }],
      where: {
        live: filters.state
      },
      order: [[filters.sort, filters.order]]
    });
  }
};

/**
 * @param  {string}
 * @param  {object} newAttributes
 * @param  {string} newAttributes.username
 * @param  {string} newAttributes.password
 * @return {Promise<Sequelize.object>} on success
           {Error} on fail
 */
Class.updateStreamAttributes = function(streamId, newAttributes) {
  return this.getStreamById(streamId).then(function(stream) {
    return stream.update(newAttributes, {
      fields: Object.keys(newAttributes)
    });
  });
};

/**
 * Check if the fields to be changed match the fields available in object
 * @private
 */
function isFieldsMatched(user, options, fn) {
  var fieldsToChange = options.fields;
  var index = fieldsToChange.indexOf('updatedAt');
  var objFields = Object.keys(user.dataValues);

  if (index === 0) { //only change updatedAt time
    return fn();
  }

  if (_(fieldsToChange).difference(objFields).length !== 0) {
    throw new Error('Invalid parameters');
  } else {
    return fn();
  }
}

/**
 * Map the database query parameters
 * @private
 */
function mapParams(filters) {

  var filterMap = {
    'desc': 'DESC',
    'asc': 'ASC',
    'time': 'createdAt',
    'title': 'title',
    'all': {$or: [{'live': true}, {'live': false}]},
    'live': true,
    'done': false
  };

  for (var key in filters) {
    if (filters.hasOwnProperty(key)) {
      var value = filters[key];
      filters[key] = filterMap[value];
    }
  }

  return filters;
}

module.exports = new Storage();
