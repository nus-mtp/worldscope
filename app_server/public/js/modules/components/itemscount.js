const m = require('mithril');

const ItemsCount = module.exports = {};

ItemsCount.view = function (ctrl, args) {
  const ITEMS_PER_PAGE = args.possibleItemsPerPage;
  let currentItemsPerPage = parseInt(args.itemsPerPage());

  let getItemsCountSelect = [
    m('select', {onchange: m.withAttr('value', args.itemsPerPage)},
        ITEMS_PER_PAGE.map((count) =>
            count === currentItemsPerPage ?
                m('option', {value: count, selected: true}, count) :
                m('option', {value: count}, count)
        )),
    m('label', 'Items per Page')
  ];

  return m('div.row right-align', [
    m('div#itemsCount.input-field col s1 offset-s11',
        getItemsCountSelect
    )
  ]);
};
