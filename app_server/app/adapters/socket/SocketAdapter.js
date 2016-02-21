/**
 * @module SocketAdapter
 */
'use strict';
var rfr = require('rfr');
var Promise = require('bluebird');
var Iron = Promise.promisifyAll(require('iron'));

var Utility = rfr('app/util/Utility');
var Client = rfr('app/adapters/socket/Client');
var RoomsManager = rfr('app/adapters/socket/RoomsManager');
var ServerConfig = rfr('config/ServerConfig.js');

var logger = Utility.createLogger(__filename);

function SocketAdapter() {
  this.isInitialized = false;
}

var Class = SocketAdapter.prototype;

Class.init = function init(server) {
  this.server = server;
  this.io = require('socket.io')(server.listener);

  this.roomsManager = new RoomsManager(server, this.io);

  this.io.on('connection', (socket) => {
    logger.info('New websocket connection from: ' +
                (socket.conn.request.headers['x-forwarded-for'] ||
                 socket.conn.request.connection.remoteAddress));
    this.__handleSocketEvents(socket);
  });

  this.isInitialized = true;
};

Class.__handleSocketEvents = function(socket) {
  this.__handleIdentifyEvent(socket);
  this.__handleDisconnectEvent(socket);
};

/**
 * Handles the `identify` socket.io events that identify a user by cookie
 * @param socket {Socket}
 */
Class.__handleIdentifyEvent = function(socket) {
  socket.on('identify', (cookie) => {
    Iron.unsealAsync(cookie, ServerConfig.cookiePassword, Iron.defaults)
    .then((credentials) => {
      if (!credentials || credentials instanceof Error) {
        logger.error('Error decryping cookie from <identify> message');
        socket.emit('identify', 'ERR');
        return;
      }

      let Authenticator = this.server.app.authenticator;
      return Authenticator.validateAccount(this.server, credentials)
      .then((result) => {
        if (!result || result instanceof Error) {
          logger.error(result);
          return socket.emit('identify', 'ERR');
        }

        try {
          this.roomsManager.addClient(new Client(socket, credentials));
          socket.emit('identify', 'OK');
        } catch (err) {
          logger.error(err);
          socket.emit('identify', 'ERR');
        }
      });
    })
    .catch((err) => {
      logger.error(err);
      socket.emit('identify', 'ERR');
    });
  });
};

Class.__handleDisconnectEvent = function(socket) {
};

/**
 * @param roomName {string}
 */
Class.createNewRoom = function (roomName) {
  return this.roomsManager.createNewRoom(roomName);
};

var socketAdapter = new SocketAdapter();

module.exports = socketAdapter;
