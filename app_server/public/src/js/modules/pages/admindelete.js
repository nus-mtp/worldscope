const m = require('mithril');

const AdminModel = require('../models/admin');

const Admin = module.exports = {
  controller: function () {
    let username = m.route.param('username') || -1;

    let ctrl = this;

    ctrl.admin = m.prop();
    AdminModel.get(username).then(ctrl.admin);

    ctrl.delete = function (e) {
      e.preventDefault();
      AdminModel.delete(ctrl.admin()).then(
          () => m.route('/admins'),
          (err) => console.log(err)); // TODO: display error
    };
  },
  view: function (ctrl) {
    let getLabelledInput = function (label, id, type, prop) {
      let attributes = {
        disabled: true,
        type: type,
        value: prop()
      };

      return [
        m('input#' + id, attributes),
        m('label.active', {for: id}, label)
      ];
    };

    let admin = ctrl.admin();
    return [
      m('div.row', [
        m('h1', 'Delete Admin'),
        m('form.col s12', {onsubmit: ctrl.delete}, [
          m('div.input-field col s12',
              getLabelledInput('Username', 'username', 'text', admin.username)
          ),
          m('div.input-field col s12',
              getLabelledInput('Email', 'email', 'text', admin.email)
          ),
          m('button.btn col s12', {type: 'submit'}, 'Delete Admin')
        ])
      ])
    ];
  }
};
