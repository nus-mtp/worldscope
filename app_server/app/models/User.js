/*
 * User is a sequelize object
 * @module User
 */

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    userId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      allowNull: false,
      primaryKey: true
    },
    platformType: {
      type: DataTypes.ENUM,
      values: ['facebook']
    },
    platformId: {
      type: DataTypes.STRING
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    alias: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    accessToken: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT
    },
    location: {
      type: DataTypes.STRING
    },
    permissions: {
      type: DataTypes.STRING,
      defaultValue: null // default to null for all users
    }
  }, {
    freezeTableName: true,
    paranoid: true,
    getterMethods: {
      userId: function() {
        return this.getDataValue('userId');
      },
      platformType: function() {
        return this.getDataValue('platformType');
      },
      platformId: function() {
        return this.getDataValue('platformId');
      },
      username: function() {
        return this.getDataValue('username');
      },
      alias: function() {
        return this.getDataValue('alias');
      },
      email: function() {
        return this.getDataValue('email');
      },
      password: function() {
        return this.getDataValue('password');
      },
      accessToken: function() {
        return this.getDataValue('accessToken');
      },
      description: function() {
        return this.getDataValue('description');
      },
      location: function() {
        return this.getDataValue('location');
      },
    },
    setterMethods: {
      username: function(newUsername) {
        this.setDataValue('username', newUsername);
      },
      alias: function(newAlias) {
        this.setDataValue('alias', newAlias);
      },
      email: function(newEmail) {
        this.setDataValue('email', newEmail);
      },
      password: function(newPassword) {
        this.setDataValue('password', newPassword);
      },
      accessToken: function(newToken) {
        this.setDataValue('accessToken', newToken);
      },
      platformType: function(newPlatform) {
        this.setDataValue('platformType', newPlatform);
      },
      description: function(newDescription) {
        this.setDataValue('description', newDescription);
      },
      location: function(newLocation) {
        this.setDataValue('location', newLocation);
      }
    },
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Stream, {
          as: 'streams',
          foreignKey: 'owner'
        });
        User.belongsToMany(models.Stream, {
          through: models.View,
          as: 'View',
          foreignKey: 'userId'
        });
        User.belongsToMany(models.User, {
          through: models.Subscription,
          as: 'Subscriptions', // pro
          foreignKey: 'subscriber' // noob
        });
        User.belongsToMany(models.User, {
          through: models.Subscription,
          as: 'Subscribers', // noob
          foreignKey: 'subscribeTo' // pro
        });
      }
    }
  });
  return User;
};

