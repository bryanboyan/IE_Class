/**
 * UserController
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
    var msgPref = 'UserController > index: ';
    var type = req.param('type');
    type = type ? parseInt(type) : User.constants.TYPE.STUDENT; // 默认为student

    User.find({type:type}, function(err, users) {
      if (err) {
        sails.log.error(msgPref+'user find error:'+JSON.stringify(err));
        return res.view('500.ejs');
      }

      res.view('user/index', {users: users, typeName:User.constants.TYPE_NAME[type]});
    });
  },

  profile: function(req, res) {
    _renderUser(req, res, 'user/my_page');
  },

  $new: function(req, res) {
    res.view('user/form', {user: {}});
  },

//  $edit: function(req, res) {
//    this._renderUser(req, res, 'user/form');
//  },

  updatePhoto: function(req, res) {

  },

  updateInfo: function(req, res) {

  },

  updatePasswd: function(req, res) {

  },

  $createOrUpdate: function(req, res) {
    var msgPref = 'UserController > $createOrUpdate: ';

    var id = req.param('id');
    var name = req.param('name');
    var leng = req.param('leng');
    var cond = req.param('cond');
    var descr= req.param('descr');

    if (id) { // update
      Definition.findOne({id: id}, function(err, definition) {
        if (err) {

        }

        definition.name = name;
        definition.leng = leng;
        definition.cond = cond;
        definition.descr= descr;

        definition.save(function(err, updatedDoc) {
          if (err) {

          }

          res.redirect('/definition');
        });
      });

    } else {  // create
      // trust the params b/c it will be validated on client side.
      Definition.create({name:name, leng:leng, cond:cond, descr:descr}, function(err) {
        if (err) {

        }

        res.redirect('/definition');
      });
    }
  },

  $destroy: function(req, res) {

  },

  myPage: function(req, res) {
    var name = req.session.name;

    User.findOne({name: name}).done(function(err, user) {
      res.view('user/my_page', {
        user: user
      });
    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {}

  
};

/**
 * render found user with the page
 * @param req
 * @param res
 * @param page
 * @private
 */
function _renderUser (req, res, page) {
  var msgPref = 'UserController > _getUserOrThrow, page='+page+': ';
  var id = req.param('id');
  if (!isFinite(parseInt(id))) {
    sails.log.error(msgPref+'id invalid');
    return res.view('403.ejs');
  }
  id = parseInt(id);

  User.findOne({id:id}, function(err, user) {
    if (err) {
      sails.log.error(msgPref+'findOne user err:'+JSON.stringify(err));
      return res.view('500.ejs');
    }

    if (!user) {
      sails.log.error(msgPref+"couldn't find user");
      return res.view('404.ejs');
    }

    res.view(page, {user: user});
  });
}