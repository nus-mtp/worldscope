var Writable = require('stream').Writable;
var util = require('util');

function MemoryLogger() {
}

var Class = MemoryLogger.prototype;

var MAX_ENTRIES = 500;

var LogStream = function(memory) {
  this.memory = memory;
  Writable.call(this, {objectMode: true});
};
util.inherits(LogStream, Writable);

Class.responseLog = [];
Class.goodStream = new LogStream(Class.responseLog);

Class.goodStream._write = function(chunk, encoding, callback) {
  chunk = {
    event: chunk.event,
    timestamp: chunk.timestamp,
    instance: chunk.instance,
    method: chunk.method,
    path: chunk.path,
    query: chunk.query,
    status: chunk.statusCode,
    responseTime: chunk.responseTime
  };

  this.memory.push(chunk);
  if (this.memory > MAX_ENTRIES) {
    this.memory.pop();
  }

  callback();
};

Class.log = [];
Class.winstonStream = new LogStream(Class.log);

Class.winstonStream._write = function(chunk, encoding, callback) {
  this.memory.push(JSON.parse(chunk));
  if (this.memory > MAX_ENTRIES) {
    this.memory.pop();
  }

  callback();
};

module.exports = new MemoryLogger();
