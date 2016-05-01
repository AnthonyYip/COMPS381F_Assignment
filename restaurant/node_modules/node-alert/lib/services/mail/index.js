/**
 * Mail
 * node-alert plugin to send mail
 **/
var RH = require('../../requireHelper'); // A require helper that loads a module only when it's not found
var debug = require('debug')('node-alert:mail'); // Use express-style debug with every plugin
var fs = require('fs'); // Only require modules that are available by default. For every other package, use RH.require()

/**
 * Sample option passed to mail plugin. Provide one with every plugin
 *
 * {
 *   nodemailer : { // Any valid nodemailer option set can be used
 *     port : 25,
 *     host : "smtp.myserver.com",
 *     auth : {
 *      user : "myname@myserver.com",
 *      pass : "mypass"
 *     }
 *   },
 *   message    : {
 *     sender : "sender@myserver.com",
 *     receiver : "receiver@myserver.com",
 *     addressed_to : "Developers",
 *     serviceName : "My Service",
 *     origin : "My object (that can raise an error)",
 *     instance : "Unique identifier for this instance (in case of a cluster)",
 *     link : "http://link/to/stats/or/health/check/page",
 *     link_text : "Helper text"
 *   }
 * } 
 **/
// `exports.attach` gets called on `app.use` in pluginLoader.js
exports.attach = function (options) {
  var self = this; // To maintain reference to `this`
  this.options = options;

  // initMail isn't exposed because it is not a public API
  function initMail() {
    var opts = self.options;
    self.nodemailer = RH.require('nodemailer');
    self.ejs = RH.require('ejs');
    self.mailer = self.nodemailer.createTransport(opts.nodemailer);
    self.template = fs.readFileSync(__dirname + '/mailtemplate.ejs').toString();

    // Set defaults if user hasn't given them
    var msgopts = opts.message;
    msgopts.sender = msgopts.sender || options.nodemailer.auth.user;
    msgopts.receiver = msgopts.receiver || options.nodemailer.auth.user;
    msgopts.addressed_to = msgopts.addressed_to || msgopts.receiver;
    msgopts.serviceName = msgopts.serviceName || 'App';
    msgopts.link_text = msgopts.link_text || msgopts.link;
  };

  // Do not provide any name that can conflict with other plugins.
  // Therefore, this function is named `alertMail` and not `alert`
  // alertMail is a public API that would be exposed to the user
  this.alertMail = function(error, cb) {
    var msgopts = self.options.message;
    var message = {
      from: msgopts.sender,
      to: msgopts.receiver,
      subject: "Error in " + msgopts.serviceName,
      html : self.ejs.render(self.template, {
        addressed_to : msgopts.addressed_to,
        serviceName : msgopts.serviceName,
        instance : msgopts.instance,
        origin : msgopts.origin,
        errormessage : error.message,
        stacktrace : error.stack,
        link_text : msgopts.link_text,
        link : msgopts.link
      })
    };
    self.mailer.sendMail(message, cb);
  };

  initMail();
};

// `exports.init` gets called by broadway on `app.init`.
exports.init = function (done) {
  // done() must be called after initialization
  // This method is a requirement of broadway. No actual initialization must be done here
  // All initializations must instead, be done on app.use
  return done();
};
