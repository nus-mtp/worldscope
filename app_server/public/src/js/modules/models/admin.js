const m = require('mithril');

const Admin = module.exports = function (data = {}) {
  this.id = m.prop(data.adminId);
  this.username = m.prop(data.username);
  this.password = m.prop(data.password);
  this.email = m.prop(data.email);
  this.permissions = m.prop(data.permissions);
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
