const m = require('mithril');

const Pagination = module.exports = {
  maxPage: m.prop(),
  currentPage: m.prop()
};

const MAX_LENGTH = 5;

const getPageRange = function (length) {
  let maxPage = Pagination.maxPage();
  let curPage = Pagination.currentPage();

  // TODO: Consider large number of pages (> MAX_LENGTH)
  //   Insert "..." if more than total length?
  let startPage = maxPage < length ? 1 : (function () {
    let atFront = 1;
    let atMiddle = curPage - Math.floor(length / 2);
    let atBack = maxPage - length + 1;
    return Math.max(atFront, Math.min(atMiddle, atBack));
  })();

  let totalLength = maxPage < length ? maxPage : length;

  let range = [];
  for (let i = 0; i < totalLength; i++) {
    range.push(startPage + i);
  }
  return range;
};

const getPageIndicator = function (page, text) {
  let maxPage = Pagination.maxPage();
  let curPage = Pagination.currentPage();
  let curPageProp = Pagination.currentPage;

  let liClass = '';
  let aConfig = {};

  if (page < 1 || page > maxPage) {
    liClass = '.disabled';
  } else {
    if (page === curPage) {
      liClass = '.active';
    }

    aConfig = {
      'data-page': page,
      onclick: m.withAttr('data-page', curPageProp)
    };
  }

  return m('li' + liClass, m('a', aConfig, text));
};

const getPagination = function () {
  let currentPage = Pagination.currentPage();

  let pages = [];
  pages.push(getPageIndicator(currentPage - 1, '<'));
  getPageRange(MAX_LENGTH).map(function (page) {
    pages.push(getPageIndicator(page, page));
  });
  pages.push(getPageIndicator(currentPage + 1, '>'));

  return pages.length > 2 ? pages : []; // if there are pages
};

Pagination.controller = function (args) {
  Pagination.maxPage = args.maxPage;
  Pagination.currentPage = args.currentPage;
};

Pagination.view = function () {
  let pages = getPagination();
  return pages ? m('ul.pagination', pages) : '';
};
