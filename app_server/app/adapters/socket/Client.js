var rfr = require('rfr');
var Utility = rfr('app/util/Utility');

var logger = Utility.createLogger(__filename);

function Client(socket) {
  this.socket = socket;
}

module.exports = Client;
