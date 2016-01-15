const m = require('mithril');

const DataTable = module.exports = {};

DataTable.view = function (ctrl, args) {
  let columns = Object.keys(args.names);
  return m('table.bordered striped responsive-table', [
    m('thead', [
      m('tr', [
        columns.map((col) => m('th', args.names[col]))
      ])
    ]),
    m('tbody', [
      args.data.map(function (items) {
        return m('tr', [
          columns.map((col) => m('td', items[col]))
        ]);
      })
    ])
  ]);
};
