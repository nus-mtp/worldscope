const m = require('mithril');

const mz = require('../utils/mzInit');

const AdminModel = require('../models/admin');

const Login = module.exports = {
  controller: function () {
    let ctrl = this;

    ctrl.admin = new AdminModel();

    ctrl.login = function (e) {
      e.preventDefault();
      AdminModel.login(ctrl.admin).then(function (admin) {
        // TODO: do something on success
      }, function (err) {
        // TODO: do something on error
      });
    };
  },
  view: function (ctrl) {
    let admin = ctrl.admin;

    return m('div.row', mz.text, [
      m('form.col offset-s3 s6', {onsubmit: ctrl.login}, [
        m('div.input-field col s12', [
          m('input#username', {type: 'text', onchange: m.withAttr('value', admin.username)}),
          m('label', {for: 'username'}, 'Username')
        ]),
        m('div.input-field col s12', [
          m('input#password', {type: 'password', onchange: m.withAttr('value', admin.password)}),
          m('label', {for: 'password'}, 'Password')
        ]),
        m('button.btn col s12', {type: 'submit'}, 'Log In')
      ])
    ]);
  }
};
