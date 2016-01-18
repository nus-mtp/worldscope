const m = require('mithril');

const mz = require('../utils/mzInit');

const Login = module.exports = {
  controller: function () {},
  view: function (ctrl) {
    return m('div.row', mz.text, [
      m('form.col offset-s3 s6', [
        m('div.input-field col s12', [
          m('input#username', {type: 'text'}),
          m('label', {for: 'username'}, 'Username')
        ]),
        m('div.input-field col s12', [
          m('input#password', {type: 'password'}),
          m('label', {for: 'password'}, 'Password')
        ]),
        m('button.btn col s12', {type: 'submit'}, 'Log In')
      ])
    ]);
  }
};
