const m = require('mithril');
const App = require('../app');

const Log = module.exports = function (data) {
  this.level = m.prop(data.level);
  this.message = m.prop(data.message);
  this.label = m.prop(data.label);
  this.timestamp = m.prop(new Date(data.timestamp));
  this.meta = m.prop(data.meta);
};

Log.list = (after) =>
    App.request({
      method: 'GET',
      url: '../api/log',
      type: Log
    });
