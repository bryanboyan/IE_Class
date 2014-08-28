/**
 * AttendanceController
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

  /**
   * 获取学生的课程信息，包括
   * 1，已经上完的课程       (finished)
   * 2，接下来要上的课程     (following)
   * 3，接下来要确认上的课程  (pending)
   * @param req
   * @param res
   */
  my: function(req, res) {
    var msgPref = 'AttendanceController > my: ';
    var id = req.session.userId;
    Attendance.find({userId:id}, function(err, classes) {
      if (err) {
        sails.log.error(msgPref + 'find err:'+JSON.stringify(err));
        return res.view('500.ejs');
      }



      res.view('')
    });
  },

  classmates: function(req, res) {
    var msgPref = 'AttendanceController > classmates: ';
    var classId = req.param('classId');
    classId = parseInt(classId);

    Attendance.find({classId:classId}, function(err, attendances) {
      if (err) {
        sails.log.error(msgPref + 'find err:'+JSON.stringify(err));
        return res.view('500.ejs');
      }

      attendances = attendances || [];
      attendances.forEach(function(atdc) {
        atdc.name = atdc.userName;
      });
      res.json(attendances);
    });
  },

  edit: function(req, res) {
    var classId = req.param('classId');
    classId = parseInt(classId);
    res.view('attendance/update', {klass: {id: classId}});
  },

  start: function(req, res) {
    var classId = req.param('classId');
    classId = parseInt(classId);
    res.view('attendance/enroll', {klass: {id: classId}});
  },

  /**
   * Choose many students for a class
   * @param req
   * @param res
   */
  enroll: function(req, res) {
    var msgPref = 'AttendanceController > enroll: ';

    var studentIds = req.param('studentId');  // an array
    sails.log.debug('studentIds:'+JSON.stringify(studentIds));
    if (!studentIds) {
      studentIds = [];
    } else if (typeof(studentIds) === 'string') {
      studentIds = [studentIds];
    }
    studentIds = _.uniq(studentIds);

    var studentNames = req.param('studentName');  // an array
    if (!studentNames) {
      studentNames = [];
    } else if (typeof(studentNames) === 'string') {
      studentNames = [studentNames];
    }
    studentNames = _.uniq(studentNames);

    var classId = req.param('classId');
    classId = parseInt(classId);

    var fns = [];
    fns.push(function(cb) {
      Class.findOne({id: classId}, function(err, klass) {
        if (err) {
          sails.log.error(msgPref+'class findOne err:'+JSON.stringify(err));
          return cb(500);
        }
        if (!klass) {
          sails.log.error(msgPref+'class NA');
          return cb(404);
        }
        cb(null, klass);
      });
    });

    fns.push(function(klass, cb) {
      var records = [];
      for (var i=0; i<studentIds.length; ++i) {
        var sid = studentIds[i];
        var name= studentNames[i];
        records.push({
          classId: classId,
          className: klass.name,
          userId: sid,
          userName: name,
          defId: klass.defId,
          status: Attendance.constants.STATUS.PENDING
        });
      }
      sails.log.debug(msgPref + 'records:'+JSON.stringify(records));
      Attendance.create(records, function(err) {
        if (err) {
          if (err.code != 'ER_DUP_ENTRY') {
            sails.log.error(msgPref+'create records error:'+JSON.stringify(err));
            return cb(500);
          }
          sails.log.warn(msgPref+'create records duplicate:'+JSON.stringify(err));
        }
        cb();
      });
    });

    async.waterfall(fns, function(errNo) {
      if (errNo) {
        return res.view(errNo+'.ejs');
      }

      res.redirect('/class');
    });
  },

  updateStatus: function(req, res) {
    var msgPref = "AttendanceController > new: ";
    var classId = req.param('classId');
    var userId = req.param('userId');
    var verb = req.param('verb');
    verb = verb.toUpperCase();
    var stat = Attendance.constants.STATUS[verb];

    Attendance.findOne({classId:classId, userId:userId}, function(err,attendance) {
      if (err) {
        sails.log.error(msgPref+'findOne err:'+JSON.stringify(err));
        return res.view('500.ejs');
      }

      if (!attendance) {
        sails.log.error(msgPref+'attendance record NA');
        return res.view('404.ejs');
      }

      var eMsg;
      switch(attendance.status) {
        case Attendance.constants.STATUS.PENDING:
          // no problem with this
          break;
        case Attendance.constants.STATUS.OK:
          // can not change to other status, error
          eMsg = 'Can not change status from OK to others';
          break;
        case Attendance.constants.STATUS.REFUSE:
          // can only be changed to OK
          if (stat != Attendance.constants.STATUS.OK) {
            eMsg = 'Can not change status from Refuse to non-OK status';
          }
          break;
      }
      if (eMsg) {
        sails.log.error(msgPref+'status update logic error:'+eMsg);
        return res.view('403.ejs',{message:eMsg});
      }

      attendance.status = stat;
      attendance.save(function(err) {
        if (err) {
          sails.log.error(msgPref+'attendance save error:'+JSON.stringify(err));
          return res.view('500.ejs');
        }

        res.view();
      });
    });
  },

  /**
   * Choose one student for a class
   * @param req
   * @param res
   */
  new: function(req, res) {
    var msgPref = "AttendanceController > new: ";
    var classId = req.param('classId');
    var userId = req.param('userId');
    var userName = req.param('userName');

    var fns = [];
    fns.push(function(cb) {
      Class.findOne({id: classId}, function(err, klass) {
        if (err) {
          sails.log.error(msgPref+'class findOne err:'+JSON.stringify(err));
          return cb(500);
        }
        if (!klass) {
          sails.log.error(msgPref+'class NA');
          return cb(404);
        }
        cb(null, klass);
      });
    });

    fns.push(function(klass, cb) {
      var record = {
        classId: classId,
        className: klass.name,
        userId: userId,
        userName: userName,
        defId: klass.defId,
        status: Attendance.constants.STATUS.PENDING
      };
      Attendance.create(record, function(err) {
        if (err) {
          if (err.code != 'ER_DUP_ENTRY') {
            sails.log.error(msgPref+'create records error:'+JSON.stringify(err));
            return cb(500);
          }
          sails.log.warn(msgPref+'create records duplicate:'+JSON.stringify(err));
        }
        cb();
      });
    });

    async.waterfall(fns, function(errNo) {
      if (errNo) {
        return res.send(errNo);
      }
      res.send(200);
    });
  },

  /**
   * delete one attendance
   * @param req
   * @param res
   */
  delete: function(req, res) {
    var msgPref = "AttendanceController > new: ";
    var classId = req.param('classId');
    var userId = req.param('userId');

    Attendance.destroy({classId:classId, userId:userId}, function(err) {
      if (err) {
        sails.log.error(msgPref+'destroy error:'+JSON.stringify(err));
        return res.send(500);
      }
      res.send(200);
    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AttendanceController)
   */
  _config: {}

  
};
