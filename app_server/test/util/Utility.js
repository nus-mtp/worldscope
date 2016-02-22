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
  lab.test('Should return a string with correct length', function (done) {
    Code.expect(Utility.randomValueBase64(20).length).to.equal(20);
    done();
  });
  lab.test('Should return different string in each call', function (done) {
    var string1 = Utility.randomValueBase64(20); 
    var string2 = Utility.randomValueBase64(20);
    Code.expect(string1).to.not.equals(string2);
    done();
  });
});
