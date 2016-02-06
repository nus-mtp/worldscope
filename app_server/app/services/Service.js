var rfr = require('rfr');

var Utility = rfr('app/util/Utility');
var UserService = rfr('app/services/UserService');
var StreamService = rfr('app/services/StreamService');
var AdminService = rfr('app/services/AdminService');

var logger = Utility.createLogger(__filename);

function Service() {
}

var Class = Service.prototype;

/////// USER APIs ///////
Class.createNewUser = function(particulars) {
  logger.debug('Creating new user: %j', particulars);
  return UserService.createNewUser(particulars);
};

Class.getUserByPlatform = function(platformType, platformId) {
  logger.debug('Getting user by platform %s %s', platformType, platformId);
  return UserService.getUserByPlatform(platformType, platformId);
};

Class.getUserById = function(id) {
  logger.debug('Getting user by id %s', id);
  return UserService.getUserById(id);
};

Class.getListOfUsers = function(filters) {
  logger.debug('Getting list of user');
  return UserService.getListOfUsers(filters);
};

Class.updateUser = function(userId, particulars) {
  logger.debug('Updating user particulars %s %j', userId, particulars);
  return UserService.updateUser(userId, particulars);
};

Class.getNumberOfUsers = function() {
  logger.debug('Getting number of users');
  return UserService.getNumberOfUsers();
};

///////////////////////

/////// STREAM APIs ///////
Class.createNewStream = function(userId, streamDetails) {
  logger.debug('Creating new stream: %j', streamDetails);
  return StreamService.createNewStream(userId, streamDetails);
};

Class.getStreamById = function(streamId) {
  logger.debug('Getting stream by id: %j', streamId);
  return StreamService.getStreamById(streamId);
};

Class.getListOfStreams = function(filters) {
  logger.debug('Getting list of streams with filters: %j', filters);
  return StreamService.getListOfStreams(filters);
};

Class.updateStream = function(streamId, attributes) {
  logger.debug('Updating stream %s with attributes: %j', streamId, attributes);
  return StreamService.updateStream(streamId, attributes);
};

///////////////////////

/////// ADMIN APIs ///////
Class.getListOfAdmins = function(filters) {
  logger.debug('Getting list of admins with filters: %j', filters);
  return AdminService.getListOfAdmins(filters);
};

Class.createNewAdmin = function(particulars) {
  logger.debug('Creating new admin: %j', particulars);
  return AdminService.createNewAdmin(particulars);
};

Class.getAdminByUsername = function(username) {
  logger.debug('Getting admin by username: %s', username);
  return AdminService.getAdminByUsername(username);
};

Class.updateAdmin = function(id, particulars) {
  logger.debug('Updating admin particulars %s %j', particulars);
  return AdminService.updateParticulars(id, particulars);
};

Class.deleteAdmin = function(id) {
  logger.debug('Deleting admin by id: %s', id);
  return AdminService.deleteAdminById(id);
};
///////////////////////

module.exports = new Service();
