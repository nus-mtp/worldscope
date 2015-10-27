const m = require('mithril');

const getData = function () {
  let formatStats = (viewers, stickers) => [
    m('span', viewers + 'V'),
    m('br'),
    m('span', stickers + 'S')
  ];

  return m.request({method: 'GET', url: 'js/modules/mockdata/streams.json'}).
      then((streams) => streams.map(
          function (stream) {
            return {
              title: stream.title,
              desc: stream.description,
              stats: formatStats(stream.totalViewers, stream.totalStickers),
              date: stream.startDateTime,
              user: stream.user.alias
            };
          }
      ));
};

const Streams = module.exports = {
  controller: function () {
    let table = {
      columns: ['title', 'desc', 'stats', 'date', 'user'],
      names: {
        title: 'Title',
        desc: 'Description',
        stats: 'Statistics',
        date: 'Start Date',
        user: 'User'
      },
      data: getData()
    };
    this.table = m.prop(table);
    this.columns = m.prop(table.columns);
    this.names = m.prop(table.names);
    this.data = table.data;
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
      ]),
      m('table', {className: 'bordered responsive-table'}, [
        m('thead', [
          m('tr', [
            ctrl.columns().map((col) => m('td', ctrl.names()[col]))
          ])
        ]),
        m('tbody', [
          ctrl.data().map(function (stream) {
            return m('tr', [
              ctrl.columns().map((col) => m('td', stream[col]))
            ]);
          })
        ])
      ])
    ];
  }
};