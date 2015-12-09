var rfr = require('rfr');
var Utility = rfr('app/util/Utility');

var logger = Utility.createLogger(__filename);

function ChatRoom(io) {
  this.io = io;
  this.clients = {};
}

module.exports = ChatRoom;
