const m = require('mithril');

const Datadisplay = require('../components/datadisplay');

const getData = () =>
    m.request({method: 'GET', url: 'js/modules/mockdata/streams.json'});

const Streams = module.exports = {
  controller: function () {
    let ctrl = this;

    ctrl.columns = m.prop(['title', 'desc', 'stats', 'date', 'user']);

    ctrl.names = m.prop({
      title: 'Title',
      desc: 'Description',
      stats: 'Statistics',
      date: 'Start Date',
      user: 'User'
    });

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

    ctrl.data = getData().then(parse);
  },
  view: function (ctrl) {
    return [m('h1', 'Streams'),
      m.component(Datadisplay, {
        columns: ctrl.columns(),
        names: ctrl.names(),
        data: ctrl.data
      })
    ];
  }
};