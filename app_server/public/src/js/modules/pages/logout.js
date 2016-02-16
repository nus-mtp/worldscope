const App = require('../app');
const AdminModel = require('../models/admin');

const Logout = module.exports = {};

Logout.controller = function () {
  AdminModel.logout();
  window.localStorage.removeItem('ws-user');
  window.localStorage.removeItem('ws-scopes');
  App.goToHome();
};
