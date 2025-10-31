# Auto-Generated CRUD + RBAC Platform

A low-code platform that allows users to define data models through a web UI and automatically generates CRUD APIs with Role-Based Access Control (RBAC).

## Features

- 🎨 **Web-based Model Editor**: Define models with fields, types, and validation rules
- 🔐 **Role-Based Access Control**: Configure permissions per role (Admin, Manager, Viewer)
- 🚀 **Dynamic CRUD APIs**: Automatically generated REST endpoints for each model
- 📁 **File-based Persistence**: Model definitions saved as JSON files
- 👥 **User Management**: JWT-based authentication with role management
- 🎯 **Ownership Support**: Optional owner field for record-level permissions
- 📊 **Admin Interface**: Generic UI for managing data in published models

## Tech Stack

### Backend
- **Node.js** + **Express.js**
- **SQLite** database with **Sequelize** ORM
- **JWT** authentication
- **File-based** model persistence

### Frontend
- **React.js** with **Material-UI**
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** for form management

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auto-crud-rbac-platform
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Start the application**
   ```bash
   # From the root directory
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend (port 3000).

### Alternative: Start services separately

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

## Usage Guide

### 1. User Registration & Login

1. Navigate to `http://localhost:3000`
2. Use the **Register** tab to create a new account
3. Choose your role:
   - **Admin**: Full access to all features
   - **Manager**: Can create and manage models
   - **Viewer**: Read-only access

### 2. Creating a Model

1. Click **"Create Model"** on the dashboard
2. Fill in the basic information:
   - **Model Name**: e.g., "Product", "Employee"
   - **Table Name**: Auto-generated if empty (e.g., "products", "employees")

3. **Define Fields**:
   - Click **"Add Field"** to add new fields
   - For each field, specify:
     - **Name**: Field identifier
     - **Type**: string, number, boolean, date, or text
     - **Required**: Whether the field is mandatory
     - **Default**: Default value
     - **Unique**: Whether values must be unique

4. **Configure Ownership** (Optional):
   - Set an **Owner Field** name (e.g., "ownerId", "userId")
   - This enables record-level permissions

5. **Set RBAC Permissions**:
   - Configure what each role can do:
     - **Admin**: All permissions
     - **Manager**: Create, Read, Update
     - **Viewer**: Read only

6. Click **"Create Model"** to save

### 3. Publishing a Model

1. From the dashboard, click the **menu** (⋮) on your model
2. Select **"Publish"**
3. Confirm the action

**What happens when you publish:**
- Model definition is written to `/server/models/{ModelName}.json`
- Database table is created with the specified fields
- CRUD APIs become available at `/api/{modelName}`
- Model becomes available for data management

### 4. Managing Data

1. Click **"View Data"** on a published model
2. Use the interface to:
   - **Search** records
   - **Sort** by any field
   - **Add** new records
   - **Edit** existing records
   - **Delete** records (based on permissions)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Model Management
- `GET /api/models` - List all models
- `POST /api/models` - Create new model
- `GET /api/models/:id` - Get specific model
- `PUT /api/models/:id` - Update model
- `DELETE /api/models/:id` - Delete model
- `POST /api/models/:id/publish` - Publish model

### Dynamic CRUD (Generated for each published model)
- `GET /api/{modelName}` - List records (with pagination, search, sort)
- `GET /api/{modelName}/:id` - Get specific record
- `POST /api/{modelName}` - Create new record
- `PUT /api/{modelName}/:id` - Update record
- `DELETE /api/{modelName}/:id` - Delete record

## File Structure

```
auto-crud-rbac-platform/
├── server/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   ├── rbac.js             # Role-based access control
│   │   └── errorHandler.js     # Error handling
│   ├── models/
│   │   ├── User.js             # User model
│   │   ├── ModelDefinition.js  # Model definition model
│   │   └── {ModelName}.json    # Generated model files
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── models.js           # Model management routes
│   │   └── dynamic.js          # Dynamic CRUD routes
│   ├── tests/                  # Test files
│   └── index.js                # Server entry point
├── client/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── contexts/           # React contexts
│   │   └── services/           # API services
│   └── public/                 # Static files
└── package.json                # Root package.json
```

## Model Definition Format

When a model is published, its definition is saved as a JSON file:

```json
{
  "name": "Employee",
  "tableName": "employees",
  "fields": [
    {
      "name": "name",
      "type": "string",
      "required": true,
      "default": "",
      "unique": false
    },
    {
      "name": "age",
      "type": "number",
      "required": false,
      "default": null,
      "unique": false
    },
    {
      "name": "isActive",
      "type": "boolean",
      "required": false,
      "default": true,
      "unique": false
    }
  ],
  "ownerField": "ownerId",
  "rbac": {
    "Admin": ["all"],
    "Manager": ["create", "read", "update"],
    "Viewer": ["read"]
  },
  "publishedAt": "2024-01-01T00:00:00.000Z"
}
```

## RBAC System

### Roles
- **Admin**: Full access to all operations
- **Manager**: Can create, read, and update (no delete)
- **Viewer**: Read-only access

### Permissions
- **create**: Can create new records
- **read**: Can view records
- **update**: Can modify existing records
- **delete**: Can remove records
- **all**: All permissions

### Ownership
When an `ownerField` is specified:
- Only the record owner or Admin can update/delete
- Other users can only read (based on role permissions)

## Testing

Run the test suite:

```bash
cd server
npm test
```

Tests cover:
- User authentication and registration
- Model creation and management
- RBAC permission enforcement
- Dynamic CRUD operations

## Development

### Adding New Features

1. **Backend**: Add routes in `/server/routes/`
2. **Frontend**: Add components in `/client/src/components/`
3. **Database**: Add models in `/server/models/`

### Environment Variables

Create a `.env` file in the server directory:

```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
NODE_ENV=development
PORT=5000
```

## Troubleshooting

### Common Issues

1. **"Cannot connect to database"**
   - Ensure SQLite is properly installed
   - Check file permissions in the server directory

2. **"Authentication failed"**
   - Verify JWT_SECRET is set
   - Check token expiration

3. **"Model not found"**
   - Ensure model is published
   - Check model name spelling

4. **"Permission denied"**
   - Verify user role and permissions
   - Check RBAC configuration

### Logs

- Backend logs: Check console output
- Database: SQLite file at `/server/database.sqlite`
- Model files: `/server/models/*.json`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue in the repository

---


