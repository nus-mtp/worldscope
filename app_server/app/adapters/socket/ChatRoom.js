/**
 * @module ChatRoom
 * Manage commenting and sending sticker functionalities
 */

var rfr = require('rfr');

var Utility = rfr('app/util/Utility');
var RequestInjector = rfr('app/adapters/socket/RequestInjector');
var Client = rfr('app/adapters/socket/Client');

var logger = Utility.createLogger(__filename);

var DEFAULT_ROOM = 'lobby';

function ChatRoom(server, io) {
  this.io = io;

  this.rooms = {};
  this.rooms[DEFAULT_ROOM] = {};
  this.clients = {};

  this.requestInjector = new RequestInjector(server);
}

var Class = ChatRoom.prototype;

/**
 * Add a client to the chat room system
 * @param {Client} client
 */
Class.addClient = function addClient(client) {
  this.clients[client.getUsername] = client;
  return this.addClientToRoom(client, DEFAULT_ROOM);
};

/**
 * Add a client to a socket.io room
 * @param client {Client}
 * @param room {string}
 */
Class.addClientToRoom = function addClientToRoom(client, room) {
  if (!(room in this.rooms)) {
    var err = 'Room ' + room + ' does not exist';
    logger.error(err);
    throw new Error(err);
  }

  this.rooms[room][client.getUsername()] = client;
  client.joinRoom(room);
  this.handleClientEvents(client);
};

/*
 * Register handler for events emitted by a Client
 * @param client {Client}
 */
Class.handleClientEvents = function handleClientEvents(client) {
  client.on(Client.EVENT_COMMENT, (function (comment) {
    logger.debug('Receive %s event from %s',
                 Client.EVENT_COMMENT, client.getUsername());
    this.requestInjector.createComment(client.getCredentials(), comment);
  }).bind(this));
};

module.exports = ChatRoom;
