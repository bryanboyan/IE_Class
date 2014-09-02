/**
 * Created by edwinboyan on 8/26/14.
 */
'use strict';

var nodemailer = require('nodemailer');
var fromMailer = "IE Team No Reply<noreply@ie.com>";

module.exports = {
  getTransport: function() {
    if (this._transport) {
      return this._transport;
    }
    var conf = sails.config.mailTransport;
    this._transport = nodemailer.createTransport("SMTP", conf);
    return this._transport;
  },
  getServiceHome: function() {
    return sails.config.outbound.host + ":" + sails.config.outbound.port;
  },
  sendRegisterMail: function(targetMailer, code, cb) {
    var serviceHome = this.getServiceHome();
    var url = serviceHome+'/user/register'+"?c="+code;

    var html = "<h1>Welcome to IE Home</h1>" +
      "<p>Please click URL below to complete your registration</p><br>" +
      "==> <a href="+url+">Registration</a><br>" +
      "<p>For more information, please contact Sisley for detail.</p>" +
      "<p>Please don't reply this mail.</p>"
    var text = "Welcome to IE Home. It seems your browser is old. " +
      "We recommend you use Chrome or Firefox instead of Internet Explorer. " +
      "Anyway, please use this url to complete your registration:"+url+". " +
      "Please don't reply this mail.";

    var transport = this.getTransport();
    transport.sendMail({
      from: fromMailer,
      to: targetMailer,
      subject: '[Important] Infinity Education User Registration',
      html: html,
      text: text
    }, function(err, response) {
      if (err) {
        return cb(err);
      }

      sails.log.info('sent mail to '+targetMailer+', response.msg:'+response.message);
      cb();
    });
  }
};