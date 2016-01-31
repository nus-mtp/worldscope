/*
 * Stream is a sequelize object
 * @module Stream
 */

module.exports = function(sequelize, DataTypes) {
  var Stream = sequelize.define('Stream', {
    streamId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      allowNull: false,
      primaryKey: true
    },
    appInstance: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    roomId: {
      type: DataTypes.STRING
    },
    totalStickers: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalViewers: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    live: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    duration: {
      type: DataTypes.STRING,
      defaultValue: '0'
    },
    endedAt: {
      type: DataTypes.DATE
    },
    description: {
      type: DataTypes.TEXT
    }
  }, {
    paranoid: true,
    freezeTableName: true,
    setterMethods: {
      createdAt: function(newDate) {
        this.setDataValue('createdAt', newDate);
      }
    },
    classMethods: {
      associate: function(models) {
        Stream.belongsTo(models.User, {
          as: 'streamer',
          onDelete: 'CASCADE',
          foreignKey: 'owner'
        });
      }
    }
  });
  return Stream;
};
