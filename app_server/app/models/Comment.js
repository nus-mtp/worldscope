/*
 * Comment is a sequelize object
 * @module Comment
 */

module.exports = function(sequelize, DataTypes) {
  var Comment = sequelize.define('Comment', {
    commentId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      allowNull: false,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: true
      }
    }
  }, {
    freezeTableName: true,
    paranoid: true,
    setterMethods: {
      createdAt: function(newDate) {
        this.setDataValue('createdAt', newDate);
      }
    },
    classMethods: {
      associate: function(models) {
        Comment.belongsTo(models.User, {
          as: 'users',
          onDelete: 'CASCADE',
          foreignKey: 'userId'
        });
        Comment.belongsTo(models.Stream, {
          as: 'streams',
          onDelete: 'CASCADE',
          foreignKey: 'streamId'
        });
      }
    }
  });
  return Comment;
};
