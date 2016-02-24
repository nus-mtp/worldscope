const m = require('mithril');
const App = require('../app');
const UserModel = require('./user');

const Stream = module.exports = function (data) {
  this.id = m.prop(data.streamId);
  this.appInstance = m.prop(data.appInstance);
  this.link = m.prop(data.viewLink);
  this.thumbnail = m.prop(data.thumbnailLink);
  this.room = m.prop(data.roomId);
  this.title = m.prop(data.title);
  this.startDateTime = m.prop(new Date(data.createdAt));
  this.endDateTime = m.prop(new Date(data.endedAt));
  this.viewers = m.prop(data.totalViewers);
  this.stickers = m.prop(data.totalStickers);
  this.live = m.prop(data.live);
  this.description = m.prop(data.description);
  this.user = m.prop(new UserModel(data.streamer));
};

Stream.get = (id) =>
    App.request({
      method: 'GET',
      url: '../api/streams/' + id,
      type: Stream
    });

Stream.list = (state, sort, order) =>
    App.request({
      method: 'GET',
      url: '../api/streams?' + m.route.buildQueryString({
        state: state,
        sort: sort,
        order: order
      }),
      type: Stream
    });

Stream.stop = (stream) =>
    App.request({
      method: 'POST',
      url: '../api/streams/control/stop',
      data: {
        appInstance: stream.appInstance(),
        streamId: stream.id()
      }
    });
