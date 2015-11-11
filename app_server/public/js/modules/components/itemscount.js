/*global $*/
const m = require('mithril');

const ItemsCount = module.exports = {};

ItemsCount.view = function (ctrl, args) {
  const ITEMS_PER_PAGE = [10, 30, 50];
  let getItemsCountSelect = function () {
    let selectConfig = {
      config: () => { $('select').material_select(); }, // for materialize-css
      onchange: m.withAttr('value', args.itemsPerPage)
    };

    return [
      m('select', selectConfig, ITEMS_PER_PAGE.map(function (count) {
        return count === args.itemsPerPage() ?
            m('option', {value: count, selected: true}, count) :
            m('option', {value: count}, count);
      })),
      m('label', 'Items per Page')
    ];
  };

  return m('div', {className: 'row right-align'}, [
    m('div', {id: 'itemsCount', className: 'input-field col s1 offset-s11'},
        getItemsCountSelect()
    )
  ]);
};
