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
    var userId = req.param('userId');
    Charge.find({where:{userId:userId}, sort:'timeAt DESC'}, function(err, chargeList) {
      if (err) {
        sails.log.error('ChargeHistController > my, find error:'+JSON.stringify(err));
        return res.view('500.ejs');
      }

      chargeList = chargeList || [];
      res.view('charge/index', {chargeList:chargeList});
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

        charge.userId = userId;
        charge.userName = userName;
        charge.amount = amount;
        charge.timeAt= timeAt;

        charge.save(function(err, updatedDoc) {
          if (err) {
            sails.log.error(msgPref+'charge save doc:'+JSON.stringify(charge)+', err:'+JSON.stringify(err));
            return res.view('500.ejs');
          }

          res.redirect('/charge');
        });
      });

    } else {  // create
      // trust the params b/c it will be validated on client side.
      Charge.create({userId:userId, userName:userName, amount:amount, timeAt:timeAt}, function(err) {
        if (err) {
          sails.log.error(msgPref+'create err:'+JSON.stringify(err));
          return res.view('500.ejs');
        }

        res.redirect('/charge');
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

    Charge.destroy({id:id}, function(err) {
      if (err) {
        sails.log.error(msgPref+'destroy charge err:'+JSON.stringify(err));
        return res.view('500.ejs');
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
