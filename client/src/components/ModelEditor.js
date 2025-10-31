import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Fade,
  Slide,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  DataObject as DataObjectIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const ModelEditor = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [modelData, setModelData] = useState({
    name: '',
    tableName: '',
    definition: {
      fields: [],
      ownerField: '',
      rbac: {
        Admin: ['all'],
        Manager: ['create', 'read', 'update'],
        Viewer: ['read'],
      },
    },
  });

  useEffect(() => {
    if (isEdit) {
      fetchModel();
    }
  }, [id, isEdit]);

  const fetchModel = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/models/${id}`);
      const model = response.data.model;
      setModelData({
        name: model.name,
        tableName: model.tableName,
        definition: model.definition,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch model');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setModelData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setModelData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const addField = () => {
    setModelData(prev => ({
      ...prev,
      definition: {
        ...prev.definition,
        fields: [
          ...prev.definition.fields,
          {
            name: '',
            type: 'string',
            required: false,
            default: '',
            unique: false,
          },
        ],
      },
    }));
  };

  const updateField = (index, field, value) => {
    setModelData(prev => ({
      ...prev,
      definition: {
        ...prev.definition,
        fields: prev.definition.fields.map((f, i) =>
          i === index ? { ...f, [field]: value } : f
        ),
      },
    }));
  };

  const removeField = (index) => {
    setModelData(prev => ({
      ...prev,
      definition: {
        ...prev.definition,
        fields: prev.definition.fields.filter((_, i) => i !== index),
      },
    }));
  };

  const updateRbac = (role, permissions) => {
    setModelData(prev => ({
      ...prev,
      definition: {
        ...prev.definition,
        rbac: {
          ...prev.definition.rbac,
          [role]: permissions,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Generate table name if not provided
      const finalTableName = modelData.tableName || `${modelData.name.toLowerCase()}s`;

      const payload = {
        name: modelData.name,
        tableName: finalTableName,
        definition: modelData.definition,
      };

      if (isEdit) {
        await api.put(`/models/${id}`, payload);
        setSuccess('Model updated successfully');
      } else {
        await api.post('/models', payload);
        setSuccess('Model created successfully');
        navigate('/models');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save model');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh">
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Loading model...
        </Typography>
      </Box>
    );
  }

  const steps = ['Basic Information', 'Fields', 'Ownership & Security'];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={4}>
        <IconButton 
          onClick={() => navigate('/models')} 
          sx={{ 
            mr: 2,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            {isEdit ? 'Edit Model' : 'Create New Model'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEdit ? 'Update your model configuration' : 'Define a new data model with fields and permissions'}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Fade in>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        </Fade>
      )}

      {success && (
        <Fade in>
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </Fade>
      )}

      {/* Progress Indicator */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              width: 40,
              height: 40,
            }}>
              <DataObjectIcon />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Model Configuration Progress
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={((modelData.name ? 1 : 0) + (modelData.definition.fields.length > 0 ? 1 : 0) + (modelData.definition.ownerField ? 1 : 0)) * 33.33}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Avatar sx={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                    width: 40,
                    height: 40,
                  }}>
                    <SettingsIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Basic Information
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Model Name"
                      value={modelData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      disabled={isEdit && modelData.definition?.isPublished}
                      helperText="A descriptive name for your model"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Table Name"
                      value={modelData.tableName}
                      onChange={(e) => handleInputChange('tableName', e.target.value)}
                      placeholder="Auto-generated if empty"
                      disabled={isEdit && modelData.definition?.isPublished}
                      helperText="Database table name (snake_case recommended)"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Fields Section */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ 
                      background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                      width: 40,
                      height: 40,
                    }}>
                      <DataObjectIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Fields Configuration
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {modelData.definition.fields.length} field{modelData.definition.fields.length !== 1 ? 's' : ''} defined
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={addField}
                    disabled={isEdit && modelData.definition?.isPublished}
                    sx={{
                      background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                      },
                    }}
                  >
                    Add Field
                  </Button>
                </Box>

                {modelData.definition.fields.map((field, index) => (
                  <Slide direction="up" in timeout={300 + index * 100} key={index}>
                    <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <Avatar sx={{ 
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            width: 32,
                            height: 32,
                          }}>
                            {index + 1}
                          </Avatar>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Field {index + 1}
                          </Typography>
                          <Box flex={1} />
                          <IconButton
                            onClick={() => removeField(index)}
                            color="error"
                            disabled={isEdit && modelData.definition?.isPublished}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>

                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Field Name"
                              value={field.name}
                              onChange={(e) => updateField(index, 'name', e.target.value)}
                              required
                              disabled={isEdit && modelData.definition?.isPublished}
                              placeholder="e.g., title, description"
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <FormControl fullWidth>
                              <InputLabel>Type</InputLabel>
                              <Select
                                value={field.type}
                                label="Type"
                                onChange={(e) => updateField(index, 'type', e.target.value)}
                                disabled={isEdit && modelData.definition?.isPublished}
                              >
                                <MenuItem value="string">String</MenuItem>
                                <MenuItem value="number">Number</MenuItem>
                                <MenuItem value="boolean">Boolean</MenuItem>
                                <MenuItem value="date">Date</MenuItem>
                                <MenuItem value="text">Text</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              fullWidth
                              label="Default Value"
                              value={field.default || ''}
                              onChange={(e) => updateField(index, 'default', e.target.value)}
                              disabled={isEdit && modelData.definition?.isPublished}
                              placeholder="Optional"
                            />
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <Box display="flex" flexDirection="column" gap={1}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={field.required}
                                    onChange={(e) => updateField(index, 'required', e.target.checked)}
                                    disabled={isEdit && modelData.definition?.isPublished}
                                  />
                                }
                                label="Required"
                                sx={{ fontSize: '0.875rem' }}
                              />
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={field.unique}
                                    onChange={(e) => updateField(index, 'unique', e.target.checked)}
                                    disabled={isEdit && modelData.definition?.isPublished}
                                  />
                                }
                                label="Unique"
                                sx={{ fontSize: '0.875rem' }}
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Slide>
                ))}

                {modelData.definition.fields.length === 0 && (
                  <Fade in>
                    <Box textAlign="center" py={6}>
                      <Avatar sx={{ 
                        width: 64, 
                        height: 64, 
                        mx: 'auto', 
                        mb: 2,
                        background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                      }}>
                        <WarningIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        No fields defined
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 3 }}>
                        Add fields to define the structure of your data model
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={addField}
                        disabled={isEdit && modelData.definition?.isPublished}
                        sx={{
                          background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                          },
                        }}
                      >
                        Add Your First Field
                      </Button>
                    </Box>
                  </Fade>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Ownership & Security */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Avatar sx={{ 
                    background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                    width: 40,
                    height: 40,
                  }}>
                    <SecurityIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Ownership & Security
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* Ownership */}
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <PersonIcon color="action" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Data Ownership
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      label="Owner Field Name"
                      value={modelData.definition.ownerField}
                      onChange={(e) => handleInputChange('definition.ownerField', e.target.value)}
                      placeholder="e.g., ownerId, userId"
                      helperText="Field name that will store the owner's user ID"
                      disabled={isEdit && modelData.definition?.isPublished}
                    />
                  </Grid>

                  {/* RBAC */}
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <SecurityIcon color="action" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Access Control
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Configure permissions for different user roles
                    </Typography>
                  </Grid>
                </Grid>

                {/* RBAC Grid */}
                <Grid container spacing={2}>
                  {['Admin', 'Manager', 'Viewer'].map((role) => (
                    <Grid item xs={12} sm={4} key={role}>
                      <Card sx={{ 
                        border: '1px solid', 
                        borderColor: 'divider',
                        background: role === 'Admin' ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : 
                                   role === 'Manager' ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' :
                                   'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                      }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <Avatar sx={{ 
                              width: 24, 
                              height: 24,
                              background: role === 'Admin' ? '#f59e0b' : 
                                         role === 'Manager' ? '#3b82f6' : '#64748b',
                            }}>
                              {role.charAt(0)}
                            </Avatar>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {role}
                            </Typography>
                          </Box>
                          <FormControl fullWidth>
                            <InputLabel>Permissions</InputLabel>
                            <Select
                              multiple
                              value={modelData.definition.rbac[role] || []}
                              onChange={(e) => updateRbac(role, e.target.value)}
                              renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {selected.map((value) => (
                                    <Chip key={value} label={value} size="small" />
                                  ))}
                                </Box>
                              )}
                              disabled={isEdit && modelData.definition?.isPublished}
                            >
                              <MenuItem value="create">Create</MenuItem>
                              <MenuItem value="read">Read</MenuItem>
                              <MenuItem value="update">Update</MenuItem>
                              <MenuItem value="delete">Delete</MenuItem>
                              <MenuItem value="all">All</MenuItem>
                            </Select>
                          </FormControl>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/models')}
                    disabled={saving}
                    size="large"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={saving || modelData.definition.fields.length === 0}
                    size="large"
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      },
                    }}
                  >
                    {saving ? 'Saving...' : isEdit ? 'Update Model' : 'Create Model'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ModelEditor;
