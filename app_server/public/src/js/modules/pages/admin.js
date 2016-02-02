const m = require('mithril');

const mz = require('../utils/mzInit');

const AdminModel = require('../models/admin');

const Admin = module.exports = {
  controller: function () {
    let username = m.route.param('username') || -1;

    let ctrl = this;

    ctrl.admin = m.prop();
    AdminModel.get(username).then(ctrl.admin);

    ctrl.update = () => AdminModel.update(ctrl.admin());
  },
  view: function (ctrl) {
    let getLabelledInput = function (label, id, type, prop) {
      let attributes = {
        type: type,
        value: prop(),
        onchange: m.withAttr('value', prop)
      };

      return [
        m('input#' + id, attributes),
        m('label.active', {for: id}, label)
      ];
    };

    let admin = ctrl.admin();
    return [
      m('div.row', mz.text, [
        m('h1', 'Edit Admin'),
        m('form.col s12', {onsubmit: ctrl.update}, [
          m('div.input-field col s12',
              getLabelledInput('Username', 'username', 'text', admin.username)
          ),
          m('div.input-field col s12',
              getLabelledInput('Password', 'password', 'password', admin.password)
          ),
          m('div.input-field col s12',
              getLabelledInput('Email', 'email', 'text', admin.email)
          ),
          m('button.btn col s12', {type: 'submit'}, 'Edit Admin')
        ])
      ])
    ];
  }
};
