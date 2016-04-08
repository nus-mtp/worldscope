/* global document */
module.exports = {
  root: function (path) {
    var url = 'http://localhost:3000/admin/';
    return path ? url + '?/' + path : url;
  },
  setUpCasper: function (casper, xhr) {
    return casper.on('remote.message', function (msg) {
      casper.log(msg, 'debug');
    }).on('page.initialized', function () {
      xhr.init(this.page);
    }).on('page.error', function (err) {
      casper.log(err, 'error');
    });
  },
  getTableData: function (casper, cols) {
    var rows = casper.evaluate(function () {
      var rows = document.getElementsByTagName('table')[0].tBodies[0].rows;
      return [].slice.call(rows).map(function (row) {
        return [].slice.call(row.cells).map(function (cell) {
          return cell.innerHTML;
        });
      });
    });

    return rows.map(function (row) {
      var cells = {};
      cols.forEach(function (col, idx) {
        cells[col] = row[idx];
      });
      return cells;
    });
  }
};
