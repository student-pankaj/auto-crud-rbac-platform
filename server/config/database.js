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
    },
  });
}

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Import models in the correct order (User first, then ModelDefinition)
    const User = require('../models/User');
    const ModelDefinition = require('../models/ModelDefinition');
    
    // Sync models in order - User first, then ModelDefinition
    await User.sync({ force: false });
    await ModelDefinition.sync({ force: false });
    
    console.log('Database synchronized successfully.');
    
    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  initializeDatabase,
};
