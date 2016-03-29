const m = require('mithril');

const DataDisplay = require('../components/datadisplay');
const LogModel = require('../models/log');

const Logs = module.exports = {
  logs: m.prop([])
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
        timestamp: log.timestamp(),
        level: log.level(),
        label: log.label(),
        msg: log.message(),
        meta: log.meta() ? JSON.stringify(log.meta()) : ''
      };
    }
);

const list = (after) => LogModel.list(after).then(parse).then((logs) => logs.reverse());

const update = function () {
  let oldLogs = Logs.logs();

  let latest = oldLogs[0];
  if (latest) {
    latest = oldLogs[0].timestamp.getTime();
  }

  Logs.logs = list(latest).then((logs) => logs.concat(oldLogs));
};

Logs.controller = function () {
  Logs.logs = list();
};

Logs.view = function () {
  return [
    m('h1', 'Logs'),
    m('button.btn', {onclick: update}, 'Refresh'),
    m(DataDisplay, {
      names: names,
      data: Logs.logs
    })
  ];
};
