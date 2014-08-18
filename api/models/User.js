/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    id: 'integer',
    type: 'integer',
    name: 'string',
    passwd: 'string',
    sex: 'string',
    descr: 'text',
    email: 'string',
    phone: 'string'
  },

  constants: {
    TYPE: {
      STUDENT: 1,
      TEACHER: 2
    }
  }

};