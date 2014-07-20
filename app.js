// Start sails and pass it command line arguments
var sails = require('sails');

var args = require('optimist').argv;

sails.lift(args, function() {
  sails.log.warn('sails lifted !!!!!!!');
//  global.logger = sails.log;
});