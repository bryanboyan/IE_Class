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

var fs = require('fs');
var crypto = require('crypto');
var async = require('async');

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

  indexJSON: function(req, res) {
    // some conditions

    var cond = {};
    User.find(cond, function(err, users) {
      if (err) {
        sails.log.error('UserController > indexJSON: user find error:'+JSON.stringify(err));
        return res.json(500);
      }

      res.json(users);
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
    _renderUser(req, res, 'user/my');
  },

//  new: function(req, res) {
//    // 根据code来检验是否有效
//    res.view('user/form', {user: {}});
//  },

  register: function(req, res) {
    var msgPref = 'UserController > register: ';
    var code = req.param('c');
    if (!code) {
      sails.log.error(msgPref+'no register code provided');
      return res.view('403.ejs', {message: 'wrong URL!!'});
    }

    Register.findOne({id:code, valid:true}, function(err, register) {
      if (err) {
        sails.log.error(msgPref+'findOne err:'+JSON.stringify(err));
        return res.view('500.ejs');
      }

      if (!register) {
        sails.log.error(msgPref+'no register code exist'+JSON.stringify(err));
        return res.view('403.ejs', {message: 'URL not right'});
      }

      var user = {
        id: register.userId,
        type: register.type,
        email: register.email
      };

      res.view('user/registration', {user:user, code:code});
    });
  },

  create: function(req, res) {
    var msgPref = 'UserController > create: ';

    var code = req.param('code');

    var name = req.param('name');
    var email = req.param('email');
    var phone = req.param('phone');
    var sex = req.param('sex');
    var descr= req.param('descr');
    var passwd = req.param('passwd');

    // password md5lize
    if (!passwd) {
      sails.log.error(msgPref+'no passwd provided');
      return res.view('403.ejs');
    }
    var md5sum = crypto.createHash('md5');
    md5sum.update(passwd);
    var passwdStr = md5sum.digest('hex');

    var fns = [];

    fns.push(function(cb) {
      Register.findOne({id: code, valid: true}, function(err, register) {
        if (err) {
          sails.log.error(msgPref+'register findOne err:'+JSON.stringify(err));
          return cb(500);
        }

        if (!register) {
          sails.log.error(msgPref+'register not found');
          return cb(403, {message: 'register Not found or not valid'});
        }

        cb(null, register);
      });
    });

    fns.push(function(register, cb) {
      var obj = {
        id: register.userId,
        type: register.type,
        name: name,
        passwd: passwdStr,
        sex: sex,
        descr: descr,
        email: email,
        phone: phone,
        credit: User.constants.INIT.CREDIT
      };

      User.create(obj, function(err) {
        if (err) {
          sails.log.error(msgPref+'create user obj:'+JSON.stringify(obj)+', err:'+JSON.stringify(err));
          return cb(500);
        }

        cb(null, register);
      });
    });

    // turn the register record valid to false
    fns.push(function(register, cb) {
      register.valid = false;
      register.save(function(err) {
        if (err) {
          sails.log.error(msgPref+'register destroy err:'+JSON.stringify(err));
          return cb(500);
        }

        cb(null);
      });
    });

    async.waterfall(fns, function(errNo) {
      if(errNo) {
        return res.view(errNo+'.ejs');
      }

      res.view('user/login', {
        msg:'Thank you for registration, please login first',
        layout: false
      });
    });
  },

  checkExistence: function(req, res) {
    var key = req.param('key');
    var value = req.param('value');

    var rKey;
    switch(key) {
      case "userId":
      case "id":
        rKey = "id";
        value = parseInt(value);
        if (!isFinite(value)) {

        }
        break;
      case "userName":
      case "name":
        rKey = 'name';
        break;
      default:

    }

    User.query('select 1 from user where '+rKey+'='+value, function(err, rst) {
      if (err) {

      }

      rst = rst || [];
      var exist = rst.length>0; // rst.length>=1 exist, ==0 not exist
      res.json({exist: exist});
    });
  },

//  $edit: function(req, res) {
//    this._renderUser(req, res, 'user/form');
//  },

  editPhoto: function(req, res) {
    res.view('user/editPhoto.ejs');
    var rst = fs.readdirSync('.');
    sails.log.debug('dir rst:'+JSON.stringify(rst));
  },

  updatePhoto: function(req, res) {
    var msgPref = "UserController > updatePhoto: ";

    var photo = req.files.photo;
    if (!photo || !photo.size || !photo.name) {
      // error
      sails.log.error(msgPref+'no photo');
      return res.view(403,{message:'no photo uploaded'});
    }

    var ext = photo.name.match(/\.\w+$/);
    if (!ext) {
      sails.log.error(msgPref+'ext not match');
      return res.view(403,{message:'photo format not right'});
    }
    ext = ext[0];
    sails.log.debug('ext: '+ext);

    var uid = req.session.userId;
    var md5sum = crypto.createHash('md5');
    var currts_uid_str = Date.now() + "" + uid;   // photo name is md5 of current unixtime+""+userId
    md5sum.update(currts_uid_str);
    var imgName = md5sum.digest('hex') + ext;

    var relativePath = __dirname+"/../../assets/images/user/";

    async.waterfall([
      function(cb) {
        var filePath = relativePath+imgName;
        sails.log.debug('filePath: '+filePath);
        fs.rename(photo.path, filePath, function(err) {
          if (err) {
            sails.log.error(msgPref+'photo uploaded err:'+JSON.stringify(err));
            return cb(500);
          }

          cb();
        });
      },
      function(cb) {
        User.findOne(uid, function(err, user) {
          if (err) {
            sails.log.error(msgPref+'user findOne error:'+JSON.stringify(err));
            return cb(500);
          }
          if (!user) {
            sails.log.error(msgPref+'user NA');
            return cb(404);
          }
          cb(null, user);
        });
      },
      function(user, cb) {
        if (user.photo) {
          fs.unlink(relativePath+user.photo, function(err) {    // ignore error
            cb(null, user);
          });
        } else {
          cb(null, user);
        }
      },
      function(user, cb) {
        sails.log.debug('dump user:'+JSON.stringify(user));
        user.photo = imgName;
        user.save(function(err) {
          if (err) {
            sails.log.error(msgPref+'save user error:'+JSON.stringify(err));
            return cb(500);
          }
          cb(null);
        });
      }
    ], function(errNo) {
      if (errNo) {
        return res.view(errNo+".ejs");
      }
      res.redirect('/user/my');
    });
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
      return res.view('403.ejs');
    }

    User.findOne({name: name}, function(err, user) {
      if (err) {
        sails.log.error(msgPref + 'findOne error');
        return res.view('500.ejs');
      }

      var photoExist = fs.existsSync(__dirname+'/../../assets/images/user/'+user.photo);
      var photo = photoExist ? '/images/user/'+user.photo : '/images/guest.png';

      res.view('user/my', {
        user: user,
        photo: photo
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