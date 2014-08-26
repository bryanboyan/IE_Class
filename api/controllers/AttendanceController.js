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

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AttendanceController)
   */
  _config: {}

  
};
