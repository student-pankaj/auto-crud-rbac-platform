const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ModelDefinition = sequelize.define('ModelDefinition', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [1, 100],
    },
  },
  tableName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [1, 100],
    },
  },
  definition: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'model_definitions',
});

module.exports = ModelDefinition;
