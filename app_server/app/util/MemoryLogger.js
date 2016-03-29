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


LogStream.prototype._write = function(chunk, encoding, callback) {
  this.memory.push(JSON.parse(chunk));
  if (this.memory > MAX_ENTRIES) {
    this.memory.pop();
  }

  callback();
};

Class.log = [];
Class.stream = new LogStream(Class.log);

module.exports = new MemoryLogger();
