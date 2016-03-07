const m = require('mithril');

const mz = require('../utils/mzInit');

const UserModel = require('../models/user');

const User = module.exports = {};

User.user = m.prop();

User.update = function (e) {
  e.preventDefault();
  UserModel.update(User.user()).then(
      () => m.route('/users')
  );
};

User.controller = function () {
  let id = m.route.param('id') || -1;

  UserModel.get(id).then(User.user);
};

User.view = function () {
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

  let user = User.user();
  return [
    m('h1', 'Edit User'),
    m('form.col s12', Object.assign({onsubmit: User.update}, mz.text), [
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
      m('button.btn col s12', {type: 'submit'}, 'Edit User')
    ])
  ];
};
