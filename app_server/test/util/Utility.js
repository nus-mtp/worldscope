var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');

var Utility = rfr('app/util/Utility');

lab.experiment('Utility#getModuleName Tests', function () {
  lab.test('Empty path', function (done) {
    Code.expect(Utility.getModuleName('')).to.equal('');
    done();
  });

  lab.test('Null path', function (done) {
    Code.expect(Utility.getModuleName()).to.equal('undefined');
    done();
  });

  lab.test('Valid path 1', function (done) {
    Code.expect(Utility.getModuleName('path/to/module.js'))
        .to.equal('module.js');
    done();
  });
});

lab.experiment('Utility#randomValueBase64 tests', function () {
  lab.test('Should return some strings', function (done) {
    Code.expect(Utility.randomValueBase64(20).length).to.equal(20);
    done();
  });
});
