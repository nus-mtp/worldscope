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
  this.rooms = {};

  this.handleSocketEvents(socket);
}
util.inherits(Client, EventEmitter);

var Class = Client.prototype;

Client.EVENT_COMMENT = Class.EVENT_COMMENT = 'comment';

Class.getUserId = function getUserId() {
  return this.credentials['userId'];
};

Class.getCredentials = function getCredentials() {
  return this.credentials;
};

/**
 * Joins a socket.io room represented by a Room instance
 * @param room {Room}
 */
Class.joinRoom = function joinRoom(room) {
  this.socket.join(room.getName());
  this.rooms[room.getName()] = room;
};

/**
 * Leave a socket.io room represented by a Room instance
 * @param room {Room}
 */
Class.leaveRoom = function leaveRoom(room) {
  if (!(room.getName() in this.rooms)) {
    let err = `Client ${this.getUserId()} is not in ${room.getName()}`;
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
  if (this.rooms.length == 0) {
    var err = util.format('@%s: no room to broadcast message to',
                          this.getUsername());
    logger.error(err);
    throw new Error(err);
  }

  for (var i in this.rooms) {
    var room = this.rooms[i];
    logger.debug('%s comments in #%s: %s',
                 this.getUserId(), room.getName(), msg);
    this.socket.to(room.getName()).emit(event, msg);
    this.socket.emit(event, msg);
  }
};

Class.handleSocketEvents = function handleSocketEvents(socket) {
  socket.on(this.EVENT_COMMENT, (function (comment) {
    this.broadcastToRoom(this.EVENT_COMMENT, comment);
    this.emit(this.EVENT_COMMENT, comment);
  }).bind(this));
};

module.exports = Client;
