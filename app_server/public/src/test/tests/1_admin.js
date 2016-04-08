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

casper.test.begin('Can view and submit admin', 10, function (test) {
  var url = h.root('admins/view/' + apiAdmins.admins.rootAdmin.userId);
  h.setUpCasper(casper, xhr).start(url, function () {
    xhr.fake(apiAdmins.get());

    this.waitForSelector('#content', function () {
      test.assertUrlMatch(url);
    });
  }).then(function () {
    test.assertFieldCSS('#username', apiAdmins.admins.rootAdmin.username, 'Username matches');
    test.assertFieldCSS('#password', '', 'Password is empty');
    test.assertFieldCSS('#email', apiAdmins.admins.rootAdmin.email, 'Email matches');

    apiAdmins.admins.rootAdmin.permissions.forEach(function (p) {
      if (p !== 'admin') {
        test.assertFieldCSS('#' + p, true, p + ' is checked');
      }
    });
  }).then(function () {
    xhr.fake(apiAdmins.update());

    this.fillSelectors('form', {
      '#username': 'mockUsername',
      '#password': 'mockPassword',
      '#email': 'mockEmail'
    }, true);
  }).then(function () {
    this.waitForSelector('#content', function () {
      test.assertUrlMatch('admins');
    });
  }).run(function () {
    test.done();
  });
});
