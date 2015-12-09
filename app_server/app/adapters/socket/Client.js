/**
 * @module Client
 * Abstraction for a client connecting over websocket
 */

var rfr = require('rfr');
var Utility = rfr('app/util/Utility');

var logger = Utility.createLogger(__filename);

function Client(socket, credentials) {
  this.socket = socket;
  this.credentials = credentials;
}

Client.prototype.getUsername = function getUsername() {
  return this.credentials['username'];
};

Client.prototype.getSocket = function getSocket() {
  return this.socket;
};

Client.prototype.joinRoom = function joinRoom(roomName) {
  this.socket.join(roomName);
};

module.exports = Client;
