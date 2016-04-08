const m = require('mithril');

const DataDisplay = require('../components/datadisplay');
const AdminModel = require('../models/admin');

const Admins = module.exports = {};

Admins.init = function () {
  Admins.adminData = AdminModel.list().then(parse);
};

const names = {
  username: 'Username',
  email: 'Email',
  permissions: 'Permissions',
  actions: 'Actions'
};

const getActions = (id) =>
  m('select', {onchange: m.withAttr('value', m.route)}, [
    m('option', {disabled: true, selected: true}, 'Choose...'),
    m('option', {value: '/admins/view/' + id}, 'View / Edit'),
    m('option', {value: '/admins/delete/' + id}, 'Delete')
  ]);

const parse = (admins) => admins.map(
    function (admin) {
      return {
        username: admin.username(),
        email: admin.email(),
        permissions: JSON.stringify(admin.permissions()),
        actions: getActions(admin.username())
      };
    }
);

Admins.controller = function () {
  Admins.init();
};

Admins.view = (ctrl) => [
  m('h1', 'Admins'),
  m(DataDisplay, {
    names: names,
    data: Admins.adminData
  })
];
