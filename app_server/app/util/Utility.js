/**
 * Utility module
 * @module app/util/Utility
 */
var path = require('path');
var winston = require('winston');
var crypto = require('crypto');
var util = require('util');

exports.streamBaseUrl = 'rtmp://multimedia.worldscope.tk:1935/live';
exports.viewBaseUrl = 'http://worldscope.tk:1935/live';
exports.thumbnailTemplateUrl = 'http://worldscope.tk:8086/' +
                               'transcoderthumbnail?application=live/%s&' +
                               'streamname=%s&format=jpeg&' +
                               'size=640x380';

var randomValueBase64 =
/**
  * Generate a random string of base64 values, replacing + and / by 0
  * @param {integer} length of the generated string
  */
exports.randomValueBase64 = function (len) {
  return crypto.randomBytes(Math.ceil(len * 3 / 4))
  .toString('base64')
  .slice(0, len)
  .replace(/\+/g, '0')
  .replace(/\//g, '0');
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
        label: getModuleName(filename),
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
      }),
      new (winston.transports.File)({
        timestamp: true,
        filename: 'worldscope_log.log',
        label: getModuleName(filename)
      })
    ]
  });
};

var clearUserProfile =
/**
 * Clears user's sensitive credentials
 * @param  {Object} a user object
 * @return {Object} user without sensitive credentials
 */
exports.clearUserProfile = function (user) {
  delete user.password;
  delete user.accessToken;

  return user;
};

var formatStreamObject =
/**
 * Formats to be streamed stream object
 * @param  {Sequelize<Stream>} stream
 * @return {Stream}
 */
exports.formatStreamObject = function (stream) {

  return new Promise(function(resolve) {
    var formattedStream = stream.dataValues;
    formattedStream.streamLink =
      util.format('%s/%s/%s', exports.streamBaseUrl,
                              stream.appInstance,
                              stream.streamId);
    formattedStream.streamer = clearUserProfile(formattedStream.streamer
                                                               .dataValues);

    resolve(formattedStream);
  });
};

var formatViewObject =
/**
 * Formats to be viewed stream object
 * @param  {Sequelize<Stream>} stream
 * @return {Stream}
 */
exports.formatViewObject = function (stream) {

  var formattedStream = stream.dataValues;
  var viewLink = util.format('%s/%s/%s/manifest.mpd', exports.viewBaseUrl,
                             stream.appInstance,
                             stream.streamId);
  formattedStream.viewLink = viewLink;
  formattedStream.thumbnailLink =
    util.format(exports.thumbnailTemplateUrl,
                stream.appInstance,
                stream.streamId);

  formattedStream.streamer = clearUserProfile(formattedStream.streamer
                                                             .dataValues);

  return formattedStream;

};
