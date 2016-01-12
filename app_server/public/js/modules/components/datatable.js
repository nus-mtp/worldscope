const m = require('mithril');

const DataTable = module.exports = {};

DataTable.view = function (ctrl, args) {
  return m('table', {className: 'bordered striped responsive-table'}, [
    m('thead', [
      m('tr', [
        args.columns.map((col) => m('th', args.names[col]))
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
