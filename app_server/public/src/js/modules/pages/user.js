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
    let getLabelledInput = function (label, id, type, prop, options) {
      let inputType = options && options.className === 'materialize-textarea' ?
          'textarea' : 'input';

      let attributes = {
        type: type,
        value: prop(),
        onchange: m.withAttr('value', prop)
      };
      for (let attr in options) {
        attributes[attr] = options[attr];
      }

      return [
        m(inputType + '#' + id, attributes),
        m('label.active', {for: id}, label)
      ];
    };

    let user = ctrl.user();
    return [
      m('h1', 'Edit User'),
      m('div.input-field col s12',
          getLabelledInput('Username', 'username', 'text', user.username,
              {disabled: true})
      ),
      m('div.input-field col s12',
          getLabelledInput('Alias', 'alias', 'text', user.alias)
      ),
      m('div.input-field col s12',
          getLabelledInput('Email', 'email', 'text', user.email)
      ),
      m('div.input-field col s12',
          getLabelledInput('Description', 'desc', 'text', user.description,
              {className: 'materialize-textarea'})
      ),
      m('div.col s12',
          m('button.btn', {onclick: ctrl.update}, 'Submit')
      )
    ];
  }
};
