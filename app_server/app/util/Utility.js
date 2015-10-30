/**
 * Utility module
 * @module app/util/Utility
 */
var path = require('path');
var winston = require('winston');


var crypto = require('crypto');

var randomValueBase64 =
/**
  * Generate a random string of base64 values, replacing + and / by 0
  * @param {integer} length of the generated string
  */
exports.randomValueBase64 = function (len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
        .toString('base64')   // convert to base64 format
        .slice(0, len)        // return required number of characters
        .replace(/\+/g, '0')  // replace '+' with '0'
        .replace(/\//g, '0'); // replace '/' with '0'
};

var getModuleName =
/**
 * Gets the last part of a path to a file
 * @param {string} path to a module file
 * @return {string} the module file name
 */
exports.getModuleName = function (filename) {
  return path.basename(filename);
};

var createLogger =
/**
 * Creates a new winston logger instance that supports a console transport
 * and a file transport that writes log to worldscope_log.log
 * @param {string} filename path to the current module file
 * @return {Object} a winston logger instance
 */
exports.createLogger = function (filename) {
  return new winston.Logger({
    transports: [
      new winston.transports.Console({
        timestamp: true,
        colorize: true,
        label: getModuleName(filename)
      }),
      new (winston.transports.File)({
        timestamp: true,
        filename: 'worldscope_log.log',
        label: getModuleName(filename)
      })
    ]
  });
};
