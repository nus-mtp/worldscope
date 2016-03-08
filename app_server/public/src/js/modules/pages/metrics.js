const m = require('mithril');

const MetricsApi = require('../models/metric');

const Metrics = module.exports = {
  users: {}
};

Metrics.init = function () {
  Metrics.users.metrics = MetricsApi.users.getMetrics().then(
      function (metrics) {
        Metrics.users.count = metrics.count;
      },
      function (err) {
        console.log(err);
      }
  );

};

const getCard = (title, content) =>
    m('div.col s12 m4 l3',
        m('div.card white',
            m('div.card-content', [
              m('span.card-title', title),
              m('p', content)
            ])
        )
    );

Metrics.controller = function () {
  Metrics.init();
};

Metrics.view = () => [
  m('h1', 'Metrics'),
  m('div.row', [
      getCard('User Count', Metrics.users.count)
  ])
];
