const m = require('mithril');

const Admin = module.exports = function (data = {}) {
  this.id = m.prop(data.userId || '');
  this.username = m.prop(data.username || '');
  this.password = m.prop(data.password || '');
  this.email = m.prop(data.email || '');
  this.permissions = m.prop(data.permissions || []);
};

Admin.login = (admin) =>
    m.request({
      method: 'POST',
      url: '../api/admins/login',
      data: {
        username: admin.username(),
        password: admin.password()
      }
    });

Admin.get = (username) =>
    m.request({
      method: 'GET',
      url: '../api/admins/' + username,
      type: Admin
    });

Admin.list = () =>
    m.request({
      method: 'GET',
      url: '../api/admins',
      type: Admin
    });

Admin.update = (admin) =>
    m.request({
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
