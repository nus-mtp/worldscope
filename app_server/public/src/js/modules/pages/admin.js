const m = require('mithril');

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
      m('h1', 'Edit Admin'),
      m('div.input-field col s12',
          getLabelledInput('Username', 'username', 'text', admin.username)
      ),
      m('div.input-field col s12',
          getLabelledInput('Password', 'password', 'text', admin.password)
      ),
      m('div.input-field col s12',
          getLabelledInput('Email', 'email', 'text', admin.email)
      ),
      m('div.col s12',
          m('button.btn', {onclick: ctrl.update}, 'Submit')
      )
    ];
  }
};
