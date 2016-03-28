/**
 * Utility module
 * @module app/util/Utility
 */
var path = require('path');
var winston = require('winston');
var crypto = require('crypto');
var util = require('util');

var rfr = require('rfr');
var MemoryLogger = rfr('app/util/MemoryLogger');

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
exports.randomValueBase64 = function(len) {
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
exports.createLogger = function(filename) {
  return new winston.Logger({
    transports: [
      new winston.transports.Console({
        timestamp: true,
        colorize: true,
        label: getModuleName(filename),
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
      }),
      new (winston.transports.File)({
        name: 'logfile',
        timestamp: true,
        filename: 'worldscope_log.log',
        label: getModuleName(filename)
      }),
      new (winston.transports.File)({
        name: 'logstream',
        stream: MemoryLogger.stream,
        json: false,
        formatter: function(msg) {
          var item = {
            level: msg.level,
            message: msg.message,
            timestamp: new Date(),
            label: msg.label
          };

          if (Object.getOwnPropertyNames(msg.meta).length !== 0 ) {
            item.meta = msg.meta;
          }

          return JSON.stringify(item);
        },
        label: getModuleName(filename)
      })
    ]
  });
};

var formatUserObject =
/**
 * Formats a user object
 * @param  {Object} a user object
 * @return {Object} removes private info and changes to unix time
 */
exports.formatUserObject = function(user) {
  user = clearUserProfile(user);
  user = changeToUnixTime(user);
  return user;
};

var formatStreamObject =
/**
 * Formats a stream object
 * @param  {Sequelize<Stream>} stream
 * @return {Stream}
 */
exports.formatStreamObject = function(stream, option) {
  var formattedStream = stream.dataValues;

  // Assign view or stream link based on options
  if (option === 'stream') {
    formattedStream.streamLink =
      util.format('%s/%s/%s', exports.streamBaseUrl,
                              stream.appInstance,
                              stream.streamId);
  } else if (option === 'view') {
    formattedStream.viewLink =
      util.format('%s/%s/%s/manifest.mpd', exports.viewBaseUrl,
                                           stream.appInstance,
                                           stream.streamId);
    formattedStream.thumbnailLink =
      util.format(exports.thumbnailTemplateUrl,
                  stream.appInstance,
                  stream.streamId);
  }

  formattedStream.streamer = formatUserObject(formattedStream.streamer
                                                             .dataValues);
  // Converts sequelize time to unix time
  formattedStream = changeToUnixTime(formattedStream);

  return formattedStream;
};

var clearUserProfile =
/**
 * Clears user's sensitive credentials
 * @param  {Object} a user object
 * @return {Object} user without sensitive credentials
 */
exports.clearUserProfile = function(user) {
  delete user.password;
  delete user.accessToken;

  return user;
};

var changeToUnixTime =
/**
 * Changes these fields createdAt, deletedAt, updatedAt into unix time
 * @param  {Object}
 * @return {Object} user without sensitive credentials
 */
exports.changeToUnixTime = function(obj) {
  obj.createdAt === null ? null
    : obj.createdAt = Date.parse(obj.createdAt);
  obj.deletedAt === null ? null
    : obj.deletedAt = Date.parse(obj.deletedAt);
  obj.updatedAt === null ? null
    : obj.updatedAt = Date.parse(obj.updatedAt);

  return obj;
};

var changeToJavascriptTime =
/**
 * Changes these fields createdAt, deletedAt, updatedAt into unix time
 * @param  {Object}
 * @return {Object} user without sensitive credentials
 */
exports.changeToJavascriptTime = function(obj) {
  obj.createdAt === null ? null
    : obj.createdAt = new Date(obj.createdAt);
  obj.deletedAt === null ? null
    : obj.deletedAt = new Date(obj.deletedAt);
  obj.updatedAt === null ? null
    : obj.updatedAt = new Date(obj.updatedAt);

  return obj;
};

var addValidationDetailsForJoi =
/**
 * Adds details for validation errors through validate's failAction property
 * Assumes validation is done through joi
 */
exports.addValidationDetailsForJoi = function(request, reply, source, error) {
  var errors = error.data.details.map(function(err) {
    for (var key in err.context) {
      if (err.context.hasOwnProperty(key) && err.context[key]
          && err.context[key].toString) {
        err.context[key] = err.context[key].toString();
      }
    }

    return {
      type: err.type,
      context: err.context
    };
  });
  Object.assign(error.output.payload, {details: errors});

  return reply(error);
};
