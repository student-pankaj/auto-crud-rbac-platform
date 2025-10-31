const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs-extra');

// Support both PostgreSQL (via DATABASE_URL) and SQLite (with custom path)
let sequelize;

if (process.env.DATABASE_URL) {
  // PostgreSQL (for production with Render PostgreSQL)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    define: {
      timestamps: true,
      underscored: true,
    },
  });
} else {
  // SQLite (for development or Render with disk)
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../database.sqlite');
  const dbDir = path.dirname(dbPath);
  
  // Ensure directory exists
  fs.ensureDirSync(dbDir);
  
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
    define: {
      timestamps: true,
      underscored: true,