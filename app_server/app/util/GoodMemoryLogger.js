var Squeeze = require('good-squeeze').Squeeze;
var rfr = require('rfr');
var MemoryLogger = rfr('app/util/MemoryLogger');

function GoodMemoryLogger(events, config) {
  if (!(this instanceof GoodMemoryLogger)) {
    return new GoodMemoryLogger(events, config);
  }

  this.squeeze = new Squeeze(events);
}

GoodMemoryLogger.prototype.init = function (readstream, emitter, callback) {
  readstream.pipe(this.squeeze).pipe(MemoryLogger.goodStream);

  callback();
};

GoodMemoryLogger.attributes = {
  name: 'good-memory-logger'
};

module.exports = GoodMemoryLogger;
