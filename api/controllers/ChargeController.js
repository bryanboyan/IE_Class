/**
 * ChargeController
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
    Charge.find({where:{}, sort:'timeAt DESC'}, function(err, chargeList) {
      if (err) {
        sails.log.error('ChargeHistController > index, find error:'+JSON.stringify(err));
        return res.view('500.ejs');
      }

      chargeList = chargeList || [];
      res.view('charge/index', {chargeList:chargeList});
    });
  },

  my: function(req, res) {
    var userId = req.session.userId;
//    sails.log.info('userId: '+userId);
    sails.log.debug('dump session: '+JSON.stringify(req.session));
    Charge.find({where:{userId:userId}, sort:'timeAt DESC'}, function(err, chargeList) {
      if (err) {
        sails.log.error('ChargeHistController > my, find error:'+JSON.stringify(err));
        return res.view('500.ejs');
      }

      chargeList = chargeList || [];
      res.view('charge/my', {chargeList:chargeList});
    });
  },

  new: function(req, res) {
    res.view('charge/form', {charge:{}});
  },

  edit: function(req, res) {
    var msgPref = "ChargeController > edit: ";
    var id = req.param('id');
    Charge.findOne({id: id}, function(err, charge) {
      if (err) {
        sails.log.error(msgPref+'findOne err:'+JSON.stringify(err));
        return res.view('500.ejs');
      }

      res.view('charge/form', {charge: charge});
    });
  },

  $createOrUpdate: function(req, res) {
    var msgPref = "ChargeController > $createOrUpdate: ";

    var id = req.param('id');
    var userId = req.param('userId');
    var userName = req.param('userName');
    var amount = req.param('amount');
    var timeAt= req.param('timeAt');

    if (id) { // update
      Charge.findOne({id: id}, function(err, charge) {
        if (err) {
          sails.log.error(msgPref+'findOne id:'+id+', err:'+JSON.stringify(err));
          return res.view('500.ejs');
        }

        var beforeAmt = charge.amount;

        charge.userId = userId;
        charge.userName = userName;
        charge.amount = amount;
        charge.timeAt= timeAt;

        var addedAmt = amount - beforeAmt;

        _updateUserCredit(userId, addedAmt, function(err1) {
          if (err1) {
            sails.log.error(msgPref+'updateUserCredit err:'+JSON.stringify(err1));
            return res.view('500.ejs');
          }

          charge.save(function(err2, updatedDoc) {
            if (err2) {
              sails.log.error(msgPref+'charge save doc:'+JSON.stringify(charge)+', err:'+JSON.stringify(err2));
              return res.view('500.ejs');
            }

            res.redirect('/charge');
          });
        });
      });

    } else {  // create
      _updateUserCredit(userId, amount, function(err1) {
        if (err1) {
          sails.log.error(msgPref+'updateUserCredit err:'+JSON.stringify(err1));
          return res.view('500.ejs');
        }

        // trust the params b/c it will be validated on client side.
        Charge.create({userId:userId, userName:userName, amount:amount, timeAt:timeAt}, function(err) {
          if (err) {
            sails.log.error(msgPref+'create err:'+JSON.stringify(err));
            return res.view('500.ejs');
          }

          res.redirect('/charge');
        });
      });
    }
  },

  destroy: function(req, res) {
    var msgPref = "ChargeController > destroy: ";
    var id = req.param('id');
    if (!id) {
      sails.log.error(msgPref+'id not given');
      return res.view('400.ejs');
    }

    var fns = [];

    fns.push(function(cb) {
      Charge.findOne({id:id}, function(err, charge) {
        if (err) {
          sails.log.error(msgPref+'findOne charge err: '+JSON.stringify(err));
          return cb(500);
        }
        if (!charge) {
          sails.log.error(msgPref+'no such charge');
          return cb(404);
        }

        cb(null, charge);
      });
    });

    fns.push(function(charge, cb) {
      var addedAmt = -charge.amount;

      if (addedAmt) { // not 0
        _updateUserCredit(charge.userId, addedAmt, function(err) {
          if (err) {
            sails.log.error(msgPref+'update user credit err: '+JSON.stringify(err));
            return cb(500);
          }
          cb();
        });
      } else {
        cb();
      }
    });

    fns.push(function(cb) {
      Charge.destroy({id:id}, function(err) {
        if (err) {
          sails.log.error(msgPref+'destroy charge err:'+JSON.stringify(err));
          return cb(500);
        }

        cb();
      });
    });

    async.waterfall(fns, function(errNo) {
      if (errNo) {
        return res.view(errNo+'.ejs');
      }

      res.redirect('/charge');
    });

  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ChargeHistController)
   */
  _config: {}


};

/**
 *
 * @param userId
 * @param amount - amount of credit to add up to user credit
 * @param cb
 * @private
 */
function _updateUserCredit (userId, amount, cb) {
  amount = parseInt(amount);
  User.findOne({id: userId}, function(err, user) {
    if (err) {
      sails.log.error('ChargeController > _updateUserCredit: '+JSON.stringify(err));
      return cb(err);
    }
    user.credit += amount;
    user.save(function(err, updatedDoc) {
      cb(err);
    });
  });
}
