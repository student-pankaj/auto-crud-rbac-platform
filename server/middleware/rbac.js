const ModelDefinition = require('../models/ModelDefinition');

const checkModelPermission = (action) => {
  return async (req, res, next) => {
    try {
      const { modelName } = req.params;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Admin has all permissions
      if (user.role === 'Admin') {
        return next();
      }

      // Find the model definition
      const modelDef = await ModelDefinition.findOne({
        where: { name: modelName, isPublished: true }
      });

      if (!modelDef) {
        return res.status(404).json({ error: 'Model not found' });
      }

      const definition = modelDef.definition;
      const rbac = definition.rbac || {};

      // Check if user's role has the required permission
      const userPermissions = rbac[user.role] || [];
      
      if (userPermissions.includes('all') || userPermissions.includes(action)) {
        // Check ownership if ownerField is defined and action is update/delete
        if ((action === 'update' || action === 'delete') && definition.ownerField) {
          const recordId = req.params.id;
          if (recordId) {
            // This will be handled by the dynamic route handler
            req.ownerField = definition.ownerField;
          }
        }
        return next();
      }

      return res.status(403).json({ 
        error: `Insufficient permissions for ${action} operation on ${modelName}` 
      });
    } catch (error) {
      console.error('RBAC check error:', error);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

const checkOwnership = async (req, res, next) => {
  try {
    const { modelName, id } = req.params;
    const user = req.user;
    const ownerField = req.ownerField;

    if (!ownerField) {
      return next(); // No ownership check required
    }

    // Admin can access all records
    if (user.role === 'Admin') {
      return next();
    }

    // Find the model definition to get the table name
    const modelDef = await ModelDefinition.findOne({
      where: { name: modelName, isPublished: true }
    });

    if (!modelDef) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Check ownership in the dynamic table
    const { sequelize } = require('../config/database');
    const [results] = await sequelize.query(
      `SELECT ${ownerField} FROM ${modelDef.tableName} WHERE id = ?`,
      { replacements: [id] }
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    const ownerId = results[0][ownerField];
    if (ownerId !== user.id) {
      return res.status(403).json({ error: 'Access denied: You can only access your own records' });
    }

    next();
  } catch (error) {
    console.error('Ownership check error:', error);
    return res.status(500).json({ error: 'Ownership check failed' });
  }
};

module.exports = {
  checkModelPermission,
  checkOwnership,
};
