const m = require('mithril');

const Metrics = module.exports = {};

Metrics.init = function () {

};

const getCard = (content) => m('div.col s12 m4 l3',
    m('div.card-panel white',
        m('span', content)
    )
);

Metrics.controller = function () {
  Metrics.init();
};

Metrics.view = () => [
  m('h1', 'Metrics'),
  m('div.row', [
      getCard('Todo')
  ])
];
