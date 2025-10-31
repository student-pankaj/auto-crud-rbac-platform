const express = require('express');
const { body, validationResult } = require('express-validator');
const fs = require('fs-extra');
const path = require('path');
const ModelDefinition = require('../models/ModelDefinition');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { checkModelPermission } = require('../middleware/rbac');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all model definitions
router.get('/', async (req, res) => {
  try {
    const models = await ModelDefinition.findAll({
      order: [['createdAt', 'DESC']],
    });

    res.json({ models });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// Get a specific model definition
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const model = await ModelDefinition.findByPk(id);

    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    res.json({ model });
  } catch (error) {
    console.error('Error fetching model:', error);
    res.status(500).json({ error: 'Failed to fetch model' });
  }
});

// Create a new model definition
router.post('/', [
  body('name')
    .notEmpty()
    .withMessage('Model name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Model name must be between 1 and 100 characters'),
  body('tableName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Table name must be between 1 and 100 characters'),
  body('definition')
    .isObject()
    .withMessage('Definition must be an object'),
  body('definition.fields')
    .isArray({ min: 1 })
    .withMessage('At least one field is required'),
  body('definition.fields.*.name')
    .notEmpty()
    .withMessage('Field name is required'),
  body('definition.fields.*.type')
    .isIn(['string', 'number', 'boolean', 'date', 'text'])
    .withMessage('Field type must be string, number, boolean, date, or text'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, tableName, definition } = req.body;
    const user = req.user;

    // Generate table name if not provided
    const finalTableName = tableName || `${name.toLowerCase()}s`;

    // Check if model name already exists
    const existingModel = await ModelDefinition.findOne({
      where: { name }
    });

    if (existingModel) {
      return res.status(400).json({ error: 'Model name already exists' });
    }

    // Check if table name already exists
    const existingTable = await ModelDefinition.findOne({
      where: { tableName: finalTableName }
    });

    if (existingTable) {
      return res.status(400).json({ error: 'Table name already exists' });
    }

    // Create model definition
    const model = await ModelDefinition.create({
      name,
      tableName: finalTableName,
      definition,
      createdBy: user.id,
    });

    res.status(201).json({
      message: 'Model definition created successfully',
      model,
    });
  } catch (error) {
    console.error('Error creating model:', error);
    res.status(500).json({ error: 'Failed to create model' });
  }
});

// Update a model definition
router.put('/:id', [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Model name must be between 1 and 100 characters'),
  body('tableName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Table name must be between 1 and 100 characters'),
  body('definition')
    .optional()
    .isObject()
    .withMessage('Definition must be an object'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, tableName, definition } = req.body;
    const user = req.user;

    const model = await ModelDefinition.findByPk(id);
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Check permissions (only creator or admin can update)
    if (model.createdBy !== user.id && user.role !== 'Admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Check if model is published (can't update published models)
    if (model.isPublished) {
      return res.status(400).json({ error: 'Cannot update published model' });
    }

    // Check for name conflicts
    if (name && name !== model.name) {
      const existingModel = await ModelDefinition.findOne({
        where: { name, id: { $ne: id } }
      });
      if (existingModel) {
        return res.status(400).json({ error: 'Model name already exists' });
      }
    }

    // Check for table name conflicts
    const finalTableName = tableName || model.tableName;
    if (finalTableName !== model.tableName) {
      const existingTable = await ModelDefinition.findOne({
        where: { tableName: finalTableName, id: { $ne: id } }
      });
      if (existingTable) {
        return res.status(400).json({ error: 'Table name already exists' });
      }
    }

    // Update model
    await model.update({
      name: name || model.name,
      tableName: finalTableName,
      definition: definition || model.definition,
    });

    res.json({
      message: 'Model updated successfully',
      model,
    });
  } catch (error) {
    console.error('Error updating model:', error);
    res.status(500).json({ error: 'Failed to update model' });
  }
});

