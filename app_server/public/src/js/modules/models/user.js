const m = require('mithril');
const App = require('../app');

const User = module.exports = function (data) {
  this.id = m.prop(data.userId);
  this.username = m.prop(data.username);
  this.platform = m.prop(data.platformType);
  this.alias = m.prop(data.alias || data.username);
  this.description = m.prop(data.description);
  this.email = m.prop(data.email);
};

User.get = (id) =>
    App.request({
      method: 'GET',
      url: '../api/users/' + id,
      type: User
    });

User.list = (order) =>
    App.request({
      method: 'GET',
      url: '../api/users',
      type: User
    });

User.update = (user) =>
    App.request({
      method: 'PUT',
      url: '../api/users/' + user.id(),
      data: {
        alias: user.alias(),
        description: user.description(),
        email: user.email()
      },
      type: User
    });
