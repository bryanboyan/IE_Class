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

module.exports = {
    
  index: function(req, res) {
  	var user = req.session.user;
  	if (!user) {
  		console.log('LoginController > welcome, user not login');
      return res.redirect('/login');
  	}
  	res.view('home/index', {
      user: user
    });
  },

  login: function(req, res) {
    res.view('account/login', {
      layout: false
    });
  },

  doLogin: function(req, res) {
  	var user = req.param('user');
  	var pw = req.param('pw');
    var isTeacher = req.param('teacher');
    isTeacher = !!isTeacher;
  	
  	// verify
    sails.log.info('user is '+user+', pw is '+pw+', and is teacher?:'+isTeacher);
    res.redirect('/login');
  },

  logout: function(req, res) {
  	var user = req.session.user;
  	if (!user) {
  		console.log('user not login');
  	}
  	delete req.session.user;
  	res.render('account/login', {msg:'You have logout successfully'});
  },

  

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to LoginController)
   */
  _config: {

  }

  
};
