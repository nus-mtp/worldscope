const m = require('mithril');
const nav = require('./components/nav');

const mixinPage = function (nav, page) {
  return {
    view: function() {
      return m('div', {id: 'container'}, [
        m('div', {id: 'nav'}, nav),
        m('div', {id: 'content'}, page)
      ]);
    }
  };
};

// TODO: remove after implementing pages
const blank = mixinPage(nav, {view: () => m('div', 'TODO')});

const routes = {
  locked: {
    '/login': blank
  },
  app: {
    '/metrics': {controller: () => m.route('/metrics/overview')},
    '/metrics/overview': blank,
    '/metrics/realtime': blank,
    '/metrics/demographics': blank,

    '/streams': {controller: () => m.route('/streams/live')},
    '/streams/live': blank,
    '/streams/all': blank,
    '/streams/search': blank,

    '/users': {controller: () => m.route('/users/all')},
    '/users/all': blank,
    '/users/search': blank,

    '/admins': {controller: () => m.route('/admins/all')},
    '/admins/all': blank,
    '/admins/create': blank,

    '/settings': blank
  }
};

// TODO: Separate into Authentication module
const isLoggedIn = true;
if (!isLoggedIn) {
  m.route(document.body, '/login', routes.locked);
} else {
  m.route(document.body, '/metrics', routes.app);
}
