const m = require('mithril');

const StreamModel = require('../models/stream');
const DataDisplay = require('../components/datadisplay');

const datetime = require('../utils/dateFormat');

const Streams = module.exports = {};

Streams.init = function () {
  Streams.streamData = StreamModel.list().then(parse);
};

const names = {
  title: 'Title',
  desc: 'Description',
  stats: 'Statistics',
  date: 'Start Date',
  user: 'User',
  actions: 'Actions'
};

const formatStats = (viewers, stickers) => [
  m('span', viewers + 'V'),
  m('br'),
  m('span', stickers + 'S')
];

const getActions = (id) =>
    m('select', {onchange: m.withAttr('value', m.route)}, [
      m('option', {disabled: true, selected: true}, 'Choose...'),
      m('option', {value: '/streams/view/' + id}, 'View / Edit'),
      m('option', {value: '/streams/stop/' + id}, 'Stop')
    ]);

const parse = (streams) => streams.map(
    function (stream) {
      return {
        title: stream.title(),
        desc: stream.description(),
        stats: formatStats(stream.viewers(), stream.stickers()),
        date: datetime.toShortDateTime(stream.startDateTime()),
        user: stream.user().alias(),
        actions: getActions(stream.id())
      };
    }
);

Streams.controller = function () {
  Streams.init();
};

Streams.view = () => [
  m('h1', 'Streams'),
  m(DataDisplay, {
    names: names,
    data: Streams.streamData
  })
];
