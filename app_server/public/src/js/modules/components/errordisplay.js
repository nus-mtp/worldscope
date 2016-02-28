const m = require('mithril');
const errInterpreter = require('../utils/errorInterpreter');

const ErrorDisplay = module.exports = {
  messages: m.prop([]),
  addError: function (err) {
    ErrorDisplay.addMessage(errInterpreter.interpret(err));
  },
  addMessage: function (str) {
    if (Array.isArray(str)) {
      str.forEach(ErrorDisplay.addMessage);
    } else {
      ErrorDisplay.messages().push(str);
    }
  },
  setError: function (err) {
    ErrorDisplay.setMessage(errInterpreter.interpret(err));
  },
  setMessage: function (str) {
    ErrorDisplay.resetMessages();
    ErrorDisplay.addMessage(str);
  },
  removeMessageAt: function (idx) {
    ErrorDisplay.messages().splice(idx, 1);
  },
  resetMessages: function () {
    ErrorDisplay.messages([]);
  }
};

ErrorDisplay.controller = function () {
  ErrorDisplay.resetMessages();
};

ErrorDisplay.view = function () {
  return m('div#error.row',
      m('div.col s12 center-align',
          ErrorDisplay.messages().map((msg, idx) =>
            m('p', [
              m('span', msg + ' '),
              m('a.close', {
                'data-index': idx,
                onclick: m.withAttr('data-index', ErrorDisplay.removeMessageAt)
              }, '(dismiss)')
            ])
          )
      )
  );
};
