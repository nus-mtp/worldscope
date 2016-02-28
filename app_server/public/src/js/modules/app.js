const m = require('mithril');

const App = module.exports = {};

const Nav = require('./components/nav');
const Alert = require('./components/alert');

const templatePage = (content) => m('div#container', [Alert, content]);

const wrapView = function (wrapper, vElement) {
  let wrappedElement = Object.assign({}, vElement);
  wrappedElement.view = (ctrl, args) => wrapper(vElement.view(ctrl, args));
  return wrappedElement;
};
const navPage = function (page) {
  let wrappedNav = wrapView((e) => m('div#nav', e), Nav);
  let wrappedPage = wrapView((e) => m('div#content.row', e), page);

  return {
    view: () => templatePage([wrappedNav, wrappedPage])
  };
};

// TODO: remove after implementing pages
const blank = navPage({
  view: () => [m('h1', 'To-do'), m('div', 'TODO')]
});

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
    '/streams/live': navPage(require('./pages/streams')),
    '/streams/all': navPage(require('./pages/streams')),
    '/streams/search': blank,
    '/streams/view/:id': navPage(require('./pages/stream')),
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

    '/settings': blank,

    '/logout': require('./pages/logout')
  }
};

// Used when logged in
App.request = function (originalOptions) {
  let options = Object.assign({}, originalOptions);

  options.config = options.config || function (xhr) {
    xhr.setRequestHeader(App.CSRF_HEADER,
        window.localStorage.getItem(App.CSRF_HEADER));
  };

  return m.request(options);
};

// TODO: Separate into Authentication module
App.CSRF_HEADER = 'x-csrf-token';

App.isLoggedIn = function () {
  return document.cookie.length > 0 &&
      window.localStorage.getItem('ws-user') &&
      window.localStorage.getItem('ws-scopes') &&
      window.localStorage.getItem(App.CSRF_HEADER);
};

App.login = function (admin, csrfToken) {
  window.localStorage.setItem('ws-user', admin.userId);
  window.localStorage.setItem('ws-scopes', admin.permissions);
  window.localStorage.setItem(App.CSRF_HEADER, csrfToken);
  App.updateRoutes();
};

App.logout = function () {
  window.localStorage.removeItem('ws-user');
  window.localStorage.removeItem('ws-scopes');
  window.localStorage.removeItem(App.CSRF_HEADER);
  App.updateRoutes();
};

App.getScopes = () => window.localStorage.getItem('ws-scopes');

App.updateRoutes = function () {
  if (App.isLoggedIn()) {
    Nav.updateVisibleItems();
    m.route(document.body, Nav.getFirstLocation(), App.routes.app);
  } else {
    m.route(document.body, '/login', App.routes.locked);
  }
};
App.goToHome = function () {
  m.route('/');
};

App.updateRoutes();
