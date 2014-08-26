/**
 * Attendance
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    classId: 'number',  // class id
    className: 'string',// class name, duplicated to Class model but for easy access
    userId: 'number', // user id  often students.
    defId: 'number',  // class definitionId, duplicated to Class model but for easy access
    status: 'number'  // status for the student to attend class
  },

  constants: {
    STATUS: {
      PENDING: 0,     // pending, init but not replied
      OK: 1,          // OK, student choose to attend the class
      REFUSE: 2       // refuse, student choose not to attend the class
    }
  }

};