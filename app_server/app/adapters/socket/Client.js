/**
 * @module Client
 * Abstraction for a client connecting over websocket
 */
'use strict';

var rfr = require('rfr');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Utility = rfr('app/util/Utility');

var logger = Utility.createLogger(__filename);

function Client(socket, credentials) {
  EventEmitter.call(this);

  this.socket = socket;
  this.credentials = credentials;
  this.rooms = {}; // A map from room's name to Room object

  this.handleSocketEvents(socket);
}
util.inherits(Client, EventEmitter);

var Class = Client.prototype;

Client.EVENT_COMMENT = Class.EVENT_COMMENT = 'comment';
Client.EVENT_DISCONNECT = Class.EVENT_DISCONNECT = 'disconnect';

Class.getUserId = function getUserId() {
  return this.credentials['userId'];
};

Class.getCredentials = function getCredentials() {
  return this.credentials;
};

Class.getSocketId = function getSocketId() {
  return this.socket.id;
};

Class.getRooms = function getRooms() {
  return this.rooms;
};

/**
 * Joins a socket.io room represented by a Room instance. To maintain
 * consistency, this method should only be called by a Room object
 * @param room {Room}
 */
Class.__joinRoom__ = function(room) {
  this.socket.join(room.getName());
  this.rooms[room.getName()] = room;
};

/**
 * Leave a socket.io room represented by a Room instance. To maintain
 * consistency, this method should only be called by a Room object
 * @param room {Room}
 */
Class.__leaveRoom__ = function(room) {
  if (!(room.getName() in this.rooms)) {
    let err = `Client ${this.getSocketId()} is not in ${room.getName()}`;
    logger.error(err);
    return new Error(err);
  }

  this.socket.leave(room.getName());
  delete this.rooms[room.getName()];
};

/**
 * Broadcasts @msg under the message name @event. Current implementation
 * broadcasts to all rooms for testing.
 * @param event {string}
 * @param msg {string}
 */
Class.broadcastToRoom = function broadcastToRoom(event, msg) {
  if (!this.rooms || this.rooms.length === 0) {
    var err = util.format('@%s: no room to broadcast message to',
                          this.getSocketId());
    logger.error(err);
    throw new Error(err);
  }

  for (var roomName in this.rooms) {
    var room = this.rooms[roomName];
    logger.debug('%s comments in #%s: %s',
                 this.getSocketId(), room.getName(), msg);
    this.socket.to(room.getName()).emit(event, msg);
    this.socket.emit(event, msg);
  }
};

Class.equals = function(otherClient) {
  if (!(otherClient instanceof Client)) {
    return false;
  }
  if (otherClient.getSocketId() !== this.getSocketId()) {
    return false;
  }
  return true;
};

Class.handleSocketEvents = function handleSocketEvents(socket) {
  socket.on(this.EVENT_COMMENT, (comment) => {
    this.broadcastToRoom(this.EVENT_COMMENT, comment);
    this.emit(this.EVENT_COMMENT, comment);
  });
  socket.on(this.EVENT_DISCONNECT, () => {
    this.emit(this.EVENT_DISCONNECT);
  });
};

module.exports = Client;
