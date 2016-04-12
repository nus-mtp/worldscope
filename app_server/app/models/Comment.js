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
    },
    alias: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    }
  }, {
    freezeTableName: true,
    paranoid: true,
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
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
