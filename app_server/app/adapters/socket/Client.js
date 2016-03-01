/**
 * @module Client
 * Abstraction for a client connecting over websocket
 */
'use strict';

var rfr = require('rfr');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Utility = rfr('app/util/Utility');
var Room = rfr('app/adapters/socket/Room');

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
Client.EVENT_JOIN = Class.EVENT_JOIN = 'join';
Client.EVENT_LEAVE = Class.EVENT_LEAVE = 'leave';

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
  logger.info(`Client ${this.getSocketId()} joined room ${room.getName()}`);
  this.socket.join(room.getName());
  this.rooms[room.getName()] = room;
  this.broadcastJoinMessage(room);
  return true;
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

  logger.info(`Client ${this.getSocketId()} left room ${room.getName()}`);
  this.socket.leave(room.getName());
  delete this.rooms[room.getName()];
  this.broadcastLeaveMessage(room);
  return true;
};

Class.__isInRoom = function(roomName) {
  return this.rooms[roomName] instanceof Room;
};

Class.broadcastJoinMessage = function(room) {
  this.broadcastToRoom(Client.EVENT_JOIN, 'OK', room);
};

Class.broadcastLeaveMessage = function(room) {
  this.broadcastToRoom(Client.EVENT_LEAVE, 'OK', room);
};

/**
 * Broadcasts @msg under the message name @event to @room. The message is also
 * tagged with data to identify the user and the room
 * @param event {string}
 * @param msg {string}
 * @param room {Room}
 */
Class.broadcastToRoom = function(event, message, room) {
  let msgToOthers = {
    userId: this.getUserId(),
    room: room.getName(),
    message: message
  };
  let msgToSelf = {
    userId: 'me',
    room: room.getName(),
    message: message
  };
  this.socket.to(room.getName()).emit(event, msgToOthers);
  this.socket.emit(event, msgToSelf);
};

/**
 * Broadcasts @msg under the message name @event to all
 * `ROOM_TYPES.STREAM` rooms that this client is in
 * @param event {string}
 * @param msg {string}
 */
Class.broadcastToStreamRooms = function(event, msg) {
  if (!this.rooms || this.rooms.length === 0) {
    var err = util.format('@%s: no room to broadcast message to',
                          this.getSocketId());
    logger.error(err);
    return new Error(err);
  }

  for (var roomName in this.rooms) {
    var room = this.rooms[roomName];
    if (room.getType() !== Room.ROOM_TYPES.STREAM) {
      continue;
    }
    logger.debug('%s comments in #%s: %s',
                 this.getSocketId(), room.getName(), msg);
    this.broadcastToRoom(event, msg, room);
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
    this.broadcastToStreamRooms(this.EVENT_COMMENT, comment);
    this.emit(this.EVENT_COMMENT, comment);
  });
  socket.on(this.EVENT_DISCONNECT, () => {
    this.emit(this.EVENT_DISCONNECT);
  });
  socket.on(this.EVENT_JOIN, (roomName) => {
    this.emit(this.EVENT_JOIN, roomName);
  });
  socket.on(this.EVENT_LEAVE, (roomName) => {
    this.emit(this.EVENT_LEAVE, roomName);
  });
};

module.exports = Client;
