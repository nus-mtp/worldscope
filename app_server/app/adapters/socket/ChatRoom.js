/**
 * @module ChatRoom
 * Manage commenting and sending sticker functionalities
 */

var rfr = require('rfr');
var Utility = rfr('app/util/Utility');

var logger = Utility.createLogger(__filename);

var DEFAULT_ROOM = 'lobby';

function ChatRoom(io) {
  this.io = io;
  this.rooms = {};
  this.rooms[DEFAULT_ROOM] = {};
  this.clients = {}
  this.err = '';
}

/**
 * Add a client to the chat room system
 * @param {Client} client
 */
ChatRoom.prototype.addClient = function addClient(client) {
  this.clients[client.getUsername] = client;
  return this.addClientToRoom(client, DEFAULT_ROOM);
};

/**
 * Add a client to a socket.io room identified by roomName
 * @param client {Client}
 * @param roomName {string}
 */
ChatRoom.prototype.addClientToRoom = function addClientToRoom(client, roomName) {
  if (!(roomName in this.rooms)) {
    this.err = 'Room ' + roomName + ' does not exist';
    logger.error(this.err);
    return false;
  }

  this.rooms[roomName][client.getUsername()] = client;
  client.joinRoom(roomName);
  return true;
};

module.exports = ChatRoom;
