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
  this.clients = {};

  this.requestInjector = new RequestInjector(server);
}

var Class = RoomsManager.prototype;

/**
 * Add a client to the chat room system
 * @param {Client} client
 */
Class.addClient = function addClient(client) {
  this.clients[client.getUserId()] = client;
  this.addClientToRoom(client.getUserId(), DEFAULT_ROOM);
  this.handleClientEvents(client);
};

/**
 * Add a client to a socket.io room
 * @param client {Client}
 * @param roomName {string}
 */
Class.addClientToRoom = function addClientToRoom(userId, roomName) {
  if (!(roomName in this.rooms)) {
    let err = `Room ${roomName} does not exist`;
    logger.error(err);
    return new Error(err);
  }
  if (!(userId in this.clients)) {
    let err = `Client ${userId} does not exist`;
    logger.error(err);
    return new Error(err);
  }

  logger.info(`Adding ${userId} to room ${roomName}`);
  this.rooms[roomName].addClient(this.clients[userId]);
  return true;
};

/**
 * Add a client to a socket.io room
 * @param client {Client}
 * @param roomName {string}
 */
Class.removeClientFromRoom = function removeClientFromRoom(userId, roomName) {
  if (!(roomName in this.rooms)) {
    let err = `Room ${roomName} does not exist`;
    logger.error(err);
    return new Error(err);
  }
  if (!(userId in this.clients)) {
    let err = `Client ${userId} does not exist`;
    logger.error(err);
    return new Error(err);
  }

  logger.info(`Removing ${userId} from room ${roomName}`);
  this.rooms[roomName].removeClient(this.clients[userId]);
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
