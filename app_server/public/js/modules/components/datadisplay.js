const m = require('mithril');

const ItemsCount = require('../components/itemscount');
const Pagination = require('../components/pagination');
const DataTable = require('../components/datatable');

const DataDisplay = module.exports = {};

const ITEMS_PER_PAGE = [10, 30, 50];

DataDisplay.controller = function () {
  let ctrl = this;

  ctrl.currentPage = m.prop(m.route.param('page') || 1);
  ctrl.itemsPerPage = m.prop(m.route.param('items') || ITEMS_PER_PAGE[0]);
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

DataDisplay.view = function (ctrl, args) {
  let data = args.data.then(ctrl.setMaxPage).then(ctrl.paginate);

  let pagination = m(Pagination, {
    maxPage: ctrl.maxPage,
    currentPage: ctrl.currentPage
  });

  return m('div', [
    m(ItemsCount, {
      possibleItemsPerPage: ITEMS_PER_PAGE,
      itemsPerPage: ctrl.itemsPerPage
    }),
    pagination,
    m(DataTable, {
      names: args.names,
      data: data()
    }),
    pagination
  ]);
};
