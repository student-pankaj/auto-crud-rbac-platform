const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const ModelDefinition = require('../models/ModelDefinition');

describe('Model Management', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    // Clean up test data
    await ModelDefinition.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create a test user and get auth token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'Admin'
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  describe('POST /api/models', () => {
    it('should create a new model definition', async () => {
      const modelData = {
        name: 'TestModel',
        tableName: 'test_models',
        definition: {
          fields: [
            { name: 'name', type: 'string', required: true },
            { name: 'age', type: 'number', required: false }
          ],
          ownerField: 'ownerId',
          rbac: {
            Admin: ['all'],
            Manager: ['create', 'read', 'update'],
            Viewer: ['read']
          }
        }
      };

      const response = await request(app)
        .post('/api/models')
        .set('Authorization', `Bearer ${authToken}`)
        .send(modelData)
        .expect(201);

      expect(response.body.model.name).toBe(modelData.name);
      expect(response.body.model.tableName).toBe(modelData.tableName);
      expect(response.body.model.definition.fields).toHaveLength(2);
    });

    it('should not create model with duplicate name', async () => {
      const modelData = {
        name: 'TestModel',
        definition: {
          fields: [{ name: 'name', type: 'string', required: true }]
        }
      };

      // Create first model
      await request(app)
        .post('/api/models')
        .set('Authorization', `Bearer ${authToken}`)
        .send(modelData);

      // Try to create second model with same name
      const response = await request(app)
        .post('/api/models')
        .set('Authorization', `Bearer ${authToken}`)
        .send(modelData)
        .expect(400);

      expect(response.body.error).toBe('Model name already exists');
    });
  });

  describe('GET /api/models', () => {
    beforeEach(async () => {
      // Create test models
      await ModelDefinition.create({
        name: 'Model1',
        tableName: 'model1s',
        definition: { fields: [] },
        createdBy: userId
      });

      await ModelDefinition.create({
        name: 'Model2',
        tableName: 'model2s',
        definition: { fields: [] },
        createdBy: userId
      });
    });

    it('should get all models', async () => {
      const response = await request(app)
        .get('/api/models')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.models).toHaveLength(2);
    });
  });

  describe('POST /api/models/:id/publish', () => {
    let modelId;

    beforeEach(async () => {
      const model = await ModelDefinition.create({
        name: 'TestModel',
        tableName: 'test_models',
        definition: {
          fields: [
            { name: 'name', type: 'string', required: true },
            { name: 'age', type: 'number', required: false }
          ]
        },
        createdBy: userId
      });
      modelId = model.id;
    });

    it('should publish a model', async () => {
      const response = await request(app)
        .post(`/api/models/${modelId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Model published successfully');
      expect(response.body.model.isPublished).toBe(true);
    });
  });
});
