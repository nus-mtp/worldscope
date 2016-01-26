/**
 * Error module
 * @module app/util/Error
 */
var util = require('util');

var InvalidFieldError =
exports.InvalidFieldError = function(message, extra) {
  Error.captureStackTrace(this, this.constructor);
  this.name = 'InvalidFieldError';
  this.message = message;
  this.extra = extra;
};

var NotFoundError =
exports.NotFoundError = function(message, extra) {
  Error.captureStackTrace(this, this.constructor);
  this.name = 'NotFoundError';
  this.message = message;
  this.extra = extra;
};

var UnknownError =
exports.UnknownError = function() {
  Error.captureStackTrace(this, this.constructor);
  this.name = 'UnknownError';
};

util.inherits(InvalidFieldError, Error);
util.inherits(NotFoundError, Error);
util.inherits(UnknownError, Error);

