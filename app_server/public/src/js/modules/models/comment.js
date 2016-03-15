const m = require('mithril');
const App = require('../app');

const Comment = module.exports = function (data) {
  this.id = m.prop(data.commentId);
  this.msg = m.prop(data.content);
  this.time = m.prop(new Date(data.createdAt));
  this.user = m.prop(data.alias || data.userId);
  this.userId = m.prop(data.userId);
};

Comment.list = (streamId) =>
    App.request({
      method: 'GET',
      url: '../api/comments/streams/' + streamId,
      type: Comment
    });
