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
    valid: {            // is true initially, turn false when used.
      type: 'boolean',
      required: true,
      defaultsTo: true
    },
    userId: {           // keeps all userId history, for userId findUp
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
