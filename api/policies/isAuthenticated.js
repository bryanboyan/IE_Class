/**
 * isAuthenticated
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
  // check if user login
  if (!req.session.authenticated) {
    // User did not successfully login.
    sails.log.error('user is not authenticated');
    // (default res.forbidden() behavior can be overridden in `config/403.js`)
    return res.redirect('/login');
//  return res.forbidden('You are not permitted to perform this action.');
  }

  var rPath = req.route.path;
  sails.log.debug('rPath: '+rPath);

  if (!req.session.isTeacher) {
    if (studentPath.indexOf(rPath)==-1) {
      // student should not view non-student pages
      sails.log.warn('dump req:'+require('util').inspect(req)+', url:'+rPath);
      sails.log.error('student should not view non-student pages, session:'+JSON.stringify(req.session));
      return res.view('403.ejs',{message:'student should not view non-student pages'});
    }
  }

  next();
};

var studentPath = ['/','/user/my','/user/editPhoto','/user/updatePhoto',
                    '/attendance/my/:tag','/attendance/reply/:verb','/charge/my'];