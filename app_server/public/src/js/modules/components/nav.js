const m = require('mithril');

const App = require('../app');

const Nav = module.exports = {};

Nav.navItems = [];

Nav.updateVisibleItems = function () {
  let scopes = App.getScopes();
  let nav = Nav.navItems = [];

  let contains = (str, sub) => str.indexOf(sub) > -1;

  if (contains(scopes, 'metrics')) {
    nav.push({
      name: 'Metrics', href: '/metrics', icon: 'dashboard',
      sub: [
        {name: 'Overview', href: '/metrics/overview'},
        {name: 'Real-Time', href: '/metrics/realtime'},
        {name: 'Demographics', href: '/metrics/demographics'}
      ]
    });
  }
  if (contains(scopes, 'streams')) {
    nav.push({
      name: 'Streams', href: '/streams', icon: 'videocam',
      sub: [
        {name: 'Live Streams', href: '/streams/live'},
        {name: 'All Streams', href: '/streams/all'},
        {name: 'Search', href: '/streams/search'}
      ]
    });
  }
  if (contains(scopes, 'users')) {
    nav.push({
      name: 'Users', href: '/users', icon: 'people',
      sub: [
        {name: 'All Users', href: '/users/all'},
        {name: 'Search', href: '/users/search'}
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
      name: 'Settings', href: '/settings', icon: 'settings',
      sub: [
        {name: 'Logs', href: '/settings/logs'},
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
        let isActive = m.route().startsWith(item.href);
        return isActive ?
            m('li.active', getLink(item), makeList(item.sub)) :
            m('li', getLink(item));
      })
    ]);
  };

  return makeList(Nav.navItems);
};
