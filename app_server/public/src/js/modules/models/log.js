const m = require('mithril');
const App = require('../app');

const Log = module.exports = function (data) {
  this.level = m.prop(data.level);
  this.message = m.prop(data.message);
  this.label = m.prop(data.label);
  this.timestamp = m.prop(new Date(data.timestamp));
  this.meta = m.prop(data.meta);
};

const ResponseLog = function (data) {
  this.event = m.prop(data.event);
  this.timestamp = m.prop(new Date(data.timestamp));
  this.instance = m.prop(data.instance);
  this.method = m.prop(data.method);
  this.path = m.prop(data.path);
  this.query = m.prop(data.query);
  this.status = m.prop(data.status);
  this.responseTime = m.prop(data.responseTime);
};

Log.list = (after) =>
    App.request({
      method: 'GET',
      url: '../api/log' + (after ? '?after=' + after : ''),
      type: Log
    });

Log.listResponse = (after) =>
    App.request({
      method: 'GET',
      url: '../api/log/response' + (after ? '?after=' + after : ''),
      type: ResponseLog
    });