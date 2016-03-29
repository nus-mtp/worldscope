const m = require('mithril');

const DataDisplay = require('../components/datadisplay');
const LogModel = require('../models/log');

const Logs = module.exports = {
  logs: m.prop([])
};

const logsPage = {
  names: {
    time: 'Timestamp',
    level: 'Level',
    label: 'File',
    msg: 'Message',
    meta: 'Metadata'
  },
  parse: (logs) => logs.map(
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
  ),
  list: (after) => LogModel.list(after).then(Logs.parse).then((logs) => logs.reverse())
};

const responseLogsPage = {
  names: {
    time: 'Timestamp',
    event: 'Event',
    instance: 'Instance',
    method: 'Method',
    path: 'Path',
    query: 'Query',
    status: 'Status',
    responseTime: 'Response Time'
  },
  parse: (logs) => logs.map(
      function (log) {
        log = {
          time: log.timestamp().toUTCString(),
          timestamp: log.timestamp(),
          event: log.event(),
          instance: log.instance(),
          method: log.method(),
          path: log.path(),
          query: log.query() ? JSON.stringify(log.query()) : '',
          status: log.status(),
          responseTime: log.responseTime()
        };

        console.log(log);

        return log;
      }
  ),
  list: (after) => LogModel.listResponse(after).then(Logs.parse).then((logs) => logs.reverse())
};

const update = function () {
  let oldLogs = Logs.logs();

  let latest = oldLogs[0];
  if (latest) {
    latest = oldLogs[0].timestamp.getTime();
  }

  Logs.logs = Logs.list(latest).then((logs) => logs.concat(oldLogs));
};

Logs.controller = function () {
  let currentPage = m.route();
  if (currentPage.startsWith('/settings/logs')) {
    Object.assign(Logs, logsPage);
  } else if (currentPage.startsWith('/settings/responses')) {
    Object.assign(Logs, responseLogsPage);
  }

  Logs.logs = Logs.list();
};

Logs.view = function () {
  return [
    m('h1', 'Logs'),
    m('button.btn', {onclick: update}, 'Refresh'),
    m(DataDisplay, {
      names: Logs.names,
      data: Logs.logs
    })
  ];
};
