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
    m('tbody',
      args.data.length > 0 ? args.data.map(function (items) {
        return m('tr', [
          columns.map((col) => m('td', items[col]))
        ]);
      }) : m('td.center-align', {colspan: columns.length},
          m('em', 'There\'s nothing found to show here!')
      )
    )
  ]);
};
