const m = require('mithril');

const LogModel = require('../models/log');
const datetime = require('../utils/dateFormat');

const Logs = module.exports = {
  logs: m.prop()
};

const parse = (logs) => logs.map(
    function (log) {
      let msg = datetime.toShortDateTime(log.timestamp()) + ' - ' +
          log.level() + ': [' + log.label() + '] ' + log.message();

      if (log.meta()) {
        msg += ' ' + JSON.stringify(log.meta());
      }

      return msg;
    }
);

Logs.controller = function () {
  Logs.logs = LogModel.list().then(parse);
};

Logs.view = function () {
  return [
    m('h1', 'Logs'),
    m('div.col s12',
        Logs.logs().reverse().map((l) => m('p', l))
    )
  ];
};
