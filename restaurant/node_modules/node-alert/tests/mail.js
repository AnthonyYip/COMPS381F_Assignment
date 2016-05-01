// Tests - each plugin should have one

describe('Node-Alert', function() {
  this.timeout(1000000);
  var alert;
  before(function() {
    alert = require('../lib')({
      plugins : {
        mail : {
          nodemailer : { // Any valid nodemailer option set can be used
            port : 25,
            host : process.env.SMTP_HOST,
            auth : {
             user : process.env.TEST_USER,
             pass : process.env.TEST_PASS
            }
          },
          message    : {
            addressed_to : "node-alert Developer",
            serviceName : "Node-Alert test"
          }
        } 
      }
    });
  });

  it('Should send an alert mail when asked to', function(done) {
    alert.alertMail(new Error('Test Error'), function(err, info) {
      if (err) done(err);
      else done();
    });
  });
});

