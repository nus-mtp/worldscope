/* global casper, phantom */
var xhr = require('phantomxhr');
var h = require('../helper');
var apiAdmins = require('../api/admins');

casper.test.begin('Can login', 5, function (test) {
  h.setUpCasper(casper, xhr).start(h.root(), function () {
    test.assertExists('#username');
    test.assertExists('#password');
    test.assertEquals(this.getCurrentUrl(), h.root('login'));
  }).then(function () {
    xhr.fake(apiAdmins.login());
    phantom.addCookie({
      domain: 'localhost',
      name: 'x-csrf-token',
      value: 'cookieForLogin'
    });
    this.fillSelectors('form', {
      'input#username': 'user',
      'input#password': 'pass'
    }, true);
  }).then(function () {
    this.waitForSelector('#content', function () {
      test.assertExists('#nav');
      test.assertEquals(this.getCurrentUrl(), h.root('metrics/overview'));
    });
  }).run(function () {
    test.done();
  });
});
