const m = require('mithril');

const mz = require('../utils/mzInit');

const AdminModel = require('../models/admin');
const ErrorDisplay = require('../components/errordisplay');

const Admin = module.exports = {};

const createPage = {
  title: 'Create Admin',
  admin: m.prop(),
  activeForm: true,
  init: function () {
    Admin.admin(new AdminModel());
    initPermissions(Admin.admin());
  },
  action: function (e) {
    e.preventDefault();
    AdminModel.create(Admin.admin()).then(
        () => m.route('/admins'),
        (err) => ErrorDisplay.setMessage(err.message)
    );
  }
};

const editPage = {
  title: 'Edit Admin',
  admin: m.prop(),
  activeForm: true,
  init: function () {
    AdminModel.get(Admin.username).then(Admin.admin).then(initPermissions);
  },
  action: function (e) {
    e.preventDefault();
    AdminModel.update(Admin.admin()).then(
        () => m.route('/admins'),
        (err) => ErrorDisplay.setMessage(err.message)
    );
  }
};

const deletePage = {
  title: 'Delete Admin',
  admin: m.prop(),
  activeForm: false,
  init: function () {
    AdminModel.get(Admin.username).then(Admin.admin).then(initPermissions);
  },
  action: function (e) {
    e.preventDefault();
    AdminModel.delete(Admin.admin()).then(
        () => m.route('/admins'),
        (err) => ErrorDisplay.setMessage(err.message)
    );
  }
};

const permissionsWrapper = {
  metrics: m.prop(false),
  streams: m.prop(false),
  users: m.prop(false),
  admins: m.prop(false),
  settings: m.prop(false)
};

const initPermissions = function (admin) {
  Object.keys(permissionsWrapper).forEach(function (permission) {
    let isAllowed = admin.permissions().indexOf(permission) !== -1;
    permissionsWrapper[permission](isAllowed);
  });
};

const updatePermissions = function () {
  let permissionsArr = [];
  Object.keys(permissionsWrapper)
      .filter((p) => permissionsWrapper[p]())
      .forEach(function (permission) {
        permissionsArr.push(permission);
      });

  Admin.admin().permissions(permissionsArr);
};

Admin.controller = function () {
  Admin.username = m.route.param('username') || '';

  let currentPage = m.route();
  if (currentPage.startsWith('/admins/create')) {
    Object.assign(Admin, createPage);
  } else if (currentPage.startsWith('/admins/view')) {
    Object.assign(Admin, editPage);
  } else if (currentPage.startsWith('/admins/delete')) {
    Object.assign(Admin, deletePage);
  }

  Admin.init();
};

Admin.view = function () {
  let getLabelledInput = function (label, id, type, prop) {
    let attributes = {
      disabled: !Admin.activeForm,
      type: type,
      value: prop(),
      onchange: m.withAttr('value', prop)
    };

    return [
      m('input#' + id, attributes),
      m('label', {for: id}, label)
    ];
  };

  let getPermissionCheckbox = function (label, id, prop) {
    let attributes = {
      disabled: !Admin.activeForm,
      type: 'checkbox',
      checked: prop(),
      onclick: m.withAttr('checked', prop),
      onchange: updatePermissions
    };
    return m('div.col s2', [
      m('input#' + id, attributes),
      m('label', {for: id}, label)
    ]);
  };

  let admin = Admin.admin();
  return [
    m('div.row', mz.text, [
      m('h1', Admin.title),
      m('form.col s12', {onsubmit: Admin.action}, [
        m('div.input-field col s12',
            getLabelledInput('Username', 'username', 'text', admin.username)
        ),
        m('div.input-field col s12',
            getLabelledInput('Password', 'password', 'password', admin.password)
        ),
        m('div.input-field col s12',
            getLabelledInput('Email', 'email', 'text', admin.email)
        ),
        m('div.row', [
          m('div.col s2 grey-text', 'Permissions:'),
          getPermissionCheckbox('Access to Metrics', 'metrics', permissionsWrapper.metrics),
          getPermissionCheckbox('Access to Streams', 'streams', permissionsWrapper.streams),
          getPermissionCheckbox('Access to Users', 'users', permissionsWrapper.users),
          getPermissionCheckbox('Access to Admins', 'admins', permissionsWrapper.admins),
          getPermissionCheckbox('Access to Settings', 'settings', permissionsWrapper.settings)
        ]),
        m('button.btn col s12', {type: 'submit'}, Admin.title)
      ])
    ])
  ];
};
