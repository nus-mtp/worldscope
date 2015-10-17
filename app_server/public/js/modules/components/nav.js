const m = require('mithril');

const Nav = module.exports = {};

Nav.navItems = [
  {
    'name': 'Metrics', 'href': '/metrics',
    'sub': [
      {'name': 'Overview', 'href': '/metrics/overview'},
      {'name': 'Real-Time', 'href': '/metrics/realtime'},
      {'name': 'Demographics', 'href': '/metrics/demographics'}
    ]
  },
  {
    'name': 'Streams', 'href': '/streams',
    'sub': [
      {'name': 'Live Streams', 'href': '/streams/live'},
      {'name': 'All Streams', 'href': '/streams/all'},
      {'name': 'Search', 'href': '/streams/search'}
    ]
  },
  {
    'name': 'Users', 'href': '/users',
    'sub': [
      {'name': 'All Users', 'href': '/users/all'},
      {'name': 'Search', 'href': '/users/search'}
    ]
  },
  {
    'name': 'Admins', 'href': '/admins',
    'sub': [
      {'name': 'All Admins', 'href': '/admins/all'},
      {'name': 'Create Admin', 'href': '/admins/create'}
    ]
  },
  {
    'name': 'Settings',
    'href': '/settings',
    'sub': []
  }
];
