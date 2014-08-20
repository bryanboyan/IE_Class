/**
 * Created by edwinboyan on 8/18/14.
 */
'use strict';

var util = require('util');

module.exports.http = {
  middleware: {
    logEveryRequest: function(req, res, next) {
      sails.log.info('request comes: dump req: '+util.inspect(req));
      next();
    }
  }
};