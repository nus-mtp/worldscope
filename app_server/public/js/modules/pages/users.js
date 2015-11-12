/*global $*/
const m = require('mithril');

const UserModel = require('../models/user');
const Datadisplay = require('../components/datadisplay');

const Users = module.exports = {
  controller: function () {
    let ctrl = this;

    ctrl.columns = m.prop(['actions']);

    ctrl.names = m.prop({
      actions: 'Actions'
    });

    let selectConfig = {
      config: () => { $('select').material_select(); }, // for materialize-css
      onchange: m.withAttr('value', m.route)
    };

    let getActions = (id) => [
      m('select', selectConfig, [
        m('option', {disabled: true, selected: true}, 'Choose...'),
        m('option', {value: '/users/view/' + id}, 'View / Edit')
      ]),
      m('label', 'Items per Page')
    ];

    let parse = (users) => users.map(
        function (user) {
          return {
            actions: getActions(user.id())
          };
        }
    );

    ctrl.data = UserModel.list().then(parse);
  },
  view: function (ctrl) {
    return [m('h1', 'Users'),
      m.component(Datadisplay, {
        columns: ctrl.columns(),
        names: ctrl.names(),
        data: ctrl.data
      })
    ];
  }
};
