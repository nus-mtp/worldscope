const App = require('../app');

const Metric = module.exports = {
  users: {}
};

Metric.users.getMetrics = () =>
    App.request({
      method: 'GET',
      url: '../api/users/metrics'
    });
