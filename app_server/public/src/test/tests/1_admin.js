/* global casper, phantom, __utils__ */
var xhr = require('phantomxhr');
var h = require('../helper');
var apiAdmins = require('../api/admins');

casper.test.begin('Can view list of admins', 9, function (test) {
  var url = h.root('admins');
  h.setUpCasper(casper, xhr).start(url, function () {
    xhr.fake(apiAdmins.list());

    this.waitForSelector('#content', function () {
      test.assertUrlMatch('admins');
    });
  }).then(function () {
    test.assertExists('table');
    test.assertEval(function () {
      return __utils__.findAll('tbody tr').length === 2;
    }, 'Table body has 2 rows');

    var tableData = h.getTableData(this,
        ['username', 'email', 'permissions']);

    var admins = [
      apiAdmins.admins.rootAdmin,
      apiAdmins.admins.streamAdmin
    ];

    admins.forEach(function (admin, idx) {
      test.assertEquals(tableData[idx].username, admin.username, 'Username matches');
      test.assertEquals(tableData[idx].email, admin.email, 'Email matches');
      test.assertEquals(tableData[idx].permissions, JSON.stringify(admin.permissions), 'Permissions match');
    });
  }).run(function () {
    test.done();
  });
});
