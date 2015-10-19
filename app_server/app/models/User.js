module.exports = function(sequelize, DataTypes){
  var User = sequelize.define('User', {
    userId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
    setterMethods : {
      password: function(newPassword) {
        console.log('called in user js');
        this.setDataValue('password', newPassword);
      },
      alias: function(newAlias) {
        console.log('called in user js');
        this.setDataValue('alias', newAlias);
      },
    }
  });
  return User;
};
