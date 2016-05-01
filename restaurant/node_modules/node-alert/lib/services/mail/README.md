Mail
====

A node-alert plugin to mail configured users on errors/events

### Example Usage

```javascript
var mailAlert = require('node-alert')({
  plugins : {
    mail : {
      nodemailer : { // Any valid nodemailer option set can be used
        port : 25,
        host : "smtp.myserver.com",
        auth : {
          user : "myname@myserver.com",
          pass : "mypass"
      },
      message   : {
        sender : "ops@myserver.com",
        receiver : "maintainers@myserver.com",
        addressed_to : "node-alert maintainer",
        serviceName : "Node-Alert test",
        instance : "inst001",
        origin : "node-server",
        link : "http://example.com/dashboard/instance/health",
        link_text : "Instance Health",
      }
    } 
  }
});

mailAlert.alertMail(new Error('Test Error'), function(err, info) {
  if (err) console.log(err);
  else console.log('Success!');
});

```

### Options
- `nodemailer`    
  [Nodemailer](https://github.com/andris9/Nodemailer) is internally used to send mails. Any format acceptable by Nodemailer's `createTransport` method, can be used
- `message`  
  This sub option contains details relevant to creating the message body of the mail that will be sent on an event
  - `sender`  
    The address that will be present in the `from` header of the mail  
    `Note: Sending mails from unauthorized addresses will be regarded as spam in most email services`
  - `receiver`  
    The address that will be present in the `to` header of the mail
  - `addressed_to`  
    The person/group/organization the mail addresses
  - `serviceName`  
    The name of the service. (Useful in case you are running many)
  - `instance`  
    The unique identifier for this instance. (Useful in case you are running many)
  - `origin`  
    The name of the component whose malfunction causes this alert
  - `link`  
    A quick link that takes you to a health check url. (This URL should be behind a VPN or should have an authentication mechanism)
  - `link_text`  
    Text for `link`. If `link` is provided and `link_text` is not, `link` itself will be used as `link_text`


In the above example, all options under `message` are optional. However they will help you drill down on the error and take quick actions on receiving a crash report.  
If `sender`/`receiver` options are skipped, the plugin will try to use `auth.user` in the `nodemailer` option as the sender/receiver.  

