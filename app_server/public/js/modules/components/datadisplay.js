const m = require('mithril');

const Pagination = require('../components/pagination');
const Datatable = require('../components/datatable');

const Datadisplay = module.exports = {};

Datadisplay.controller = function () {
  let ctrl = this;

  ctrl.currentPage = m.prop(m.route.param('page') || 1);
  ctrl.itemsPerPage = m.prop(10);

  ctrl.paginate = function (items) {
    let count = parseInt(ctrl.itemsPerPage());
    let from = (parseInt(ctrl.currentPage()) - 1) * count;
    let to = from + count;
    return items.slice(from, to);
  };
};

Datadisplay.view = function (ctrl, args) {
  let data = args.data.then(ctrl.paginate);

  return m('div', [
    m.component(Pagination, {
      currentPage: ctrl.currentPage()
    }),
    m.component(Datatable, {
      columns: args.columns,
      names: args.names,
      data: data()
    })
  ]);
};