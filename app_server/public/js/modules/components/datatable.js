const m = require('mithril');

const Datatable = module.exports = {};

Datatable.view = function (ctrl, args) {
  return m('table', {className: 'bordered responsive-table'}, [
    m('thead', [
      m('tr', [
        args.columns.map((col) => m('td', args.names[col]))
      ])
    ]),
    m('tbody', [
      args.data.map(function (items) {
        return m('tr', [
          args.columns.map((col) => m('td', items[col]))
        ]);
      })
    ])
  ]);
};
