const m = require('mithril');
const App = require('../app');

const Stream = module.exports = function (data) {
  this.id = m.prop(data.streamId);
  this.key = m.prop(data.streamKey);
  this.room = m.prop(data.roomId);
  this.title = m.prop(data.title);
  this.startDateTime = m.prop(new Date(data.startDateTime));
  this.viewers = m.prop(data.totalViewers);
  this.stickers = m.prop(data.totalStickers);
  this.live = m.prop(data.live === 1);
  this.description = m.prop(data.description);
  this.user = m.prop(data.user.alias);
};

Stream.list = () =>
    App.request({
      method: 'GET',
      url: 'src/js/modules/mockdata/streams.json',
      type: Stream
    });
