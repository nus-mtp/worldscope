const m = require('mithril');

const mz = require('../utils/mzInit');

const UserModel = require('../models/user');
const DataDisplay = require('../components/datadisplay');

const platformImg = {
  facebook: '/admin/img/facebook.png'
};

const Users = module.exports = {
  controller: function () {
    let ctrl = this;

    ctrl.names = m.prop({
      id: 'Id',
      name: 'Name',
      subscribers: 'Subscribers',
      platform: 'Platform',
      actions: 'Actions'
    });

    let getPlatform = (platform) => m('img', {src: platformImg[platform]});

    let getActions = (id) => [
      m('select', mz.select, [
        m('option', {disabled: true, selected: true}, 'Choose...'),
        m('option', {value: '/users/view/' + id}, 'View / Edit')
      ])
    ];

    let parse = (users) => users.map(
        function (user) {
          return {
            id: user.id(),
            name: user.alias(),
            subscribers: '42', // TODO: Get user's subscriber count
            platform: getPlatform(user.platform()),
            actions: getActions(user.id())
          };
        }
    );

    ctrl.data = UserModel.list().then(parse);
  },
  view: function (ctrl) {
    return [m('h1', 'Users'),
      m(DataDisplay, {
        names: ctrl.names(),
        data: ctrl.data
      })
    ];
  }
};
