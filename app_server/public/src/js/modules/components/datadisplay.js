const m = require('mithril');

const mz = require('../utils/mzInit');

const ItemsCount = require('../components/itemscount');
const Pagination = require('../components/pagination');
const DataTable = require('../components/datatable');

const DataDisplay = module.exports = {
  currentPage: m.prop(),
  itemsPerPage: m.prop(),
  maxPage: m.prop()
};

const ITEMS_PER_PAGE = [10, 30, 50];

const updatePageVars = function (items) {
  DataDisplay.maxPage(Math.floor((items.length - 0.5) / DataDisplay.itemsPerPage() + 1));
  DataDisplay.currentPage(Math.min(DataDisplay.currentPage(), DataDisplay.maxPage()));
  return items;
};

const paginate = function (items) {
  let count = parseInt(DataDisplay.itemsPerPage());
  let from = (parseInt(DataDisplay.currentPage()) - 1) * count;
  let to = from + count;
  return items.slice(from, to);
};

DataDisplay.controller = function () {
  DataDisplay.currentPage(m.route.param('page') || 1);
  DataDisplay.itemsPerPage(m.route.param('items') || ITEMS_PER_PAGE[0]);
  DataDisplay.maxPage(1);
};

DataDisplay.view = function (ctrl, args) {
  let data = args.data.then(updatePageVars).then(paginate);

  let pagination = m(Pagination, {
    maxPage: DataDisplay.maxPage,
    currentPage: DataDisplay.currentPage
  });

  return m('div', mz.select, [
    m(ItemsCount, {
      possibleItemsPerPage: ITEMS_PER_PAGE,
      itemsPerPage: DataDisplay.itemsPerPage
    }),
    pagination,
    m(DataTable, {
      names: args.names,
      data: data()
    }),
    pagination
  ]);
};
