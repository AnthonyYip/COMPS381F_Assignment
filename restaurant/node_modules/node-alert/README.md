node-alert
==========

node-alert is a module whose primary purpose is to provide ways to alert you in the event of an error/crash  

### Features
- **Extensible** : All alert systems are built as plugins and are available under [lib/services](lib/services)
- **Lazy requires** : The packages required by the plugins will only be downloaded if the user has asked for the plugin and if the package is not already available
- **Straightforward APIs** : node-alert doesn't have any APIs of its own. APIs exposed by plugins will be available to the user
- **Easy to author plugins** : Plugin architecture is based on [Broadway](https://github.com/flatiron/broadway), which makes it easy to write plugins. Check out [mail](lib/services/mail) plugin for an example.

### Example usage for mail plugin
```javascript
var alert = require('node-alert')({
  plugins : {
    mail : {
      nodemailer : {
        port : 25,
        host : "smtp.myserver.com",
        auth : {
          user : "myname@myserver.com",
          pass : "mypass"
      },
      message   : {
        addressed_to : "node-alert maintainer",
        serviceName : "Node-Alert test"
      }
    } 
  }
});

alert.alertMail(new Error('Test Error'), function(err, info) {
  if (err) console.log(err);
  else console.log('Success!');
});

```
## Usage guidelines
- node-alert based services should not be used to handle `process.on('uncaughtException')`. Use [Domains](nodejs.org/api/domain.html) instead.  


## Plugin Authoring Guidelines
- Plugins are based on [Broadway](https://github.com/flatiron/broadway) and have to adhere to their conventions
- One service per plugin
- Avoid cross-dependency with other plugins
- Only expose those API that are useful
- Lazy load modules. If using any service, use the [require-helper](lib/requireHelper.js). For example, see the [mail plugin](lib/services/mail/index.js).
- Provide README.md with every plugin, containing at least one example of usage. (Example: mail plugin's [README](lib/services/mail/README.md))
- Folder name of the plugin will be the same as the option the user will be expected to provide (Example: *mail* plugin requires that the user provide options to the plugin under `mail`. Check the example provided above)
