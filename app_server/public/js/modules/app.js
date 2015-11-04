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
      return m('div', {id: 'container', class: 'row'}, [
        m('div', {id: 'nav', class: 'col s2 l1'},
            nav.view(ctrl.navCtrl)),
        m('div', {id: 'content', class: 'col offset-s2 s10 offset-l1 l11'},
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
    '/streams/all': mixinPage(nav, require('./pages/streams')),
    '/streams/search': blank,
    '/streams/view/:id': blank,
    '/streams/stop/:id': blank,

    '/users': {controller: () => m.route('/users/all')},
    '/users/all': blank,
    '/users/search': blank,
    '/users/view/:id': mixinPage(nav, require('./pages/user')),

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
