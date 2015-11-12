const m = require('mithril');

const User = module.exports = function (data) {
  this.id = m.prop(data.userId);
  this.username = m.prop(data.username);
  this.platform = m.prop(data.platformType);
  this.alias = m.prop(data.alias);
  this.description = m.prop(data.description);
  this.email = m.prop(data.email);
};

User.get = () =>
    m.request({
      method: 'GET',
      url: 'js/modules/mockdata/user.json',
      type: User
    });

User.list = () =>
    m.request({
      method: 'GET',
      url: 'js/modules/mockdata/users.json',
      type: User
    });

User.update = (user) =>
    m.request({
      method: 'PUT',
      url: '/users/' + user.id(),
      data: {
        alias: user.alias(),
        description: user.description(),
        email: user.email()
      }
    });
