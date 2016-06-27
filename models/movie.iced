module.exports = (sequelize, DataTypes) ->
  sequelize.define 'Movie',
    name: DataTypes.STRING
    description: DataTypes.STRING