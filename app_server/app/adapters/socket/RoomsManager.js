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

  this.rooms = {}; // A map from room name to Room objects
  this.rooms[DEFAULT_ROOM] = new Room(DEFAULT_ROOM,
                                      Room.ROOM_TYPES.GENERAL);
  // A map from user id to a map of socket.io id to Client object
  this.users = {};

  this.requestInjector = new RequestInjector(server);
}

var Class = RoomsManager.prototype;

Class.getUser = function(userId) {
  return this.users[userId];
};

Class.createUser = function(userId) {
  return this.users[userId] = {};
};

Class.__removeUser = function(userId) {
  delete this.users[userId];
};

/**
 * Add a client to the chat room system
 * @param {Client} client
 */
Class.addClient = function(client) {
  let userId = client.getUserId();
  let user = this.getUser(userId);
  if (!user) {
    user = this.createUser(userId);
  }
  user[client.getSocketId()] = client;
  this.__addClientToRoom(client, DEFAULT_ROOM);
  this.__handleClientEvents(client);
};

/**
 * Add a client to a socket.io room
 * @param client {Client}
 * @param roomName {string}
 */
Class.__addClientToRoom = function(client, roomName) {
  logger.info(`Adding ${client.getSocketId()} to room ${roomName}`);
  let room = this.__getRoom(roomName);

  if (!room) {
    let err = `Room ${roomName} does not exist`;
    logger.error(err);
    return new Error(err);
  }

  return room.addClient(client);
};

/**
 * Add a client to a socket.io room
 * @param client {Client}
 * @param roomName {string}
 */
Class.__removeClientFromRoom = function(client, roomName) {
  logger.info(`Removing ${client.getSocketId()} from room ${roomName}`);
  let room = this.__getRoom(roomName);

  if (!room) {
    let err = `Room ${roomName} does not exist`;
    logger.error(err);
    return new Error(err);
  }

  return room.removeClient(client);
};

Class.createNewRoom = function(roomName) {
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

Class.removeRoom = function(roomName) {
  logger.info(`Removing ${roomName} from chat room system`);
  let room = this.__getRoom(roomName);
  room.removeAllClients();
  delete this.rooms[roomName];
};

/**
 * @param roomName {string}
 * @return {Room}
 */
Class.__getRoom = function(roomName) {
  if (!(roomName in this.rooms)) {
    return null;
  }
  return this.rooms[roomName];
};

Class.__removeClient = function(client) {
  logger.info('Removing client %s/%s from chat room system',
              client.getUserId(), client.getSocketId());
  this.__removeClientFromUsersList(client);
  this.__removeClientFromRooms(client);
};

Class.__removeClientFromUsersList = function(client) {
  let user = this.getUser(client.getUserId());
  delete user[client.getSocketId()];

  if (Object.keys(user).length === 0) {
    this.__removeUser(client.getUserId());
  }
};

Class.__removeClientFromRooms = function(client) {
  let rooms = client.getRooms();
  for (var roomName in rooms) {
    this.__removeClientFromRoom(client, roomName);
  }
};

/*
 * Register handler for events emitted by a Client
 * @param client {Client}
 */
Class.__handleClientEvents = function(client) {
  client.on(Client.EVENT_COMMENT, (comment) => {
    try {
      logger.debug('Receive %s event from %s',
                  Client.EVENT_COMMENT, client.getUserId());
      this.requestInjector.createComment(client.getCredentials(), comment);
    } catch (e) {
      logger.error(e);
    }
  });

  client.on(Client.EVENT_DISCONNECT, () => {
    try {
      logger.info('Client %s/%s diconnected',
                  client.getUserId(), client.getSocketId());
      this.__removeClient(client);
    } catch (e) {
      logger.error(e);
    }
  });

  client.on(Client.EVENT_JOIN, (roomName) => {
    try {
      logger.info('Client %s/%s joining room %s',
                   client.getUserId(), client.getSocketId(), roomName);
      this.__addClientToRoom(client, roomName);
    } catch (e) {
      logger.error(e);
    }
  });

  client.on(Client.EVENT_LEAVE, (roomName) => {
    try {
      logger.info('Client %s/%s leaving room %s',
                   client.getUserId(), client.getSocketId(), roomName);
      this.__removeClientFromRoom(client, roomName);
    } catch (e) {
      logger.error(e);
    }
  });
};

module.exports = RoomsManager;
