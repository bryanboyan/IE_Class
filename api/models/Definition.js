/**
 * Definition of Class
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
//    id: 'integer',      // class definition id  blank for sails to build it with auto-increment
    name: 'string',       // class definition name
    descr: 'text',        // class definition desc
    leng: 'integer',      // class length in minutes
    teacherId:'integer',  // teacherId
    cond: 'string'        // class conditions for students, such as "preId:4,2,10;levelReq:3;"
  }

};

/**
 * condition types:
 *  preId - students must attend the classDefId in order to attend this class
 */