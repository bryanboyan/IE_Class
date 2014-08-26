/**
 * Charge
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  autoCreatedAt: false,
  autoUpdatedAt: false,

  attributes: {
    userId: 'integer',
    userName: 'string', // 冗余，方便查看
    amount: 'integer',
    timeAt: {
      type: 'datetime'
    }
  }

};
