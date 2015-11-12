const m = require('mithril');

const UserModel = require('../models/user');

const User = module.exports = {
  controller: function () {
    let id = m.route.param('user') || -1;

    let ctrl = this;

    ctrl.user = m.prop();
    UserModel.get(id).then(ctrl.user);

    ctrl.update = () => UserModel.update(ctrl.user());
  },
  view: function (ctrl) {
    let makeInput = function (id, type, label, prop, options) {
      let inputType = options && options.className === 'materialize-textarea' ?
          'textarea' : 'input';

      let attributes = {
        id: id,
        type: type,
        value: prop(),
        onchange: m.withAttr('value', prop)
      };
      for (let attr in options) {
        attributes[attr] = options[attr];
      }

      return [
        m(inputType, attributes),
        m('label', {for: id, className: 'active'}, label)
      ];
    };

    let user = ctrl.user();

    return [
      m('h1', 'Edit User'),
      m('div', {className: 'input-field col s12'},
          makeInput('username', 'text', 'Username', user.username, {disabled: true})
      ),
      m('div', {className: 'input-field col s12'},
          makeInput('alias', 'text', 'Alias', user.alias)
      ),
      m('div', {className: 'input-field col s12'},
          makeInput('email', 'text', 'Email', user.email)
      ),
      m('div', {className: 'input-field col s12'},
          makeInput('desc', 'text', 'Description', user.description, {className: 'materialize-textarea'}, true)
      ),
      m('div', {className: 'col s12'},
          m('button', {className: 'btn', onclick: ctrl.update}, 'Submit')
      )
    ];
  }
};
