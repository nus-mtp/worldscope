const m = require('mithril');

const getData = function () {
  return m.request({method: 'GET', url: 'js/modules/mockdata/streams.json'}).
      then((streams) => streams.map(
          function (stream) {
            return {
              title: stream.title,
              desc: stream.description,
              stats: stream.totalViewers + 'V ' + stream.totalStickers + 'S',
              date: stream.startDateTime,
              user: stream.user.alias
            };
          }
      ));
};

const Streams = module.exports = {
  controller: function () {
    this.currentPage = m.prop(1);
  },
  view: function (ctrl) {
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

    return [m('h1', 'Streams'),
      m('div', {className: 'row right-align'}, [
        m('div', {className: 'col s12'}, [
          m('ul', {className: 'pagination'}, [
            m('li', [m('a', '<')]),
            getPageRange(ctrl.currentPage(), 5).
                map((page) => ctrl.currentPage() == page ?
                    m('li', {class: 'active'}, [m('a', page)]) :
                    m('li', [m('a', page)])),
            m('li', [m('a', '>')])
          ])
        ])
      ])
    ];
  }
};