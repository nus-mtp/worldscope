/*
 * Subscription is a sequelize object
 * @module Subscription
 */

module.exports = function(sequelize, DataTypes) {
  var Subscription = sequelize.define('Subscription', {
    subscriptionId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      allowNull: false,
      primaryKey: true
    }
  }, {
    freezeTableName: true,
    setterMethods: {
      createdAt: function(newDate) {
        this.setDataValue('createdAt', newDate);
      }
    }
  });
  return Subscription;
};