// Publish a model (write to file and create table)
router.post('/:id/publish', requireRole(['Admin', 'Manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const model = await ModelDefinition.findByPk(id);

    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    if (model.isPublished) {
      return res.status(400).json({ error: 'Model is already published' });
    }

    // Normalize/parse model definition
    const parsedDefinition = typeof model.definition === 'string' 
      ? JSON.parse(model.definition) 
      : (model.definition || {});

    // Write model definition to file
    const modelsDir = path.join(__dirname, '../models');
    const filePath = path.join(modelsDir, `${model.name}.json`);
    // Ensure the models directory exists before writing
    await fs.ensureDir(modelsDir);

    await fs.writeJson(filePath, {
      ...parsedDefinition,
      name: model.name,
      tableName: model.tableName,
      publishedAt: new Date().toISOString(),
    }, { spaces: 2 });

    // Create the dynamic table
    const { sequelize } = require('../config/database');
    const definition = parsedDefinition;
    
    // Build column definitions
    const columns = {
      id: {
        type: 'INTEGER',
        primaryKey: true,
        autoIncrement: true,
      },
      created_at: {
        type: 'DATETIME',
        defaultValue: 'CURRENT_TIMESTAMP',
      },
      updated_at: {
        type: 'DATETIME',
        defaultValue: 'CURRENT_TIMESTAMP',
      },
    };

    // Add custom fields
    const fields = Array.isArray(definition?.fields) ? definition.fields : [];
    fields.forEach(field => {
      let columnType = 'TEXT';
      switch (field.type) {
        case 'number':
          columnType = 'INTEGER';
          break;
        case 'boolean':
          columnType = 'BOOLEAN';
          break;
        case 'date':
          columnType = 'DATETIME';
          break;
        case 'text':
          columnType = 'TEXT';
          break;
        default:
          columnType = 'VARCHAR(255)';
      }

      columns[field.name] = {
        type: columnType,
        allowNull: !field.required,
        defaultValue: field.default,
        unique: field.unique,
      };
    });

    // Add owner field if specified
    if (definition?.ownerField) {
      columns[definition.ownerField] = {
        type: 'INTEGER',
        allowNull: true,
        references: {
          model: 'User',
          key: 'id',
        },
      };
    }

    // Create table
    const columnDefs = Object.entries(columns)
      .map(([name, def]) => {
        // Quote identifier names to avoid issues with reserved words
        let defStr = `\`${name}\` ${def.type}`;
        if (def.primaryKey) defStr += ' PRIMARY KEY';
        if (def.autoIncrement) defStr += ' AUTOINCREMENT';
        if (!def.allowNull) defStr += ' NOT NULL';
        if (def.unique) defStr += ' UNIQUE';
        if (def.defaultValue !== undefined) {
          // Avoid quoting CURRENT_TIMESTAMP and similar SQL functions
          const isSqlFunction = typeof def.defaultValue === 'string' && /\bCURRENT_TIMESTAMP\b/i.test(def.defaultValue);
          const defaultValue = typeof def.defaultValue === 'string' && !isSqlFunction
            ? `'${def.defaultValue}'`
            : def.defaultValue;
          defStr += ` DEFAULT ${defaultValue}`;
        }
        return defStr;
      })
      .join(', ');

    // Quote table name as well
    await sequelize.query(`CREATE TABLE IF NOT EXISTS \`${model.tableName}\` (${columnDefs})`);

    // Mark model as published
    await model.update({ isPublished: true });

    res.json({
      message: 'Model published successfully',
      model,
      filePath,
    });
  } catch (error) {
    console.error('Error publishing model:', error);
    res.status(500).json({ error: error?.message || 'Failed to publish model' });
  }
});

// Delete a model definition
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const model = await ModelDefinition.findByPk(id);
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Check permissions (only creator or admin can delete)
    if (model.createdBy !== user.id && user.role !== 'Admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // If model is published, drop the table
    if (model.isPublished) {
      const { sequelize } = require('../config/database');
      await sequelize.query(`DROP TABLE IF EXISTS ${model.tableName}`);
      
      // Remove model file
      const modelsDir = path.join(__dirname, '../models');
      const filePath = path.join(modelsDir, `${model.name}.json`);
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
      }
    }

    await model.destroy();

    res.json({ message: 'Model deleted successfully' });
  } catch (error) {
    console.error('Error deleting model:', error);
    res.status(500).json({ error: 'Failed to delete model' });
  }
});

module.exports = router;
