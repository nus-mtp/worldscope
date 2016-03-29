const m = require('mithril');

const DataDisplay = require('../components/datadisplay');
const LogModel = require('../models/log');

const Logs = module.exports = {
  logs: m.prop()
};

const names = {
  time: 'Timestamp',
  level: 'Level',
  label: 'File',
  msg: 'Message',
  meta: 'Metadata'
};

const parse = (logs) => logs.map(
    function (log) {
      return {
        time: log.timestamp().toUTCString(),
        level: log.level(),
        label: log.label(),
        msg: log.message(),
        meta: log.meta() ? JSON.stringify(log.meta()) : ''
      };
    }
);

Logs.controller = function () {
  Logs.logs = LogModel.list().then(parse).then((logs) => logs.reverse());
};

Logs.view = function () {
  return [
    m('h1', 'Logs'),
    m(DataDisplay, {
      names: names,
      data: Logs.logs
    })
  ];
};
