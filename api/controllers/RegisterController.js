/**
 * RegisterController
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
    Register.find({valid: true}, function(err, list) {
      if (err) {
        sails.log.error('RegisterController > index: find register err:'+JSON.stringify(err));
        return res.view('500.ejs');
      }

      list = list || [];

      res.view('register/index', {list: list});
    });
  },

  new: function(req, res) {
    Register.query('select max(userId) as maxId from register', function(err, rst) {
      if (err) {
        sails.log.error('RegisterController > new: user find max id err:'+JSON.stringify(err));
        return res.view('500.ejs');
      }

      rst = rst || [{}];
      var maxId = rst[0].maxId;
      var recommendedId = maxId + 1;

      res.view('register/new', {recommendedId: recommendedId});
    });
  },

  create: function(req, res) {
    var userId = req.param('userId');
    var type = req.param('type');
    var email = req.param('email');

    var currTs = Date.now();

    var fns = [];

    fns.push(function(cb) {
      Register.create({id: currTs, userId: userId, type: type, email: email}, function(err) {
        if (err) {
          sails.log.error('RegisterController > create: create error:'+JSON.stringify(err));
          return cb(500);
        }

        cb(null);
      });
    });

    fns.push(function(cb) {
      MailService.sendRegisterMail(email, currTs, function(err) {
        if (err) return cb(500);

        cb();
      });
    });

    async.parallel(fns, function(errNo) {
      if (errNo) {
        return res.view(errNo+'.ejs');
      }

      res.view('register/done');
    });
  },

  destroy: function(req, res) {
    var msgPref = 'RegisterController > $destroy: ';
    var id = req.param('id');
    if (!id) {
      sails.log.error(msgPref+'no id provided for destroy');
      return res.view('403.ejs');
    }

    Register.destroy({id:id}, function(err) {
      if (err) {
        sails.log.error(msgPref+'destroy err:'+JSON.stringify(err));
        return res.view('500.ejs');
      }

      res.redirect('/register');
    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to RegisterController)
   */
  _config: {}

  
};
