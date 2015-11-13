/*global $*/
const m = require('mithril');

const UserModel = require('../models/user');
const DataDisplay = require('../components/datadisplay');

const platformImg = {
  facebook: '/admin/img/facebook.png'
};

const Users = module.exports = {
  controller: function () {
    let ctrl = this;

    ctrl.columns = m.prop(['id', 'name', 'followers', 'platform', 'actions']);

    ctrl.names = m.prop({
      id: 'Id',
      name: 'Name',
      followers: 'Followers',
      platform: 'Platform',
      actions: 'Actions'
    });

    let selectConfig = {
      config: () => { $('select').material_select(); }, // for materialize-css
      onchange: m.withAttr('value', m.route)
    };

    let getPlatform = (platform) => m('img', {src: platformImg[platform]});

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
            id: user.id(),
            name: user.alias(),
            followers: '42', // TODO: Get user's follower count
            platform: getPlatform(user.platform()),
            actions: getActions(user.id())
          };
        }
    );

    ctrl.data = UserModel.list().then(parse);
  },
  view: function (ctrl) {
    return [m('h1', 'Users'),
      m.component(DataDisplay, {
        columns: ctrl.columns(),
        names: ctrl.names(),
        data: ctrl.data
      })
    ];
  }
};
