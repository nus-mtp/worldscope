/*global $*/
const m = require('mithril');

const Pagination = module.exports = {};

Pagination.view = function (ctrl, args) {
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

  const MAX_LENGTH = 5;
  let maxPage = args.maxPage();
  let currentPage = parseInt(args.currentPage());
  let getPagination = function () {
    let getPageRange = function (curPage, length) {
      // TODO: Consider large number of pages (> MAX_LENGTH)
      //   Insert "..." if more than total length?
      let startPage = maxPage < length ? 1 : function () {
        let atFront = 1;
        let atMiddle = curPage - Math.floor(length / 2);
        let atBack = maxPage - length + 1;
        return Math.max(atFront, Math.min(atMiddle, atBack));
      };

      let totalLength = maxPage < length ? maxPage : length;

      let range = [];
      for (let i = 0; i < totalLength; i++) {
        range.push(startPage + i);
      }
      return range;
    };

    let getPageConfig = function (page) {
      let config = {};

      if (page < 1 || page > maxPage) {
        config.a = {};
        config.li = {className: 'disabled'};
        return config;
      }

      config.a = {
        'data-page': page,
        onclick: m.withAttr('data-page', args.currentPage)
      };

      if (page === currentPage) {
        config.li = {className: 'active'};
      }

      return config;
    };

    let getPageIndicator = function (page, text) {
      let config = getPageConfig(page);
      return m('li', config.li, m('a', config.a, text));
    };

    let pages = [];
    pages.push(getPageIndicator(currentPage - 1, '<'));
    getPageRange(currentPage, MAX_LENGTH).map(function (page) {
      pages.push(getPageIndicator(page, page));
    });
    pages.push(getPageIndicator(currentPage + 1, '>'));

    return pages;
  };

  return m('div', {className: 'row right-align'}, [
    m('div', {className: 'input-field col s2 offset-s6'},
        getItemsCountSelect()
    ),
    m('div', {className: 'col s4'},
        m('ul', {className: 'pagination'}, getPagination())
    )
  ]);
};