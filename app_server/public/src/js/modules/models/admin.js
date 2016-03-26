const m = require('mithril');
const App = require('../app');

const Admin = module.exports = function (data = {}) {
  this.id = m.prop(data.userId || '');
  this.username = m.prop(data.username || '');
  this.password = m.prop(data.password || '');
  this.email = m.prop(data.email || '');
  this.permissions = m.prop(data.permissions || []);
};

Admin.login = (admin) =>
    App.request({
      method: 'POST',
      url: '../api/admins/login',
      data: {
        username: admin.username(),
        password: admin.password()
      },
      type: Admin
    });

Admin.logout = () =>
    App.request({
      method: 'GET',
      url: '../api/admins/logout',
      deserialize: (text) => text
    });

Admin.create = (admin) =>
    App.request({
      method: 'POST',
      url: '../api/admins',
      data: {
        username: admin.username(),
        password: admin.password(),
        email: admin.email(),
        permissions: admin.permissions()
      }
    });

Admin.get = (username) =>
    App.request({
      method: 'GET',
      url: '../api/admins/' + username,
      type: Admin
    });

Admin.list = () =>
    App.request({
      method: 'GET',
      url: '../api/admins',
      type: Admin
    });

Admin.update = (admin) =>
    App.request({
      method: 'PUT',
      url: '../api/admins/' + admin.id(),
      data: (function () {
        let payload = {
          username: admin.username(),
          email: admin.email(),
          permissions: admin.permissions()
        };
        if (admin.password()) {
          payload.password = admin.password;
        }
        return payload;
      }()),
      type: Admin
    });

Admin.delete = (admin) =>
    App.request({
      method: 'DELETE',
      url: '../api/admins/' + admin.id()
    });
