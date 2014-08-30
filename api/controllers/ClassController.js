/**
 * ClassController
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

var async = require('async');

module.exports = {
    
  index: function(req, res) {
    var tag = req.param('tag');
    tag = tag || "";
    tag = tag.toLowerCase();
    var query = {};
    switch(tag) {
      case "past":
        query.status = Class.constants.STATUS.FINISHED;
        break;
      case "following":
      default:
        query.status = {"!": Class.constants.STATUS.FINISHED};
        break;
    }

    Class.find(query,function(err, classes) {
      if (err) {
        sails.log.error('ClassController > index error:'+err);
        return res.view('500.ejs');
      }

      res.view('class/index', {classes: classes});
    });
  },

  new: function(req, res) {
    var msgPref = 'ClassController > $new: ';
    var defId = req.param('defId');
    if (!defId) {
      sails.log.error(msgPref+"no defId provided");
      return res.view('404.ejs');
    }

    Definition.findOne({id: defId}, function(err, definition) {
      if (err) {
        sails.log.error(msgPref+'findOne error:'+JSON.stringify(err));
        return res.view('500.ejs');
      }

      if (!definition) {
        sails.log.error(msgPref+'find no definition');
        return res.view('404.ejs');
      }

      var klass = {
        name: definition.name,
        descr:definition.descr,
        leng: definition.leng
      };

      res.view('class/form', {klass: klass});
    });
  },

  edit: function(req, res) {
    var msgPref = 'ClassController > $edit: ';
    var id = req.param('id');
    Class.findOne({id: id}, function(err, klass) {
      if (err) {
        sails.log.error(msgPref+'findOne error:'+JSON.stringify(err));
        return res.view('500.ejs');
      }

      if (!klass) {
        sails.log.error(msgPref+'find no class');
        return res.view('404.ejs');
      }

      sails.log.debug('dump class: '+JSON.stringify(klass));

      res.view('class/form', {klass: klass});
    });
  },

  status: function(req, res) {
    var msgPref = 'ClassController > status: ';

    var id = req.param('id');
    var verb = req.param('verb');
    verb = verb.toUpperCase();
    var newStat = Class.constants.STATUS[verb];
    if (isNaN(newStat)) {
      sails.log.error(msgPref+'new status wrong');
      return res.view('403.ejs');
    }

    Class.findOne(id, function(err, klass) {
      if (err) {
        sails.log.error(msgPref+'findOne class error:'+JSON.stringify(err));
        return res.view('500.ejs');
      }

      if (!klass) {
        sails.log.error(msgPref+'find no class');
        return res.view('404.ejs');
      }

      var errMsg = statusTransfer(klass, newStat);
      if (errMsg) {
        sails.log.error(msgPref+errMsg);
        return res.view('403.ejs');
      }

      var fns = [];
      if (newStat == Class.constants.STATUS.FINISHED) {
        fns.push(function(cb) {
          closeTransaction(klass, cb);
        });
      }

      fns.push(function(cb) {
        klass.save(function(err) {
          if (err) {
            sails.log.error(msgPref+'save klass error:'+JSON.stringify(err));
            return cb(500);
          }

          cb();
        });
      });

      async.parallel(fns, function(errNo) {
        if (errNo) {
          return res.view(errNo+'.ejs');
        }

        res.redirect('/class'); // following class
      });
    });
  },

  $createOrUpdate: function(req, res) {
    var msgPref = 'ClassController > $createOrUpdate: ';
    var id = req.param('id');
    id = parseInt(id);
    var name = req.param('name');
    var startAt = req.param('startAt');
    var leng = req.param('leng');
    leng = parseInt(leng);
    var descr= req.param('descr');
    var status = req.param('status');
    status = parseInt(status);

    sails.log.info('id:'+id+', name:'+name+', startAt:'+startAt+', length:'+leng+', description:'+descr);

    if (isFinite(id)) { // update
      Class.findOne({id: id}, function(err, klass) {
        if (err) {
          sails.log.error(msgPref+'error:'+JSON.stringify(err));
          return res.view('500.ejs');
        }

        if (!klass) {
          sails.log.error(msgPref+'find no class');
          return res.view('404.ejs');
        }

        klass.name = name;
        klass.leng = leng;
        klass.startAt = startAt;
        klass.descr= descr;

        var errMsg = statusTransfer(klass, status);
        if (errMsg) {
          sails.log.error(msgPref+errMsg);
          return res.view('403.ejs', {message: errMsg});
        }

        var fns = [];
        if (status == Class.constants.STATUS.FINISHED) {
          fns.push(function(cb) {
            closeTransaction(klass, cb);
          });
        }

        fns.push(function(cb) {
          klass.save(function(err) {
            if (err) {
              sails.log.error(msgPref+'save klass error:'+JSON.stringify(err));
              return cb(500);
            }

            cb();
          });
        });

        async.parallel(fns, function(errNo) {
          if (errNo) {
            return res.view(errNo+'.ejs');
          }
          res.redirect('/class');
        });
      });

    } else {  // create
      // trust the params b/c it will be validated on client side.
      var initStatus = Class.constants.STATUS.INIT;
      Class.create({name:name, leng:leng, startAt:startAt, descr:descr, status:initStatus}, function(err, newClass) {
        if (err) {
          sails.log.error(msgPref+'create class error:'+JSON.stringify(err));
          return res.view('500.ejs');
        }

        // after create, the next is to choose students
        res.view('attendance/enroll', {klass: newClass});
      });
    }
  },

  destroy: function(req, res) {
    var msgPref = 'ClassController > $destroy: ';
    var id = req.param('id');
    if (!id) {
      sails.log.error(msgPref+'no id provided for destroy');
      return res.view('404.ejs');
    }

    Class.destroy({id:id}, function(err) {
      if (err) {
        sails.log.error(msgPref+'destroy err:'+JSON.stringify(err));
        return res.view('500.ejs');
      }

      res.redirect('/class');
    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ClassController)
   */
  _config: {}
};

/**
 * check whether the klass's current status can be transfer to newStat
 * @param {Class} klass
 * @param {Number} newStat
 * @return {String|null} errMsg
 */
function statusTransfer(klass, newStat) {
  var statConst = Class.constants.STATUS;
  var errMsg = null;
  switch(klass.status) {
    case statConst.INIT:
      break;
    case statConst.OPEN:
      break;
    case statConst.CONFIRM:
      break;
    case statConst.FINISHED:
      errMsg = 'Can not transfer a finished class status to other';
      break;
  }

  if (!errMsg) klass.status = newStat;

  return errMsg;
}

/**
 * payment transaction close. Do credit cost based on class price.
 * @param {Class} klass
 * @param cb
 */
function closeTransaction(klass, cb) {
  var msgPref = "ClassController > closeTransaction ";
  var classId = klass.id;
  var price = klass.price;
  Attendance.find({classId: classId, reply: Attendance.constants.REPLY.OK}, function(err, attendances) {
    if (err) {
      sails.log.error(msgPref+'find attendance err:'+JSON.stringify(err));
      return cb(500);
    }
    attendances = attendances || [];

    var ids = _.map(attendances, function(a){ return a.userId; });
    var idStr = "(" + ids.join(",") + ")";
    var query = "update user set credit=credit-"+price+" where id in "+idStr;

    Attendance.query(query, function(err) {
      if (err) {
        sails.log.error(msgPref+'update credit error:'+JSON.stringify(err));
        return cb(500);
      }

      cb();
    });
  });
}