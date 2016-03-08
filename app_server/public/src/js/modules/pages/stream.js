/*global shaka*/

const m = require('mithril');

const StreamModel = require('../models/stream');

const datetime = require('../utils/dateFormat');

const Stream = module.exports = {};

Stream.stream = m.prop();

const initPlayer = function () {
  shaka.polyfill.installAll();

  let video = document.getElementById('video');
  let player = new shaka.player.Player(video);
  window.player = player;

  player.addEventListener('error', function(event) {
    console.error(event);
  });

  let mpdUrl = Stream.stream().link();
  let estimator = new shaka.util.EWMABandwidthEstimator();
  let source = new shaka.player.DashVideoSource(mpdUrl, null, estimator);

  player.load(source);
};

const stopStream = function () {
  StreamModel.stop(Stream.stream()).then(
      () => m.route('/streams')
  );
};

Stream.controller = function () {
  let id = m.route.param('id') || -1;

  StreamModel.get(id).then(Stream.stream);
};

Stream.view = function () {
  let stream = Stream.stream();

  return [
    m('div.row', [
      m('h1', stream.title()),
      m('div.col s12 m6 l4',
          m('video#video', {
            config: () => initPlayer(),
            width: '100%',
            height: 'auto',
            controls: true,
            preload: 'none'})),
      m('div.col s12 m6 l4', [
        m('div.row', [
          m('div.col s6', 'Viewers: ' + stream.viewers()),
          m('div.col s6', 'Stickers: ' + stream.stickers())
        ]),
        m('div.row', [
          m('div.col s3', 'user-image-here'),
          m('div.row col s9', [
            m('div.col s12', stream.user().alias()),
            m('div.col s12', 'Start: ' + datetime.toShortDateTime(stream.startDateTime())),
            m('div.col s12', 'End: ' + datetime.toShortDateTime(stream.endDateTime()))
          ])
        ]),
        m('div.row', [
          m('div.col s12', stream.description()),
          m('button.btn col s12', {onclick: stopStream}, 'Stop Stream'),
          m('div.col s12', 'comment stream here')
        ])
      ])
    ])
  ];
};
