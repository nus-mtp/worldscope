const m = require('mithril');
const nav = require('./components/nav');

const mixinPage = function (nav, page) {
  return {
    controller: function() {
      let ctrl = this;
      ctrl.navCtrl = new nav.controller();
      ctrl.pageCtrl = new page.controller();
    },
    view: function(ctrl) {
      return m('div#container.row', [
        m('div#nav.col s2 l1',
            nav.view(ctrl.navCtrl)),
        m('div#content.col offset-s2 s10 offset-l1 l11',
            page.view(ctrl.pageCtrl))
      ]);
    }
  };
};

// TODO: remove after implementing pages
const blank = mixinPage(nav, {
  controller: () => {},
  view: () => m('div', 'TODO')
});

const App = module.exports = {};

App.routes = {
  locked: {
    '/login': require('./pages/login')
  },
  app: {
    '/metrics': {controller: () => m.route('/metrics/overview')},
    '/metrics/overview': blank,
    '/metrics/realtime': blank,
    '/metrics/demographics': blank,

    '/streams': {controller: () => m.route('/streams/live')},
    '/streams/live': blank,
    '/streams/all': mixinPage(nav, require('./pages/streams')),
    '/streams/search': blank,
    '/streams/view/:id': blank,
    '/streams/stop/:id': blank,

    '/users': {controller: () => m.route('/users/all')},
    '/users/all': mixinPage(nav, require('./pages/users')),
    '/users/search': blank,
    '/users/view/:id': mixinPage(nav, require('./pages/user')),

    '/admins': {controller: () => m.route('/admins/all')},
    '/admins/all': blank,
    '/admins/create': blank,

    '/settings': blank
  }
};

// TODO: Separate into Authentication module
App.goToHome = function () {
  let isLoggedIn = window.localStorage.getItem('ws-user');
  if (isLoggedIn) {
    m.route(document.body, '/metrics', App.routes.app);
  } else {
    m.route(document.body, '/login', App.routes.locked);
  }
  m.route('/');
};

App.goToHome();

