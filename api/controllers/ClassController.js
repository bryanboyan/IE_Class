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

module.exports = {
    
  index: function(req, res) {
    Class.find({},function(err, klasses) {
      if (err) {
        sails.log.error('ClassController > index error:'+err);
        return res.view('500.ejs');
      }

      res.view('class/index', {klasses: klasses});
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

    // TODO deal with studentIds

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

        sails.log.info('======id:'+id+', name:'+name+', startAt:'+JSON.stringify(startAt)+', length:'+leng+', description:'+descr+', status:'+JSON.stringify(status));

        klass.name = name;
        klass.leng = leng;
        klass.startAt = startAt;
        klass.descr= descr;
        klass.status = status;

        sails.log.debug('before save, dump klass:'+JSON.stringify(klass));

        klass.save(function(err, updatedDoc) {
          if (err) {
            sails.log.error(msgPref+'save error: '+JSON.stringify(err));
            return res.view('500.ejs');
          }

          sails.log.info('updatedDoc is '+JSON.stringify(updatedDoc));

          res.redirect('/class');
        });
      });

    } else {  // create
      // trust the params b/c it will be validated on client side.
      var initStatus = Class.constants.STATUS.INIT;
      Class.create({name:name, leng:leng, startAt:startAt, descr:descr, status:initStatus}, function(err) {
        if (err) {
          sails.log.error(msgPref+'create class error:'+JSON.stringify(err));
          return res.view('500.ejs');
        }

        res.redirect('/class');
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
