const m = require('mithril');

const mz = require('../utils/mzInit');

const ItemsCount = module.exports = {};

ItemsCount.view = function (ctrl, args) {
  const ITEMS_PER_PAGE = args.possibleItemsPerPage;
  let currentItemsPerPage = parseInt(args.itemsPerPage());

  let getItemsCountSelect = [
    m('select', mz.select(args.itemsPerPage),
        ITEMS_PER_PAGE.map((count) =>
            count === currentItemsPerPage ?
                m('option', {value: count, selected: true}, count) :
                m('option', {value: count}, count)
        )),
    m('label', 'Items per Page')
  ];

  return m('div', {className: 'row right-align'}, [
    m('div', {id: 'itemsCount', className: 'input-field col s1 offset-s11'},
        getItemsCountSelect
    )
  ]);
};
