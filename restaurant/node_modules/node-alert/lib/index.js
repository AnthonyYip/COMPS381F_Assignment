/**
 * Entry point to node-alert
 *
 * Coding guidelines
 * All services should be exposed as plugins
 * Services should be as minimal as possible
 * Tab width : 2
 * Opening bracket in the same line as keyword
 * Blank line in the end of file
 * Documentation wherever necessary
 **/

// TODO : Use a more generic or self-baked solution
var broadway = require('broadway');
var pluginLoader = require('./pluginLoader');
var debug = require('debug')('node-alert:main')

/**
 * Constructor for the alerting system
 * @param {Object} options
 **/
var init = function(opts) {
  var app = new broadway.App();

  // This will load the plugins in the plugin directory and expose their functions to this.app
  pluginLoader.load(app, opts.pluginsDir || './services', opts.plugins);

  // callback to app.init called after all plugins are initialized
  app.init(function (err) {
    if (err) {
      debug('Error in initializing plugins ', err.message);
      throw err;
    } else {
      debug('Successfully initialized plugins. node-alert ready to go!')
    }
  });

  return app;
};

module.exports = init;
