const m = require('mithril');

const StreamModel = require('../models/stream');
const DataDisplay = require('../components/datadisplay');

const Streams = module.exports = {
  controller: function () {
    let ctrl = this;

    ctrl.names = m.prop({
      title: 'Title',
      desc: 'Description',
      stats: 'Statistics',
      date: 'Start Date',
      user: 'User',
      actions: 'Actions'
    });

    let formatStats = (viewers, stickers) => [
      m('span', viewers + 'V'),
      m('br'),
      m('span', stickers + 'S')
    ];

    let getActions = (id) =>
        m('select', {onchange: m.withAttr('value', m.route)}, [
          m('option', {disabled: true, selected: true}, 'Choose...'),
          m('option', {value: '/streams/view/' + id}, 'View / Edit'),
          m('option', {value: '/streams/stop/' + id}, 'Stop')
        ]);

    let parse = (streams) => streams.map(
        function (stream) {
          return {
            title: stream.title(),
            desc: stream.description(),
            stats: formatStats(stream.viewers(), stream.stickers()),
            date: stream.startDateTime(),
            user: stream.user(),
            actions: getActions(stream.id())
          };
        }
    );

    ctrl.data = StreamModel.list().then(parse);
  },
  view: function (ctrl) {
    return [m('h1', 'Streams'),
      m(DataDisplay, {
        names: ctrl.names(),
        data: ctrl.data
      })
    ];
  }
};
