var lazyRequire = require('lazy-require').lazyRequire;
var deasync = require('deasync');
lazyRequireSync = deasync(lazyRequire);
var debug = require('debug')('node-alert:requireHelper');

exports.require = function(package) {
  var module;
  try {
    module = lazyRequireSync(package);
    return module;
  }
  catch (e) {
    debug('Module could not be installed because of ', e.message);
    throw e;
  }
};
