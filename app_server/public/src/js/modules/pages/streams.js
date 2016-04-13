const m = require('mithril');

const DataDisplay = require('../components/datadisplay');
const StreamModel = require('../models/stream');
const datetime = require('../utils/dateFormat');

const Streams = module.exports = {};

const livePage = {
  title: 'Live Streams',
  state: 'live'
};

const allPage = {
  title: 'All Streams',
  state: 'all'
};

Streams.init = function () {
  Streams.streamData = StreamModel.list(Streams.state, 'time', 'desc').then(parse);
};

const names = {
  title: 'Title',
  desc: 'Description',
  live: 'Live',
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

const getActions = (id, live) =>
    m('select', {onchange: m.withAttr('value', m.route)}, [
      m('option', {disabled: true, selected: true}, 'Choose...'),
      m('option', {value: '/streams/view/' + id}, 'View / Edit'),
      live ? m('option', {value: '/streams/stop/' + id}, 'Stop') : null
    ]);

const parse = (streams) => streams.map(
    function (stream) {
      return {
        title: stream.title(),
        desc: stream.description(),
        live: stream.live() ? 'Yes' : 'No',
        stats: formatStats(stream.viewers(), stream.stickers()),
        date: datetime.toShortDateTime(stream.startDateTime()),
        user: stream.user().alias(),
        actions: getActions(stream.id(), stream.live())
      };
    }
);

Streams.controller = function () {
  let currentPage = m.route();
  if (currentPage.indexOf('/streams/live') === 0) {
    Object.assign(Streams, livePage);
  } else if (currentPage.indexOf('/streams/all') === 0) {
    Object.assign(Streams, allPage);
  }

  Streams.init();
};

Streams.view = () => [
  m('h1', Streams.title),
  m(DataDisplay, {
    names: names,
    data: Streams.streamData
  })
];
