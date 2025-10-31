import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Chip,
  Pagination,
  Grid,
  Card,
  CardContent,
  Fade,
  Slide,
  Avatar,
  Tooltip,
  LinearProgress,
  InputAdornment,
  TableSortLabel,
  TablePagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  DataObject as DataObjectIcon,
  Visibility as VisibilityIcon,
  EditNote as EditNoteIcon,
  DeleteForever as DeleteForeverIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const DataManager = () => {
  const { modelName } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [modelDefinition, setModelDefinition] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchModelDefinition();
  }, [modelName]);

  useEffect(() => {
    if (modelDefinition) {
      fetchRecords();
    }
  }, [modelDefinition, pagination.page, search, sortBy, sortOrder]);

  const fetchModelDefinition = async () => {
    try {
      const response = await api.get('/models');
      const model = response.data.models.find(m => m.name === modelName && m.isPublished);
      if (!model) {
        setError('Model not found or not published');
        return;
      }
      setModelDefinition(model);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch model definition');
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(search && { search }),
        ...(sortBy && { sortBy, sortOrder }),
      };

      const response = await api.get(`/${modelName}`, { params });
      setRecords(response.data.records);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  const handlePageChange = (event, page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setFormData({});
    setDialogOpen(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({ ...record });
    setDialogOpen(true);
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      await api.delete(`/${modelName}/${recordId}`);
      setSuccess('Record deleted successfully');
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete record');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editingRecord) {
        await api.put(`/${modelName}/${editingRecord.id}`, formData);
        setSuccess('Record updated successfully');
      } else {
        await api.post(`/${modelName}`, formData);
        setSuccess('Record created successfully');
      }
      setDialogOpen(false);
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const canCreate = () => {
    if (!modelDefinition) return false;
    const permissions = modelDefinition.definition.rbac[user?.role] || [];
    return permissions.includes('all') || permissions.includes('create');
  };

  const canUpdate = () => {
    if (!modelDefinition) return false;
    const permissions = modelDefinition.definition.rbac[user?.role] || [];
    return permissions.includes('all') || permissions.includes('update');
  };

  const canDelete = () => {
    if (!modelDefinition) return false;
    const permissions = modelDefinition.definition.rbac[user?.role] || [];
    return permissions.includes('all') || permissions.includes('delete');
  };

  if (loading && !modelDefinition) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh">
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Loading data...
        </Typography>
      </Box>
    );
  }

  if (!modelDefinition) {
    return (
      <Box>
        <Fade in>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            Model not found or not published
          </Alert>
        </Fade>
      </Box>
    );
  }

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
            {modelName} Data
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and view data records for this model
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

      {/* Stats Card */}
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
                Data Overview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {pagination.total} total records • {modelDefinition.definition.fields.length} fields
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => fetchRecords()}
                size="small"
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Search and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
            <TextField
              placeholder="Search records..."
              value={search}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                flex: 1,
                maxWidth: 400,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                size="small"
              >
                Filters
              </Button>
              {canCreate() && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAdd}
                  sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    },
                  }}
                >
                  Add Record
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                {modelDefinition.definition.fields.map((field) => (
                  <TableCell
                    key={field.name}
                    onClick={() => handleSort(field.name)}
                    sx={{ 
                      cursor: 'pointer', 
                      userSelect: 'none',
                      fontWeight: 600,
                      color: 'text.primary',
                      '&:hover': {
                        backgroundColor: 'grey.100',
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      {field.name}
                      {sortBy === field.name && (
                        <Chip
                          label={sortOrder}
                          size="small"
                          color="primary"
                          icon={<SortIcon />}
                        />
                      )}
                    </Box>
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record, index) => (
                <Slide direction="up" in timeout={300 + index * 50} key={record.id}>
                  <TableRow 
                    sx={{ 
                      '&:hover': {
                        backgroundColor: 'grey.50',
                      },
                      '&:nth-of-type(even)': {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      },
                    }}
                  >
                    {modelDefinition.definition.fields.map((field) => (
                      <TableCell key={field.name}>
                        {field.type === 'boolean' ? (
                          <Checkbox 
                            checked={record[field.name]} 
                            disabled 
                            color="primary"
                          />
                        ) : field.type === 'date' ? (
                          <Typography variant="body2">
                            {record[field.name] ? new Date(record[field.name]).toLocaleDateString() : '-'}
                          </Typography>
                        ) : (
                          <Typography variant="body2" sx={{ 
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {String(record[field.name] || '-')}
                          </Typography>
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        {canUpdate() && (
                          <Tooltip title="Edit Record">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(record)}
                              sx={{
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: 'primary.50',
                                },
                              }}
                            >
                              <EditNoteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canDelete() && (
                          <Tooltip title="Delete Record">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(record.id)}
                              sx={{
                                color: 'error.main',
                                '&:hover': {
                                  backgroundColor: 'error.50',
                                },
                              }}
                            >
                              <DeleteForeverIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                </Slide>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {records.length === 0 && !loading && (
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
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                No records found
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {search ? 'No records match your search criteria' : 'Start by adding your first record'}
              </Typography>
              {canCreate() && !search && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAdd}
                  sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    },
                  }}
                >
                  Add First Record
                </Button>
              )}
            </Box>
          </Fade>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Box display="flex" justifyContent="center" p={2}>
            <Pagination
              count={pagination.pages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
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
            {editingRecord ? <EditNoteIcon /> : <AddIcon />}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {editingRecord ? 'Edit Record' : 'Add New Record'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {editingRecord ? 'Update the record information' : 'Fill in the details for the new record'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {modelDefinition.definition.fields.map((field) => (
              <Grid item xs={12} sm={6} key={field.name}>
                {field.type === 'boolean' ? (
                  <Card sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData[field.name] || false}
                          onChange={(e) => handleInputChange(field.name, e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {field.name}
                          </Typography>
                          {field.required && (
                            <Chip label="Required" size="small" color="error" sx={{ mt: 0.5 }} />
                          )}
                        </Box>
                      }
                    />
                  </Card>
                ) : field.type === 'date' ? (
                  <TextField
                    fullWidth
                    label={field.name}
                    type="datetime-local"
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    InputLabelProps={{ shrink: true }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                    helperText={field.required ? 'This field is required' : 'Optional'}
                  />
                ) : (
                  <TextField
                    fullWidth
                    label={field.name}
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    multiline={field.type === 'text'}
                    rows={field.type === 'text' ? 3 : 1}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                    helperText={
                      field.required 
                        ? 'This field is required' 
                        : field.type === 'text' 
                          ? 'Long text field' 
                          : 'Optional'
                    }
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setDialogOpen(false)} 
            disabled={saving}
            variant="outlined"
            size="large"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={saving}
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              },
            }}
          >
            {saving ? 'Saving...' : editingRecord ? 'Update Record' : 'Create Record'}
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    // {/* </Container> */}
  );
};

export default DataManager;
