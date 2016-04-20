const m = require('mithril');

const App = require('../app');

const Nav = module.exports = {};

Nav.navItems = [];

Nav.updateVisibleItems = function () {
  let scopes = App.getScopes();
  let nav = Nav.navItems = [];

  let contains = (str, sub) => str.indexOf(sub) > -1;

  if (contains(scopes, 'streams')) {
    nav.push({
      name: 'Streams', href: '/streams', icon: 'videocam',
      sub: [
        {name: 'Live Streams', href: '/streams/live'},
        {name: 'All Streams', href: '/streams/all'}
      ]
    });
  }
  if (contains(scopes, 'users')) {
    nav.push({
      name: 'Users', href: '/users', icon: 'people',
      sub: [
        {name: 'All Users', href: '/users/all'}
      ]
    });
  }
  if (contains(scopes, 'admins')) {
    nav.push({
      name: 'Admins', href: '/admins', icon: 'visibility',
      sub: [
        {name: 'All Admins', href: '/admins/all'},
        {name: 'Create Admin', href: '/admins/create'}
      ]
    });
  }
  if (contains(scopes, 'settings')) {
    nav.push({
      name: 'Logs', href: '/settings', icon: 'settings',
      sub: [
        {name: 'General Logs', href: '/settings/logs'},
        {name: 'Response Logs', href: '/settings/responses'}
      ]
    });
  }

  nav.push({
    name: 'Logout',
    href: '/logout',
    icon: 'arrow_back',
    sub: []
  });

  return nav;
};

Nav.getFirstLocation = () => Nav.navItems[0].href;

Nav.view = function () {
  let getName = (item) => item.icon ?
      [m('i.material-icons', item.icon), ' ', m('span', item.name)] : item.name;
  let getLink = (item) =>
      m('a[href="' + item.href + '"]', {config: m.route}, getName(item));

  let makeList = function (items) {
    if (!items) {
      return;
    }

    return m('ul', [
      items.map(function (item) {
        let isActive = m.route().indexOf(item.href) === 0;
        return isActive ?
            m('li.active', getLink(item), makeList(item.sub)) :
            m('li', getLink(item));
      })
    ]);
  };

  return makeList(Nav.navItems);
};
