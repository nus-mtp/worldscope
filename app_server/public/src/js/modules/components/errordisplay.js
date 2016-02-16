const m = require('mithril');

const ErrorDisplay = module.exports = {
  messages: m.prop([]),
  addMessage: function (str) {
    ErrorDisplay.messages().push(str);
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

ErrorDisplay.view = function (ctrl) {
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
