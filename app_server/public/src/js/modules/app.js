const m = require('mithril');

const Nav = require('./components/nav');
const ErrorDisplay = require('./components/errordisplay');

const templatePage = (content) => m('div#container.row', [ErrorDisplay, content]);

const wrapView = function (wrapper, vElement) {
  let wrappedElement = Object.assign({}, vElement);
  wrappedElement.view = (ctrl, args) => wrapper(vElement.view(ctrl, args));
  return wrappedElement;
};
const navPage = function (page) {
  let wrappedNav = wrapView((e) => m('div#nav.col s2 l1', e), Nav);
  let wrappedPage = wrapView((e) => m('div#content.col offset-s2 s10 offset-l1 l11', e), page);

  return {
    view: () => templatePage([wrappedNav, wrappedPage])
  };
};

// TODO: remove after implementing pages
const blank = navPage({
  view: () => m('div', 'TODO')
});

const App = module.exports = {};

App.routes = {
  locked: {
    '/login': wrapView(templatePage, require('./pages/login'))
  },
  app: {
    '/metrics': {controller: () => m.route('/metrics/overview')},
    '/metrics/overview': blank,
    '/metrics/realtime': blank,
    '/metrics/demographics': blank,

    '/streams': {controller: () => m.route('/streams/live')},
    '/streams/live': blank,
    '/streams/all': navPage(require('./pages/streams')),
    '/streams/search': blank,
    '/streams/view/:id': blank,
    '/streams/stop/:id': blank,

    '/users': {controller: () => m.route('/users/all')},
    '/users/all': navPage(require('./pages/users')),
    '/users/search': blank,
    '/users/view/:id': navPage(require('./pages/user')),

    '/admins': {controller: () => m.route('/admins/all')},
    '/admins/all': navPage(require('./pages/admins')),
    '/admins/create': navPage(require('./pages/admin')),
    '/admins/view/:username': navPage(require('./pages/admin')),
    '/admins/delete/:username': navPage(require('./pages/admin')),

    '/settings': blank
  }
};

// TODO: Separate into Authentication module
App.isLoggedIn = () => window.localStorage.getItem('ws-user');

App.updateRoutes = function () {
  if (App.isLoggedIn()) {
    m.route(document.body, '/metrics', App.routes.app);
  } else {
    m.route(document.body, '/login', App.routes.locked);
  }
};
App.goToHome = function () {
  App.updateRoutes();
  m.route('/');
};

App.updateRoutes();

