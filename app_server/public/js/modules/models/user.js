const m = require('mithril');

const User = module.exports = function (data) {
  this.id = m.prop(data.userId);
  this.username = m.prop(data.username);
  this.platform = m.prop(data.platformType);
  this.alias = m.prop(data.alias);
  this.description = m.prop(data.description);
  this.email = m.prop(data.email);
};
