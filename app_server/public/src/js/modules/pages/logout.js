const App = require('../app');
const AdminModel = require('../models/admin');

const Logout = module.exports = {};

Logout.controller = function () {
  AdminModel.logout();
  App.logout();
  App.goToHome();
};
