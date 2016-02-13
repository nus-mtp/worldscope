/*
 * View is a sequelize object
 * @module View
 */

module.exports = function(sequelize, DataTypes) {
  var View = sequelize.define('View', {
    viewId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      allowNull: false,
      primaryKey: true
    },
    endedAt: {
      type: DataTypes.DATE
    }
  }, {
    paranoid: true,
    freezeTableName: true,
    setterMethods: {
      createdAt: function(newDate) {
        this.setDataValue('createdAt', newDate);
      }
    }
  });
  return View;
};
