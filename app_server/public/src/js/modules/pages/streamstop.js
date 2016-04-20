const m = require('mithril');
const StreamModel = require('../models/stream');

const Stream = module.exports = {};

Stream.controller = function () {
  let id = m.route.param('id') || -1;
  StreamModel.get(id).then(StreamModel.stop);
  m.route('/streams');
};
