/**
 * @module RoomsManager
 * Manage commenting and sending sticker functionalities
 */
'use strict';

var rfr = require('rfr');

var Utility = rfr('app/util/Utility');
var RequestInjector = rfr('app/adapters/socket/RequestInjector');
var Room = rfr('app/adapters/socket/Room');
var Client = rfr('app/adapters/socket/Client');

var logger = Utility.createLogger(__filename);

var DEFAULT_ROOM = 'lobby';

function RoomsManager(server, io) {
  this.io = io;

  this.rooms = {};
  this.rooms[DEFAULT_ROOM] = new Room(DEFAULT_ROOM,
                                      Room.ROOM_TYPES.GENERAL);
  this.users = {};

  this.requestInjector = new RequestInjector(server);
}

var Class = RoomsManager.prototype;

Class.getUser = function(userId) {
  return this.users[userId];
};

Class.createUser = function(userId) {
  return this.users[userId] = [];
};

/**
 * Add a client to the chat room system
 * @param {Client} client
 */
Class.addClient = function addClient(client) {
  let userId = client.getUserId();
  let user = this.getUser(userId);
  if (!user) {
    user = this.createUser(userId);
  }
  user.push(client);
  this.addClientToRoom(client, DEFAULT_ROOM);
  this.handleClientEvents(client);
};

/**
 * Add a client to a socket.io room
 * @param client {Client}
 * @param roomName {string}
 */
Class.addClientToRoom = function addClientToRoom(client, roomName) {
  let room = this.getRoom(roomName);

  if (!room) {
    let err = `Room ${roomName} does not exist`;
    logger.error(err);
    return new Error(err);
  }

  logger.info(`Adding ${client.getSocketId()} to room ${roomName}`);
  room.addClient(client);
  return true;
};

Class.createNewRoom = function createNewRoom(roomName) {
  if (this.rooms[roomName]) {
    let errorMsg = `Room ${roomName} already exists`;
    logger.error(errorMsg);
    return new Error(errorMsg);
  }

  logger.info(`Creating room ${roomName}`);
  var newRoom = new Room(roomName, Room.ROOM_TYPES.STREAM);
  this.rooms[roomName] = newRoom;
  return newRoom;
};

Class.getRoom = function(roomName) {
  if (!(roomName in this.rooms)) {
    return null;
  }
  return this.rooms[roomName];
};

/*
 * Register handler for events emitted by a Client
 * @param client {Client}
 */
Class.handleClientEvents = function handleClientEvents(client) {
  client.on(Client.EVENT_COMMENT, (function (comment) {
    logger.debug('Receive %s event from %s',
                 Client.EVENT_COMMENT, client.getUserId());
    this.requestInjector.createComment(client.getCredentials(), comment);
  }).bind(this));
};

module.exports = RoomsManager;
