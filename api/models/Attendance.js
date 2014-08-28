/**
 * Attendance
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    classId: 'integer', // class id
    className: 'string',// class name, duplicated to Class model but for easy access
    userId: 'integer',  // user id  often students.
    userName: 'string', // user name, duplicated but for easy access
    defId: 'integer',   // class definitionId, duplicated to Class model but for easy access
    reply: 'integer'    // reply status for the student to attend class
  },

  constants: {
    REPLY: {
      PENDING: 0,     // pending, init but not replied
      OK: 1,          // OK, student choose to attend the class
      REFUSE: 2       // refuse, student choose not to attend the class
    },
    REPLY_NUM: ['PENDING','OK','REFUSE']
  }

};