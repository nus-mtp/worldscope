/**
 * @module Client
 * Abstraction for a client connecting over websocket
 */

var rfr = require('rfr');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Utility = rfr('app/util/Utility');

var logger = Utility.createLogger(__filename);

function Client(socket, credentials) {
  EventEmitter.call(this);

  this.socket = socket;
  this.credentials = credentials;

  this.handleSocketEvents(socket);
}
util.inherits(Client, EventEmitter);

Client.prototype.EVENT_COMMENT = 'comment';

Client.prototype.getUsername = function getUsername() {
  return this.credentials['username'];
};

Client.prototype.getSocket = function getSocket() {
  return this.socket;
};

Client.prototype.getRoom = function getRoom() {
  return this.room;
};

Client.prototype.joinRoom = function joinRoom(roomName) {
  this.socket.join(roomName);
  this.room = roomName;
};

Client.prototype.broadcastToRoom = function broadcastToRoom(event, msg) {
  if (!this.room || this.room.length == 0) {
    var err = util.format('@%s: no room to broadcast message to',
                          this.getUsername());
    logger.error(err);
    throw new Error(err);
  }

  logger.info('%s comments in #%s: %s',
              this.getUsername(), this.getRoom(), msg);
  this.socket.to(this.room).emit(event, msg);
  this.socket.emit(event, msg);
};

Client.prototype.handleSocketEvents = function handleSocketEvents(socket) {
  socket.on(this.EVENT_COMMENT, (function (comment) {
    this.broadcastToRoom(this.EVENT_COMMENT, comment);
    this.emit(this.EVENT_COMMENT, comment);
  }).bind(this));
};

module.exports = Client;
