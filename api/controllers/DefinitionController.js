/**
 * DefinitionController
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

  // 列出来所有的class definition
  index: function(req, res) {
    Definition.find({},function(err, definitions) {
      if (err) {
        sails.log.error('DefinitionController > index error:'+err);
      }

      res.view('definition/index', {definitions: definitions});
    });
  },

  new: function(req, res) {
    res.view('definition/form', {definition: {}});
  },

  edit: function(req, res) {
    var id = req.param('id');
    Definition.findOne({id: id}, function(err, definition) {
      if (err || !definition) {

      }

      res.view('definition/form', {definition: definition});
    });
  },

  $createOrUpdate: function(req, res) {
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
    var id = req.param('id');
    if (!id) {

    }

    Definition.destroy({id:id}, function(err) {
      if (err) {

      }

      res.redirect('/definition');
    });
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to DefinitionController)
   */
  _config: {}

  
};
