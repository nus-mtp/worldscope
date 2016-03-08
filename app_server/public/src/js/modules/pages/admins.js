const m = require('mithril');

const DataDisplay = require('../components/datadisplay');
const AdminModel = require('../models/admin');

const Admins = module.exports = {
  controller: function () {
    let ctrl = this;

    ctrl.names = m.prop({
      username: 'Username',
      email: 'Email',
      permissions: 'Permissions',
      actions: 'Actions'
    });

    let getActions = (id) =>
        m('select', {onchange: m.withAttr('value', m.route)}, [
          m('option', {disabled: true, selected: true}, 'Choose...'),
          m('option', {value: '/admins/view/' + id}, 'View / Edit'),
          m('option', {value: '/admins/delete/' + id}, 'Delete')
        ]);

    let parse = (admins) => admins.map(
        function (admin) {
          return {
            username: admin.username(),
            email: admin.email(),
            permissions: admin.permissions(),
            actions: getActions(admin.username())
          };
        }
    );

    ctrl.data = AdminModel.list().then(parse);
  },
  view: (ctrl) => [
    m('h1', 'Admins'),
    m(DataDisplay, {
      names: ctrl.names(),
      data: ctrl.data
    })
  ]
};
