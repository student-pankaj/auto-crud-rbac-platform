const express = require('express');
const { body, validationResult } = require('express-validator');
const ModelDefinition = require('../models/ModelDefinition');
const { authenticateToken } = require('../middleware/auth');
const { checkModelPermission, checkOwnership } = require('../middleware/rbac');

const router = express.Router();

// Apply authentication to all dynamic routes
router.use(authenticateToken);

// Dynamic CRUD routes for published models
router.get('/:modelName', checkModelPermission('read'), async (req, res) => {
  try {
    const { modelName } = req.params;
    const { page = 1, limit = 10, search, sortBy, sortOrder = 'ASC' } = req.query;

    const modelDef = await ModelDefinition.findOne({
      where: { name: modelName, isPublished: true }
    });

    if (!modelDef) {
      return res.status(404).json({ error: 'Model not found' });
    }

    const { sequelize } = require('../config/database');
    const offset = (page - 1) * limit;

    // Build query
    let query = `SELECT * FROM ${modelDef.tableName}`;
    const replacements = [];

    // Add search functionality
    if (search) {
      const searchableFields = modelDef.definition.fields
        .filter(field => field.type === 'string' || field.type === 'text')
        .map(field => field.name);
      
      if (searchableFields.length > 0) {
        const searchConditions = searchableFields.map(field => `${field} LIKE ?`);
        query += ` WHERE ${searchConditions.join(' OR ')}`;
        searchableFields.forEach(() => replacements.push(`%${search}%`));
      }
    }

    // Add sorting
    if (sortBy) {
      query += ` ORDER BY ${sortBy} ${sortOrder}`;
    } else {
      query += ' ORDER BY id DESC';
    }

    // Add pagination
    query += ` LIMIT ? OFFSET ?`;
    replacements.push(parseInt(limit), parseInt(offset));

    // Execute query
    const [records] = await sequelize.query(query, { replacements });

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM ${modelDef.tableName}`;
    if (search && searchableFields.length > 0) {
      const searchConditions = searchableFields.map(field => `${field} LIKE ?`);
      countQuery += ` WHERE ${searchConditions.join(' OR ')}`;
    }
    
    const [countResult] = await sequelize.query(countQuery, { 
      replacements: search ? searchableFields.map(() => `%${search}%`) : [] 
    });
    const total = countResult[0].total;

    res.json({
      records,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

router.get('/:modelName/:id', checkModelPermission('read'), async (req, res) => {
  try {
    const { modelName, id } = req.params;

    const modelDef = await ModelDefinition.findOne({
      where: { name: modelName, isPublished: true }
    });

    if (!modelDef) {
      return res.status(404).json({ error: 'Model not found' });
    }

    const { sequelize } = require('../config/database');
    const [records] = await sequelize.query(
      `SELECT * FROM ${modelDef.tableName} WHERE id = ?`,
      { replacements: [id] }
    );

    if (records.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ record: records[0] });
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

router.post('/:modelName', checkModelPermission('create'), async (req, res) => {
  try {
    const { modelName } = req.params;
    const data = req.body;

    const modelDef = await ModelDefinition.findOne({
      where: { name: modelName, isPublished: true }
    });

    if (!modelDef) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Validate required fields
    const requiredFields = modelDef.definition.fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !(field.name in data));
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields: missingFields.map(field => field.name),
      });
    }

    // Add owner field if specified
    if (modelDef.definition.ownerField) {
      data[modelDef.definition.ownerField] = req.user.id;
    }

    // Add timestamps
    data.created_at = new Date();
    data.updated_at = new Date();

    const { sequelize } = require('../config/database');
    
    // Build insert query
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map(() => '?').join(', ');
    
    const query = `INSERT INTO ${modelDef.tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
    
    const [result] = await sequelize.query(query, { replacements: values });

    // Fetch the created record
    const [records] = await sequelize.query(
      `SELECT * FROM ${modelDef.tableName} WHERE id = ?`,
      { replacements: [result.insertId] }
    );

    res.status(201).json({
      message: 'Record created successfully',
      record: records[0],
    });
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

router.put('/:modelName/:id', 
  checkModelPermission('update'),
  checkOwnership,
  async (req, res) => {
    try {
      const { modelName, id } = req.params;
      const data = req.body;

      const modelDef = await ModelDefinition.findOne({
        where: { name: modelName, isPublished: true }
      });

      if (!modelDef) {
        return res.status(404).json({ error: 'Model not found' });
      }

      // Remove id and timestamps from update data
      delete data.id;
      delete data.created_at;
      data.updated_at = new Date();

      // Don't allow updating owner field unless user is admin
      if (modelDef.definition.ownerField && req.user.role !== 'Admin') {
        delete data[modelDef.definition.ownerField];
      }

      const { sequelize } = require('../config/database');
      
      // Build update query
      const fields = Object.keys(data);
      const values = Object.values(data);
      
      if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const query = `UPDATE ${modelDef.tableName} SET ${setClause} WHERE id = ?`;
      
      const [result] = await sequelize.query(query, { 
        replacements: [...values, id] 
      });

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Record not found' });
      }

      // Fetch the updated record
      const [records] = await sequelize.query(
        `SELECT * FROM ${modelDef.tableName} WHERE id = ?`,
        { replacements: [id] }
      );

      res.json({
        message: 'Record updated successfully',
        record: records[0],
      });
    } catch (error) {
      console.error('Error updating record:', error);
      res.status(500).json({ error: 'Failed to update record' });
    }
  }
);

router.delete('/:modelName/:id', 
  checkModelPermission('delete'),
  checkOwnership,
  async (req, res) => {
    try {
      const { modelName, id } = req.params;

      const modelDef = await ModelDefinition.findOne({
        where: { name: modelName, isPublished: true }
      });

      if (!modelDef) {
        return res.status(404).json({ error: 'Model not found' });
      }

      const { sequelize } = require('../config/database');
      
      const [result] = await sequelize.query(
        `DELETE FROM ${modelDef.tableName} WHERE id = ?`,
        { replacements: [id] }
      );

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Record not found' });
      }

      res.json({ message: 'Record deleted successfully' });
    } catch (error) {
      console.error('Error deleting record:', error);
      res.status(500).json({ error: 'Failed to delete record' });
    }
  }
);

module.exports = router;
