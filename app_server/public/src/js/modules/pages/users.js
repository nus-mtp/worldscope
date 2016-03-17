const m = require('mithril');

const DataDisplay = require('../components/datadisplay');
const UserModel = require('../models/user');

const Users = module.exports = {};

Users.init = function () {
  Users.userData = UserModel.list().then(parse);
};

const platformImg = {
  facebook: '/admin/img/facebook.png'
};

const names = {
  id: 'Id',
  name: 'Name',
  subscribers: 'Subscribers',
  platform: 'Platform',
  actions: 'Actions'
};

const getPlatformImg = (platform) => m('img', {src: platformImg[platform]});

const getActions = (id) => [
  m('select', {onchange: m.withAttr('value', m.route)}, [
    m('option', {disabled: true, selected: true}, 'Choose...'),
    m('option', {value: '/users/view/' + id}, 'View / Edit')
  ])
];

const parse = (users) => users.map(
    function (user) {
      return {
        id: user.id(),
        name: user.alias(),
        subscribers: '42', // TODO: Get user's subscriber count
        platform: getPlatformImg(user.platform()),
        actions: getActions(user.id())
      };
    }
);

Users.controller = function () {
  Users.init();
};

Users.view = () => [
  m('h1', 'Users'),
  m(DataDisplay, {
    names: names,
    data: Users.userData
  })
];
