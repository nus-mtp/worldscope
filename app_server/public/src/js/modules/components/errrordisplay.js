const m = require('mithril');

const ErrorDisplay = module.exports = {};

ErrorDisplay.controller = function () {
  let ctrl = this;

  ctrl.message = m.prop([]);

  ctrl.addMessage = function (str) {
    ctrl.message().push(str);
  };

  ctrl.resetMessage = function () {
    ctrl.message([]);
  };
};

ErrorDisplay.view = function (ctrl, args) {
  let data = args.data.then(ctrl.updatePageVars).then(ctrl.paginate);

  return m('div#error', ctrl.message().forEach((msg) => m('p', msg)));
};
