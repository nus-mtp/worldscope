const m = require('mithril');

const UserModel = require('../models/user');

const User = module.exports = {
  controller: function () {
    let ctrl = this;
    let id = m.route.param('user') || -1;
    ctrl.user = UserModel.get(id);
  },
  view: function (ctrl) {
    let makeInput = (id, type, label, prop, isManyLines) => [
      m(isManyLines ? 'textarea' : 'input', {
        id: id,
        className: isManyLines ? 'materialize-textarea' : '',
        type: type,
        value: prop(),
        onchange: m.withAttr('value', prop)
      }),
      m('label', {for: id, className: 'active'}, label)
    ];

    let user = ctrl.user();

    return [
      m('h1', 'Edit User'),
      m('div', {className: 'input-field col s12'},
          makeInput('username', 'text', 'Username', user.username)
      ),
      m('div', {className: 'input-field col s12'},
          makeInput('alias', 'text', 'Alias', user.alias)
      ),
      m('div', {className: 'input-field col s12'},
          makeInput('email', 'text', 'Email', user.email)
      ),
      m('div', {className: 'input-field col s12'},
          makeInput('desc', 'text', 'Description', user.description, true)
      ),
      m('div', {className: 'col s12'},
          m('button', {className: 'btn'}, 'Submit')
      )
    ];
  }
};
