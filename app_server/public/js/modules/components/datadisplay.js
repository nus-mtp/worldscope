const m = require('mithril');

const Pagination = require('../components/pagination');
const Datatable = require('../components/datatable');

const Datadisplay = module.exports = {};

Datadisplay.controller = function () {
  let ctrl = this;

  ctrl.currentPage = m.prop(m.route.param('page') || 1);
  ctrl.itemsPerPage = m.prop(m.route.param('items') || 10);
  ctrl.maxPage = m.prop(1);

  ctrl.setMaxPage = function (items) {
    ctrl.maxPage(Math.floor(items.length / ctrl.itemsPerPage() + 1));
    return items;
  };

  ctrl.paginate = function (items) {
    let count = parseInt(ctrl.itemsPerPage());
    let from = (parseInt(ctrl.currentPage()) - 1) * count;
    let to = from + count;
    return items.slice(from, to);
  };
};

Datadisplay.view = function (ctrl, args) {
  let data = args.data.then(ctrl.setMaxPage).then(ctrl.paginate);

  let pagination = m.component(Pagination, {
    maxPage: ctrl.maxPage,
    currentPage: ctrl.currentPage,
    itemsPerPage: ctrl.itemsPerPage
  });

  return m('div', [
    pagination,
    m.component(Datatable, {
      columns: args.columns,
      names: args.names,
      data: data()
    }),
    pagination
  ]);
};