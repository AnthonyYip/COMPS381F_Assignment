/**
 * Plugin loader
 * Plugins are loaded based on the options provided by the user when initializing node-alert
 **/
var debug = require('debug')('node-alert:pluginLoader')
exports.load = function(app, plugindir, pluginOpts) {
  Object.keys(pluginOpts).forEach(function(plugin) {
    var options = pluginOpts[plugin];
    app.use(require(plugindir + '/' + plugin), options);
    debug('Loaded plugin :', plugin);
  });
};
