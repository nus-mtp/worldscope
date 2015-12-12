/**
 * @module SocketAdapter
 */

var rfr = require('rfr');

var Utility = rfr('app/util/Utility');
var Client = rfr('app/adapters/socket/Client');
var ChatRoom = rfr('app/adapters/socket/ChatRoom');
var Authenticator = rfr('app/policies/Authenticator');

var logger = Utility.createLogger(__filename);

function SocketAdapter() {
}

SocketAdapter.prototype.init = function init(server) {
  this.io = require('socket.io')(server.listener);

  this.chatRoom = new ChatRoom(this.io);

  this.io.on('connection', function (socket) {
    logger.info('New websocket connection from: ' +
                (socket.conn.request.headers['x-forwarded-for'] ||
                 socket.conn.request.connection.remoteAddress));

    socket.on('identify', function (credentials) {
      Authenticator.validateUser(credentials).bind(socketAdapter)
      .then(function validateResult(result) {
        if (!result || result instanceof Error) {
          socket.emit('identify', 'ERR');
        }

        try {
          this.chatRoom.addClient(new Client(socket, credentials));
          socket.emit('identify', 'OK');
        } catch (err) {
          logger.error(err);
          socket.emit('identify', 'ERR');
        }
      });
    });
  });
};

var socketAdapter = new SocketAdapter();

module.exports = socketAdapter;
