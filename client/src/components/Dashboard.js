import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Fade,
  Slide,
  Avatar,
  CardActions,
  LinearProgress,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  Visibility as ViewIcon,
  DataObject as DataObjectIcon,
  Storage as StorageIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const Dashboard = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await api.get('/models');
      setModels(response.data.models);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch models');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, model) => {
    setAnchorEl(event.currentTarget);
    setSelectedModel(model);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Only clear selectedModel if no dialogs are open
    if (!publishDialogOpen && !deleteDialogOpen) {
      setSelectedModel(null);
    }
  };

  const handleEdit = () => {
    if (selectedModel) {
      navigate(`/models/${selectedModel.id}/edit`);
    }
    handleMenuClose();
  };

  const handleViewData = () => {
    if (selectedModel && selectedModel.isPublished) {
      navigate(`/data/${selectedModel.name}`);
    }
    handleMenuClose();
  };

  const handlePublish = () => {
    // Open the publish dialog but keep the current selectedModel intact
    setPublishDialogOpen(true);
    // Just close the context menu without clearing the selection
    setAnchorEl(null);
  };

  const confirmPublish = async () => {
    if (!selectedModel) {
      console.error('No selected model for publishing');
      setError('No model selected for publishing');
      return;
    }

    console.log('Publishing model:', selectedModel);
    
    try {
      const response = await api.post(`/models/${selectedModel.id}/publish`);
      console.log('Publish response:', response.data);
      
      setPublishDialogOpen(false);
      setSelectedModel(null);
      fetchModels();
      
      // Show success message
      setSuccess('Model published successfully!');
    } catch (err) {
      console.error('Publish error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to publish model';
      setError(errorMessage);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (!selectedModel) return;

    try {
      await api.delete(`/models/${selectedModel.id}`);
      setDeleteDialogOpen(false);
      fetchModels();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete model');
    }
  };

  const canEdit = (model) => {
    return model.createdBy === user?.id || user?.role === 'Admin';
  };

  const canPublish = (model) => {
    return !model.isPublished && (user?.role === 'Admin' || user?.role === 'Manager');
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh">
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Loading models...
        </Typography>
      </Box>
    );
  }

  const publishedModels = models.filter(model => model.isPublished);
  const draftModels = models.filter(model => !model.isPublished);

  return (
    <Box>
      {/* Header Section */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome back, {user?.username}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your data models and explore the platform
        </Typography>
      </Box>

      {error && (
        <Fade in>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {models.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Models
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  background: 'rgba(255, 255, 255, 0.2)',
                  width: 56,
                  height: 56,
                }}>
                  <DataObjectIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            color: 'white',
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {publishedModels.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Published
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  background: 'rgba(255, 255, 255, 0.2)',
                  width: 56,
                  height: 56,
                }}>
                  <CheckCircleIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            color: 'white',
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {draftModels.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Drafts
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  background: 'rgba(255, 255, 255, 0.2)',
                  width: 56,
                  height: 56,
                }}>
                  <RadioButtonUncheckedIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            color: 'white',
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {models.reduce((acc, model) => acc + (model.definition.fields?.length || 0), 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Fields
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  background: 'rgba(255, 255, 255, 0.2)',
                  width: 56,
                  height: 56,
                }}>
                  <StorageIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Your Models
        </Typography>
        {(user?.role === 'Admin' || user?.role === 'Manager') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/models/new')}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              },
            }}
          >
            Create Model
          </Button>
        )}
      </Box>

      {/* Models Grid */}
      <Grid container spacing={3}>
        {models.map((model, index) => (
          <Grid item xs={12} sm={6} lg={4} key={model.id}>
            <Slide direction="up" in timeout={300 + index * 100}>
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                },
              }}>
                <CardContent sx={{ flex: 1, pb: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ 
                        background: model.isPublished 
                          ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                          : 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                        width: 40,
                        height: 40,
                      }}>
                        <DataObjectIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                          {model.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {model.tableName}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, model)}
                      disabled={!canEdit(model) && !canPublish(model) && !model.isPublished}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {model.definition.fields?.length || 0} fields defined
                    </Typography>
                    {model.definition.ownerField && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Ownership: {model.definition.ownerField}
                      </Typography>
                    )}
                  </Box>

                  <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                    <Chip
                      label={model.isPublished ? 'Published' : 'Draft'}
                      color={model.isPublished ? 'success' : 'warning'}
                      size="small"
                      icon={model.isPublished ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                    />
                    {model.definition.ownerField && (
                      <Chip 
                        label="Ownership" 
                        color="info" 
                        size="small"
                        icon={<PersonIcon />}
                      />
                    )}
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Created {new Date(model.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  {model.isPublished && (
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => navigate(`/data/${model.name}`)}
                      sx={{ mr: 1 }}
                    >
                      View Data
                    </Button>
                  )}
                  {canEdit(model) && (
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/models/${model.id}/edit`)}
                    >
                      Edit
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Slide>
          </Grid>
        ))}
      </Grid>

      {models.length === 0 && (
        <Fade in>
          <Box textAlign="center" py={8}>
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 3,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            }}>
              <DataObjectIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              No models found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create your first model to get started with data management
            </Typography>
            {(user?.role === 'Admin' || user?.role === 'Manager') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/models/new')}
                size="large"
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  },
                }}
              >
                Create Your First Model
              </Button>
            )}
          </Box>
        </Fade>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedModel?.isPublished && (
          <MenuItem onClick={handleViewData}>
            <ViewIcon sx={{ mr: 1 }} />
            View Data
          </MenuItem>
        )}
        {selectedModel && canEdit(selectedModel) && (
          <MenuItem onClick={handleEdit}>
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </MenuItem>
        )}
        {selectedModel && canPublish(selectedModel) && (
          <MenuItem onClick={handlePublish}>
            <PublishIcon sx={{ mr: 1 }} />
            Publish
          </MenuItem>
        )}
        {selectedModel && canEdit(selectedModel) && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* Publish Confirmation Dialog */}
      <Dialog 
        open={publishDialogOpen} 
        onClose={() => {
          setPublishDialogOpen(false);
          setSelectedModel(null);
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <Avatar sx={{ 
            background: 'rgba(255, 255, 255, 0.2)',
            width: 40,
            height: 40,
          }}>
            <PublishIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Publish Model
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Make your model available for data management
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              width: 48,
              height: 48,
            }}>
              <DataObjectIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedModel?.name || 'Unknown Model'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Table: {selectedModel?.tableName}
              </Typography>
            </Box>
          </Box>
          
          {selectedModel?.definition?.fields?.length === 0 ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                ⚠️ Warning: This model has no fields defined!
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                You should add at least one field to your model before publishing. 
                A model without fields will create an empty table with only system fields (id, created_at, updated_at).
              </Typography>
            </Alert>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Publishing this model will:
              </Typography>
              <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                <Typography component="li" variant="body2">
                  Create a database table with {selectedModel?.definition?.fields?.length || 0} fields
                </Typography>
                <Typography component="li" variant="body2">
                  Make the model available for data management
                </Typography>
                <Typography component="li" variant="body2">
                  Enable CRUD operations based on role permissions
                </Typography>
              </Box>
            </Alert>
          )}
          
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to proceed with publishing this model?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => {
              setPublishDialogOpen(false);
              setSelectedModel(null);
            }}
            variant="outlined"
            size="large"
          >
            Cancel
          </Button>
          <Button 
            onClick={async () => {
              if (!selectedModel) {
                setError('No model selected for publishing');
                return;
              }

              setPublishing(true);
              setError('');
              
              try {
                console.log('Publishing model:', selectedModel);
                const response = await api.post(`/models/${selectedModel.id}/publish`);
                console.log('Publish response:', response.data);
                
                setPublishDialogOpen(false);
                setSelectedModel(null);
                fetchModels();
                setSuccess('Model published successfully!');
              } catch (err) {
                console.error('Publish error:', err);
                const errorMessage = err.response?.data?.error || err.message || 'Failed to publish model';
                setError(errorMessage);
              } finally {
                setPublishing(false);
              }
            }}
            variant="contained"
            size="large"
            disabled={publishing || !selectedModel}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              },
            }}
          >
            {publishing ? 'Publishing...' : 'Publish Model'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedModel(null);
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <Avatar sx={{ 
            background: 'rgba(255, 255, 255, 0.2)',
            width: 40,
            height: 40,
          }}>
            <DeleteIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Delete Model
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              This action cannot be undone
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              width: 48,
              height: 48,
            }}>
              <DataObjectIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedModel?.name || 'Unknown Model'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Table: {selectedModel?.tableName}
              </Typography>
            </Box>
          </Box>
          
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Deleting this model will:
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              <Typography component="li" variant="body2">
                Permanently remove the model definition
              </Typography>
              {selectedModel?.isPublished && (
                <Typography component="li" variant="body2">
                  Drop the database table and all associated data
                </Typography>
              )}
              <Typography component="li" variant="body2">
                Remove all access permissions and configurations
              </Typography>
            </Box>
          </Alert>
          
          <Typography variant="body2" color="text.secondary">
            Are you absolutely sure you want to delete this model? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => {
              setDeleteDialogOpen(false);
              setSelectedModel(null);
            }}
            variant="outlined"
            size="large"
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained"
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
              },
            }}
          >
            Delete Model
          </Button>
        </DialogActions>
      </Dialog>
     </Box> /* </Container> */
  );
};

export default Dashboard;
