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

Class.createView = function(userId, streamId) {
  logger.debug('Creating view');
  return UserService.createView(userId, streamId);
};

Class.getListOfUsersViewingStream = function(streamId) {
  logger.debug('Getting list of users viewing stream: %s', streamId);
  return UserService.getListOfUsersViewingStream(streamId);
};

Class.getTotalNumberOfUsersViewedStream = function(streamId) {
  logger.debug('Getting total number of users who viewed the stream: %s',
                streamId);
  return UserService.getTotalNumberOfUsersViewedStream(streamId);
};

Class.createSubscription = function(subscribeFrom, subscribeTo) {
  logger.debug('Subscribing from user %s to user %s',
                subscribeFrom, subscribeTo);
  return UserService.createSubscription(subscribeFrom, subscribeTo);
};

Class.getSubscriptions = function(userId) {
  logger.debug('Getting subscriptions for user %s', userId);
  return UserService.getSubscriptions(userId);
};

Class.getNumberOfSubscriptions = function(userId) {
  logger.debug('Getting number of subscriptions for user %s', userId);

  return UserService.getNumberOfSubscriptions(userId);
};

Class.getSubscribers = function(userId) {
  logger.debug('Getting subscribers for user %s', userId);
  return UserService.getSubscribers(userId);
};

Class.getNumberOfSubscribers = function(userId) {
  logger.debug('Getting number of subscribers for user %s', userId);
  //change later
  return UserService.getNumberOfSubscriptions(userId);
};

Class.deleteSubscription = function(subscribeFrom, subscribeTo) {
  logger.debug('Deleting subscription');
  return UserService.deleteSubscription(subscribeFrom, subscribeTo);
};

Class.createComment = function(userId, streamId, comment) {
  logger.debug('Comment from user %s to stream %s',
                userId, streamId);
  return UserService.createComment(userId, streamId, comment);
};

Class.getListOfCommentsForStream = function(streamId) {
  logger.debug('Get list of comments for stream %s', streamId);
  return UserService.getListOfCommentsForStream(streamId);
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

Class.endStream = function(userId, streamId) {
  logger.debug('Ending stream: %s', streamId);
  return StreamService.endStream(userId, streamId);
};

Class.stopStream = function(appName, appInstance, streamId) {
  logger.debug(`Stopping stream: ${appName}/${appInstance}/${streamId}`);
  return StreamService.stopStream(appName, appInstance, streamId);
};

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
