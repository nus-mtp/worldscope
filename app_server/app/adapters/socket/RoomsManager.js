/**
 * @module RoomsManager
 * Manage commenting and sending sticker functionalities
 */

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
  this.addClientToRoom(client, DEFAULT_ROOM);
  this.handleClientEvents(client);
};

/**
 * Add a client to a socket.io room
 * @param client {Client}
 * @param roomName {string}
 */
Class.addClientToRoom = function addClientToRoom(client, roomName) {
  if (!(roomName in this.rooms)) {
    var err = `Room ${roomName} does not exist`;
    logger.error(err);
    throw new Error(err);
  }

  this.rooms[roomName].addClient(client);
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
