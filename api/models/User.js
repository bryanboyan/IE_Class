/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: false,
      required: true
    },
    type: {
      type: 'integer',
      required: true
    },
    name: {
      type: 'string',
      unique: true,
      required: true
    },
    passwd: {
      type: 'string',
      required: true
    },
    sex: {
      type: 'string',
      required: true
    },
    descr: 'text',
    email: {
      type: 'string',
      required: true
    },
    phone: 'string',
    credit: {         // for student only, credit in IE
      type: 'integer',
      defaultsTo: 0,
      required: true
    },
    photo: {
      type: 'string'
    }
  },

  constants: {
    TYPE: {
      STUDENT: 1,
      TEACHER: 2
    },
    TYPE_NAME: ['','Student','Teacher'],
    INIT: {
      CREDIT: 0
    }
  }

};