const m = require('mithril');

const DataTable = require('../components/datatable');
const ItemsCount = require('../components/itemscount');
const Pagination = require('../components/pagination');
const mz = require('../utils/mzInit');

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
    m('div.row', [
      m('div.col s12 push-m9 m3 push-l10 l2',
          m(ItemsCount, {
            possibleItemsPerPage: ITEMS_PER_PAGE,
            itemsPerPage: DataDisplay.itemsPerPage
          })
      ),
      m('div.col s12 pull-m3 m6 offset-m3 pull-l2 l8 offset-l2 center-align', pagination)
    ]),
    m(DataTable, {
      names: args.names,
      data: data()
    }),
    m('div.row',
        m('div.col s12 center-align', pagination)
    )
  ]);
};
