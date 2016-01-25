const m = require('mithril');

const mz = require('../utils/mzInit');

const App = require('../app');
const AdminModel = require('../models/admin');

const Login = module.exports = {
  controller: function () {
    let ctrl = this;

    ctrl.admin = new AdminModel();
    ctrl.loginError = m.prop();

    ctrl.login = function (e) {
      e.preventDefault();
      AdminModel.login(ctrl.admin).then(function (admin) {
        window.localStorage.setItem('ws-user', admin.userId);
        App.goToHome();
      }, function (err) {
        ctrl.loginError(err);
      });
    };
  },
  view: function (ctrl) {
    let admin = ctrl.admin;

    let errorMessage = !ctrl.loginError() ? null :
        m('div.row',
            m('div.col s12 center-align message', ctrl.loginError().message));

    return [
      errorMessage,
      m('div.row', mz.text, [
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
      ])
    ];
  }
};
