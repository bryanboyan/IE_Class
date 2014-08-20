/**
 * Class
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs				:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
//    id: 'integer',        // id of class  blank for sails to build it with auto-increment
    name: 'string',       // name of the class (init with definition name)
    descr: 'text',        // desc of the class (init with definition desc)
    startAt: 'datetime',  // start date time
    leng: 'integer',      // class duration
    status: 'integer'      // status of the class
  },

  constants: {
    STATUS: {
      INIT: 0,        // init, can only be viewed or edited by teacher
      PENDING: 1,     // pending, not confirmed by all
      CONFIRMED: 2,   // confirmed, confirmed by students and teacher, ready for attendance, students can not change attendance status at this point
      FINISHED: 3     // already finished
    },
    STAT_NUM: ['INIT', 'PENDING', 'CONFIRMED', 'FINISHED']  // the stat number->status collection
  }

};