const m = require('mithril');

const mz = require('../utils/mzInit');

const AdminModel = require('../models/admin');

const Admin = module.exports = {};

const createPage = {
  title: 'Create Admin',
  admin: m.prop(),
  init: function () {
    Admin.admin(new AdminModel());
  },
  action: function (e) {
    e.preventDefault();
    AdminModel.create(Admin.admin()).then(
        () => m.route('/admins'),
        (err) => console.log(err) // TODO: display error
    );
  }
};

const editPage = {
  title: 'Edit Admin',
  admin: m.prop(),
  init: function () {
    AdminModel.get(Admin.username).then(Admin.admin);
  },
  action: function (e) {
    e.preventDefault();
    AdminModel.update(Admin.admin()).then(
        () => m.route('/admins'),
        (err) => console.log(err) // TODO: display error
    );
  }
};

Admin.controller = function () {
  Admin.username = m.route.param('username') || '';

  if (Admin.username) {
    Object.assign(Admin, editPage);
  } else {
    Object.assign(Admin, createPage);
  }

  Admin.init();
};

Admin.view = function () {
  let getLabelledInput = function (label, id, type, prop) {
    let attributes = {
      type: type,
      value: prop(),
      onchange: m.withAttr('value', prop)
    };

    return [
      m('input#' + id, attributes),
      m('label', {for: id}, label)
    ];
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
        m('button.btn col s12', {type: 'submit'}, Admin.title)
      ])
    ])
  ];
};
