module.exports = function(sequelize, DataTypes){
  var User = sequelize.define('User', {
    userId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      allowNull: false,
      primaryKey: true
    },
    platformId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    alias: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    accessToken: {
      type: DataTypes.STRING
    },
    platformType: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT
    },
    location: {
      type: DataTypes.STRING
    },
  }, {
    freezeTableName: true,
    getterMethods : {
      userId: function() {
        return this.getDataValue('userId');
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
      platformType: function() {
        return this.getDataValue('platformType');
      },
      description: function() {
        return this.getDataValue('description');
      },
      location: function() {
        return this.getDataValue('location');
      },
    },
    setterMethods : {
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
    }
  });
  return User;
};
