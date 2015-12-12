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
  this.clients = {};
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
 * Add a client to a socket.io room
 * @param client {Client}
 * @param room {string}
 */
ChatRoom.prototype.addClientToRoom = function addClientToRoom(client, room) {
  if (!(room in this.rooms)) {
    var err = 'Room ' + room + ' does not exist';
    logger.error(err);
    throw new Error(err);
  }

  this.rooms[room][client.getUsername()] = client;
  client.joinRoom(room);
};

module.exports = ChatRoom;
