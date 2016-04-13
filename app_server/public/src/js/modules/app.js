const m = require('mithril');

const App = module.exports = {};

const Nav = require('./components/nav');
const Alert = require('./components/alert');

const templatePage = (content) => [Alert, m('div#container', content)];

const wrapView = function (wrapper, vElement) {
  let wrappedElement = Object.assign({}, vElement);
  wrappedElement.view = (ctrl, args) => wrapper(vElement.view(ctrl, args));
  return wrappedElement;
};
const navPage = function (page) {
  let wrappedNav = wrapView((e) => m('div#nav', [
    m('img', {src: '/admin/img/logo.png'}),
    e
  ]), Nav);
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
    '/streams/stop/:id': require('./pages/streamstop'),

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
    '/settings/logs': navPage(require('./pages/logs')),
    '/settings/responses': navPage(require('./pages/logs')),

    '/logout': require('./pages/logout')
  }
};

// Used when logged in
// Also extends error handling in m.request with a default action.
// The default action can also be used via errorCallback(error, defaultCallback)
// where defaultCallback takes in error as its only parameter.
App.request = function (originalOptions) {
  let options = Object.assign({}, originalOptions);

  if (App.isLoggedIn()) {
    options.config = options.config || function (xhr) {
      xhr.setRequestHeader(App.CSRF_HEADER,
          window.localStorage.getItem(App.CSRF_HEADER));
    };
  }

  let request = m.prop(options.initialValue);
  let showError = (err) => Alert.setError(err);
  request.then = (resolve, reject) =>
      m.request(options).then(
          resolve,
          function (err) {
            err = err || {network: true}; // if server is unavailable

            if (err.statusCode === 401 ||
                err.statusCode === 403) {
              App.logout();
              App.goToHome();

              if (err.statusCode === 403) {
                // attempted to access unauthorized section
                reject = null;
                err = {unauthorized: true};
              }

              m.redraw();
            }

            reject ? reject(err, showError) : showError(err);
          });
  return request;
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
  window.localStorage.setItem('ws-user', admin.id());
  window.localStorage.setItem('ws-scopes', admin.permissions());
  window.localStorage.setItem(App.CSRF_HEADER, csrfToken);
  App.updateRoutes();
};

App.logout = function () {
  window.localStorage.removeItem('ws-user');
  window.localStorage.removeItem('ws-scopes');
  window.localStorage.removeItem(App.CSRF_HEADER);
  App.updateRoutes();
};

App.getLoggedInUser = () => window.localStorage.getItem('ws-user');
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
