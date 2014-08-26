/**
 * LoginController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var crypto = require('crypto');

module.exports = {
    
  index: function(req, res) {
  	var name = req.session.name;

    // 根据isTeacher来判断返回什么界面.
    // FIXME 这个地方需要redirect
    if (req.session.isTeacher) {
      sails.log.info('index, is teacher, go to index');
      return res.view('home/index', {
        name: name
      });
    }

    sails.log.info('index, is student, go to my page');
    res.redirect('/user/my');
  },

  login: function(req, res) {
    res.view('user/login', {
      layout: false
    });
  },

  doLogin: function(req, res) {
    var msgPref = 'LoginController > doLogin : ';

    var username = req.param('user');
    var pw = req.param('pw');

    if (!username && !pw) {
      sails.log.error(msgPref+'username or pw required');
      return res.view('user/login', {
        err: "username or pw required",
        layout: false
      });
    }

    var md5sum = crypto.createHash('md5');
    md5sum.update(pw);
    var encoded_pw = md5sum.digest('hex');
  	
  	// verify
    sails.log.info('user is '+username+', pw is '+JSON.stringify(pw));

    User.findOne({name: username}).done(function(err, user) {
      if (err) {
        sails.log.error(msgPref+'find user error');
      }

      if (!user) {
        sails.log.error(msgPref+'user not found');
        return res.view('user/login', {
          err: "user not found",
          layout: false
        });
      }

      var stored_pw = user.passwd;
      if (encoded_pw !== stored_pw) {

        sails.log.error('LoginController > doLogin : password wrong, encoded_pw:'+encoded_pw+', stored_pw:'+stored_pw);
        // password wrong
        return res.view('user/login', {
          err: "username or password wrong",
          layout: false
        });
      }

      var isTeacher = (user.type==User.constants.TYPE.TEACHER);

      req.session.authenticated = true; // establish session
      req.session.id = user.id;
      req.session.name = username;
      req.session.isTeacher = isTeacher;
      res.cookie('isTeacher', isTeacher); // set it into cookie.

      res.redirect('/');
    });
  },

  logout: function(req, res) {
  	var name = req.session.name;
  	if (!name) {
  		console.log('user not login');
  	}
    delete req.session.authenticated;
  	delete req.session.name;
    delete req.session.id;
  	res.render('user/login', {msg:'You have logout successfully'});
  },

  

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to LoginController)
   */
  _config: {

  }

  
};
