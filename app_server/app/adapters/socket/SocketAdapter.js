var rfr = require('rfr');
var Utility = rfr('app/util/Utility');
var Client = rfr('app/adapters/socket/Client');
var ChatRoom = rfr('app/adapters/socket/ChatRoom');

var logger = Utility.createLogger(__filename);

function SocketAdapter() {
}

SocketAdapter.prototype.init = function init(server) {
  this.io = require('socket.io')(server.listener);

  this.chatRoom = new ChatRoom(this.io);

  this.io.on('connection', function (socket) {
    logger.info('New websocket connection');
  });
};

var socketAdapter = new SocketAdapter();

exports.register = function (server, options, next) {
  socketAdapter.init(server);
  next();
};

exports.register.attributes = {
  name: 'SocketAdapter'
};
