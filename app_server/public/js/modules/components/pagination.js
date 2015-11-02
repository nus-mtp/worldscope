const m = require('mithril');

const Pagination = module.exports = {};

Pagination.view = function (ctrl, args) {
  let getPagination = function () {
    let getPageRange = function (curPage, totalLength) {
      // TODO: Implement proper page range generation
      //   Pass in possible items count, divide by items per page
      //   Insert "..." if more than total length
      let range = [];
      let startPage = Math.max(curPage - Math.floor(totalLength / 2), 1);
      for (let i = 0; i < totalLength; i++) {
        range.push(startPage + i);
      }
      return range;
    };

    let getPageLink = (page) =>
        m('a', {href: '?page=' + page, config: m.route}, page);

    return [
      m('li', [m('a', '<')]),
      getPageRange(args.currentPage, 5).
          map((page) => args.currentPage == page ?
              m('li', {class: 'active'}, getPageLink(page)) :
              m('li', getPageLink(page))),
      m('li', [m('a', '>')])
    ];
  };

  return m('div', {className: 'row right-align'}, [
    m('div', {className: 'col s12'},
        m('ul', {className: 'pagination'}, getPagination())
    )
  ]);
};