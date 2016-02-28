const m = require('mithril');
const errInterpreter = require('../utils/errorInterpreter');

const Alert = module.exports = {
  messages: m.prop([]),
  addError: function (err) {
    Alert.addMessage(errInterpreter.interpret(err));
  },
  addMessage: function (str) {
    if (Array.isArray(str)) {
      str.forEach(Alert.addMessage);
    } else {
      Alert.messages().push(str);
    }
  },
  setError: function (err) {
    Alert.setMessage(errInterpreter.interpret(err));
  },
  setMessage: function (str) {
    Alert.resetMessages();
    Alert.addMessage(str);
  },
  removeMessageAt: function (idx) {
    Alert.messages().splice(idx, 1);
  },
  resetMessages: function () {
    Alert.messages([]);
  }
};

Alert.controller = function () {
  Alert.resetMessages();
};

Alert.view = function () {
  return m('div#alert.row',
      m('div.col s12 center-align',
          Alert.messages().map((msg, idx) =>
            m('p', [
              m('span', msg + ' '),
              m('a.close', {
                'data-index': idx,
                onclick: m.withAttr('data-index', Alert.removeMessageAt)
              }, '(dismiss)')
            ])
          )
      )
  );
};
