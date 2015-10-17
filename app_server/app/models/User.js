module.exports = function(sequelize, DataTypes){
  var User = sequelize.define('User', {
    userId: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      primaryKey: true
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
  });
  return User;
};
