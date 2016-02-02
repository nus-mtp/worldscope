const m = require('mithril');

const mz = require('../utils/mzInit');

const AdminModel = require('../models/admin');

const Admin = module.exports = {
  controller: function () {
    let username = m.route.param('username') || '';

    let ctrl = this;

    if (username) {
      ctrl.title = 'Edit Admin';

      ctrl.admin = m.prop();
      AdminModel.get(username).then(ctrl.admin);

      ctrl.action = function (e) {
        e.preventDefault();
        AdminModel.update(ctrl.admin()).then(
            () => m.route('/admins'),
            (err) => console.log(err) // TODO: display error
        );
      };
    } else {
      ctrl.title = 'Create Admin';
      ctrl.admin = m.prop(new AdminModel());

      ctrl.action = function (e) {
        e.preventDefault();
        AdminModel.create(ctrl.admin()).then(
            () => m.route('/admins'),
            (err) => console.log(err) // TODO: display error
        );
      };
    }
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
        m('h1', ctrl.title),
        m('form.col s12', {onsubmit: ctrl.action}, [
          m('div.input-field col s12',
              getLabelledInput('Username', 'username', 'text', admin.username)
          ),
          m('div.input-field col s12',
              getLabelledInput('Password', 'password', 'password', admin.password)
          ),
          m('div.input-field col s12',
              getLabelledInput('Email', 'email', 'text', admin.email)
          ),
          m('button.btn col s12', {type: 'submit'}, ctrl.title)
        ])
      ])
    ];
  }
};
