const m = require('mithril');

const getData = () =>
    m.request({method: 'GET', url: 'js/modules/mockdata/streams.json'});

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
    let ctrl = this;

    ctrl.table = m.prop(table);
    ctrl.columns = m.prop(table.columns);
    ctrl.names = m.prop(table.names);
    ctrl.currentPage = m.prop(m.route.param('page') || 1);
    ctrl.itemsPerPage = m.prop(10);

    let formatStats = (viewers, stickers) => [
      m('span', viewers + 'V'),
      m('br'),
      m('span', stickers + 'S')
    ];

    let parse = (streams) => streams.map(
        function (stream) {
          return {
            title: stream.title,
            desc: stream.description,
            stats: formatStats(stream.totalViewers, stream.totalStickers),
            date: stream.startDateTime,
            user: stream.user.alias
          };
        }
    );

    ctrl.rawData = table.data.then(parse);

    let paginate = function (streams) {
      let items = parseInt(ctrl.itemsPerPage());
      let from = (parseInt(ctrl.currentPage()) - 1) * items;
      let to = from + items;
      return streams.slice(from, to);
    };

    ctrl.data = m.prop([]);

    ctrl.update = function () {
      ctrl.data = ctrl.rawData.then(paginate);
    };

    ctrl.update();
  },
  view: function (ctrl) {
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
        getPageRange(ctrl.currentPage(), 5).
            map((page) => ctrl.currentPage() == page ?
                m('li', {class: 'active'}, getPageLink(page)) :
                m('li', getPageLink(page))),
        m('li', [m('a', '>')])
      ];
    };

    return [m('h1', 'Streams'),
      m('div', {className: 'row right-align'}, [
        m('div', {className: 'col s12'},
          m('ul', {className: 'pagination'}, getPagination())
        )
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