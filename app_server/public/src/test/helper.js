module.exports = {
  root: function (path) {
    var url = 'http://localhost:3000/admin/';
    return path ? url + '?/' + path : url;
  },
  setUpCasper: function (casper, xhr) {
    return casper.on('remote.message', function (msg) {
      this.echo('log: ' + msg);
    }).on('page.initialized', function () {
      xhr.init(this.page);
    }).on('page.error', function (err) {
      this.echo('err: ' + err);
    });
  }
};