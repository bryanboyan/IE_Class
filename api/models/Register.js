/**
 * Register
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  autoUpdatedAt: false,

  attributes: {
    id: {               // the register code.
      type: 'string',
      primaryKey: true
    },
    userId: {
      type: 'integer',
      unique: true,
      required: true
    },
    type: {
      type: 'integer',
      required: true
    },
    email: {
      type: 'string'
    }
  }

};
