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

  retrieveInfo: function(req, res) {
    var msgPref = "UserController > retrieveInfo: ";

    var key = req.param('key');
    key = key.toLowerCase();
    var rKey = '';
    switch(key) {
      case 'userid':    rKey="id"; break;
      case 'username':  rKey="name";  break;
      default:  rKey=null;
    }

    if (!rKey) {
      return res.json(400,{msg:'key not right'});
    }

    var value = req.param('value');

    var q = {};
    q[rKey] = value;
    User.findOne(q, function(err, user) {
      if (err) {
        sails.log.error(msgPref+'findOne user query:'+JSON.stringify(q)+', err:'+JSON.stringify(err));
        return res.json(500,{msg:'error happens'});
      }

      if (!user) {
        sails.log.warn(msgPref + 'no such user');
        return res.json(404,{msg:'user not found'});
      }

      res.json({user: user});
    });
  },

  profile: function(req, res) {
    _renderUser(req, res, 'user/my_page');
  },

  new: function(req, res) {
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

  destroy: function(req, res) {

  },

  my: function(req, res) {
    var msgPref = 'UserController > my';

    var name = req.session.name;
    if (!name) {
      sails.log.error(msgPref + 'no name in session');
      return res.view('400.ejs');
    }

    User.findOne({name: name}, function(err, user) {
      if (err) {
        sails.log.error(msgPref + 'findOne error');
        return res.view('500.ejs');
      }

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