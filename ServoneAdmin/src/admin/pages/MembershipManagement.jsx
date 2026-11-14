import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  WorkspacePremium as PremiumIcon,
  TwoWheeler as RiderIcon,
  Store as VendorIcon,
  CheckCircle as CheckIcon,
  Stars as StarIcon,
  Person as PersonIcon,
  ContactMail as LeadIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../../utils/utils';

export default function MembershipManagement() {
  const [tabIndex, setTabIndex] = useState(0); // 0: User, 1: Rider, 2: Vendor, 3: Subscriptions, 4: Enquiries
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAudience, setFilterAudience] = useState('all');

  // Modal State for Plan
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    targetAudience: 'user',
    price: 99,
    originalPrice: 199,
    billingCycle: 'month',
    tag: 'POPULAR',
    badge: 'PREMIER',
    badgeColor: '#0B3EDB',
    subtitle: '',
    description: '',
    featuresText: '',
    commissionRate: '',
    isActive: true,
    sortOrder: 0,
  };
  const [formData, setFormData] = useState(initialForm);

  // Fetch plans
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/memberships/admin/plans`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setPlans(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      toast.error('Failed to load membership plans');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Subscriptions
  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/memberships/admin/subscriptions`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setSubscriptions(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Enquiries
  const fetchEnquiries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/memberships/admin/enquiries`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setEnquiries(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tabIndex === 3) {
      fetchSubscriptions();
    } else if (tabIndex === 4) {
      fetchEnquiries();
    } else {
      fetchPlans();
    }
  }, [tabIndex, fetchPlans, fetchSubscriptions, fetchEnquiries]);

  // Open modal for Create
  const handleOpenCreate = (audience = 'user') => {
    setEditingPlan(null);
    setFormData({
      ...initialForm,
      targetAudience: audience,
      badge: audience === 'rider' ? 'PRO RIDER' : audience === 'vendor' ? 'VERIFIED MERCHANT' : 'PREMIER',
      tag: audience === 'rider' ? 'PRO, DAY PASS' : audience === 'vendor' ? 'RECOMMENDED' : 'POPULAR',
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      targetAudience: plan.targetAudience,
      price: plan.price,
      originalPrice: plan.originalPrice || 0,
      billingCycle: plan.billingCycle || 'month',
      tag: plan.tag || '',
      badge: plan.badge || 'PREMIER',
      badgeColor: plan.badgeColor || '#0B3EDB',
      subtitle: plan.subtitle || '',
      description: plan.description || '',
      featuresText: (plan.features || []).join('\n'),
      commissionRate: plan.commissionRate || '',
      isActive: plan.isActive !== undefined ? plan.isActive : true,
      sortOrder: plan.sortOrder || 0,
    });
    setIsModalOpen(true);
  };

  // Submit Plan Form
  const handleSubmitPlan = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        features: formData.featuresText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (editingPlan) {
        await axios.put(`${API_BASE_URL}/api/memberships/admin/plans/${editingPlan._id}`, payload, {
          withCredentials: true,
        });
        toast.success('Membership plan updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/api/memberships/admin/plans`, payload, {
          withCredentials: true,
        });
        toast.success('New membership plan created successfully!');
      }

      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      console.error('Plan save error:', err);
      toast.error(err.response?.data?.message || 'Failed to save membership plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Plan Active
  const handleToggleActive = async (plan) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/memberships/admin/plans/${plan._id}`,
        { isActive: !plan.isActive },
        { withCredentials: true }
      );
      toast.success(`Plan ${!plan.isActive ? 'activated' : 'deactivated'}`);
      fetchPlans();
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  // Delete Plan
  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this membership plan?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/memberships/admin/plans/${planId}`, {
        withCredentials: true,
      });
      toast.success('Plan deleted successfully');
      fetchPlans();
    } catch (err) {
      toast.error('Failed to delete plan');
    }
  };

  // Update Enquiry Status
  const handleUpdateEnquiryStatus = async (id, status) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/memberships/admin/enquiries/${id}/status`,
        { status },
        { withCredentials: true }
      );
      toast.success(`Enquiry marked as ${status}`);
      fetchEnquiries();
    } catch (err) {
      toast.error('Failed to update enquiry');
    }
  };

  // Filter plans based on active tab
  const currentAudience = tabIndex === 0 ? 'user' : tabIndex === 1 ? 'rider' : tabIndex === 2 ? 'vendor' : null;
  const filteredPlans = currentAudience ? plans.filter((p) => p.targetAudience === currentAudience) : plans;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Top Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #07162E 0%, #0A2B6B 50%, #0B3EDB 100%)',
          borderRadius: 3,
          p: { xs: 2.5, md: 3.5 },
          color: '#fff',
          mb: 3,
          boxShadow: '0 10px 25px -5px rgba(11, 62, 219, 0.25)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <PremiumIcon sx={{ fontSize: 32, color: '#f59e0b' }} />
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
                Memberships & VIP Subscription Center
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', maxWidth: 700 }}>
              Live dynamic plans, pricing, benefits and badges for Customers (Tricelyn Premier), Delivery Riders (Ride with Tricelyn), and Supermarket Merchants (Sell with Tricelyn). Changes here reflect instantly across the Web portal and mobile apps.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => {
                if (tabIndex === 3) fetchSubscriptions();
                else if (tabIndex === 4) fetchEnquiries();
                else fetchPlans();
              }}
              startIcon={<RefreshIcon />}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', borderRadius: 2, textTransform: 'none' }}
            >
              Refresh
            </Button>
            {tabIndex <= 2 && (
              <Button
                variant="contained"
                onClick={() => handleOpenCreate(currentAudience || 'user')}
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: '#fff',
                  color: '#0B3EDB',
                  fontWeight: 700,
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#f1f5f9' },
                }}
              >
                Create New Plan
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 2, mb: 3, overflow: 'hidden' }}>
        <Tabs
          value={tabIndex}
          onChange={(e, val) => setTabIndex(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            borderBottom: '1px solid #e2e8f0',
            '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', py: 2 },
          }}
        >
          <Tab icon={<PersonIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Customer Premier Plans" />
          <Tab icon={<RiderIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Rider Partner Plans" />
          <Tab icon={<VendorIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Supermarket Merchant Plans" />
          <Tab icon={<StarIcon sx={{ fontSize: 20 }} />} iconPosition="start" label={`Active Subscriptions (${subscriptions.length})`} />
          <Tab icon={<LeadIcon sx={{ fontSize: 20 }} />} iconPosition="start" label={`Applications & Enquiries (${enquiries.length})`} />
        </Tabs>
      </Paper>

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress sx={{ color: '#0B3EDB' }} />
        </Box>
      )}

      {/* ================= TABS 0, 1, 2: PLANS VIEW ================= */}
      {!loading && tabIndex <= 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#07162E' }}>
              {tabIndex === 0 && '👤 Customer Premier Subscription Tiers'}
              {tabIndex === 1 && '🛵 Ride with Tricelyn Partner Passes'}
              {tabIndex === 2 && '🏪 Supermarket Merchant Onboarding Packages'}
            </Typography>
            <Chip
              label={`${filteredPlans.length} Active Plans Configured`}
              color="primary"
              size="small"
              sx={{ fontWeight: 700, bgcolor: '#0B3EDB' }}
            />
          </Box>

          <Grid container spacing={3}>
            {filteredPlans.map((plan) => (
              <Grid item xs={12} sm={6} lg={4} key={plan._id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': {
                      boxShadow: '0 12px 28px -6px rgba(11,62,219,0.15)',
                      borderColor: '#0B3EDB',
                    },
                  }}
                >
                  {/* Tag Pill if exists */}
                  {plan.tag && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -12,
                        right: 20,
                        bgcolor: '#0B3EDB',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 800,
                        px: 1.5,
                        py: 0.3,
                        borderRadius: 5,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        boxShadow: '0 4px 10px rgba(11,62,219,0.3)',
                      }}
                    >
                      {plan.tag}
                    </Box>
                  )}

                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#07162E' }}>
                        {plan.name}
                      </Typography>
                      <Chip
                        label={plan.badge || 'PREMIER'}
                        size="small"
                        sx={{
                          bgcolor: plan.badgeColor || '#0B3EDB',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: 10,
                        }}
                      />
                    </Box>

                    {plan.subtitle && (
                      <Typography variant="body2" sx={{ color: '#64748b', mb: 2, fontSize: 13 }}>
                        {plan.subtitle}
                      </Typography>
                    )}

                    {/* Price Block */}
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, my: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#0B3EDB' }}>
                        ₹{plan.price}
                      </Typography>
                      {plan.originalPrice > plan.price && (
                        <Typography variant="body2" sx={{ textDecoration: 'line-through', color: '#94a3b8' }}>
                          ₹{plan.originalPrice}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                        / {plan.billingCycle}
                      </Typography>
                    </Box>

                    {plan.commissionRate && (
                      <Box sx={{ bgcolor: '#eff6ff', p: 1, borderRadius: 1.5, mb: 2 }}>
                        <Typography variant="caption" sx={{ color: '#0B3EDB', fontWeight: 700 }}>
                          Rate / Payout: {plan.commissionRate}
                        </Typography>
                      </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Features checklist */}
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                      Included Benefits ({plan.features?.length || 0}):
                    </Typography>
                    <Box sx={{ mt: 1, maxHeight: 180, overflowY: 'auto' }}>
                      {(plan.features || []).map((feat, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.8 }}>
                          <CheckIcon sx={{ fontSize: 16, color: '#10b981', mt: 0.2, flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ fontSize: 12.5, color: '#334155' }}>
                            {feat}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={plan.isActive}
                            onChange={() => handleToggleActive(plan)}
                            color="primary"
                            size="small"
                          />
                        }
                        label={<Typography variant="caption" sx={{ fontWeight: 700 }}>{plan.isActive ? 'Active' : 'Inactive'}</Typography>}
                      />
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => handleOpenEdit(plan)} sx={{ color: '#0B3EDB' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeletePlan(plan._id)} sx={{ color: '#ef4444' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ================= TAB 3: ACTIVE SUBSCRIPTIONS VIEW ================= */}
      {!loading && tabIndex === 3 && (
        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#07162E' }}>
              Subscribed Members & Active VIP Passes
            </Typography>
            <TextField
              size="small"
              placeholder="Search user, phone or plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', sm: 260 } }}
            />
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Subscriber Name</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Mobile</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Audience</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Plan Name</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Price Paid</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Badge</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Active Until</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscriptions
                  .filter((s) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      s.userName?.toLowerCase().includes(q) ||
                      s.userPhone?.toLowerCase().includes(q) ||
                      s.planName?.toLowerCase().includes(q)
                    );
                  })
                  .map((sub) => (
                    <TableRow key={sub._id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{sub.userName || 'Member'}</TableCell>
                      <TableCell>{sub.userPhone || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={sub.targetAudience.toUpperCase()}
                          size="small"
                          sx={{
                            fontSize: 10,
                            fontWeight: 800,
                            bgcolor: sub.targetAudience === 'rider' ? '#e0f2fe' : sub.targetAudience === 'vendor' ? '#fef3c7' : '#eff6ff',
                            color: sub.targetAudience === 'rider' ? '#0369a1' : sub.targetAudience === 'vendor' ? '#b45309' : '#0B3EDB',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{sub.planName}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#0B3EDB' }}>₹{sub.pricePaid}</TableCell>
                      <TableCell>
                        <Chip
                          label={sub.badgeText || 'PREMIER'}
                          size="small"
                          sx={{ bgcolor: '#0B3EDB', color: '#fff', fontWeight: 800, fontSize: 10 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>
                        {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'Lifetime'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={sub.status.toUpperCase()}
                          size="small"
                          color={sub.status === 'active' ? 'success' : 'default'}
                          sx={{ fontWeight: 800, fontSize: 10 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                {subscriptions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                      No membership subscriptions found yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* ================= TAB 4: ENQUIRIES / APPLICATIONS ================= */}
      {!loading && tabIndex === 4 && (
        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#07162E' }}>
              Rider & Supermarket Partner Applications
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Leads received from the website and apps for "Apply to ride" and "Apply to join supermarket".
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Name / Store</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Mobile</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Area / Sector</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Vehicle / Live Items</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Applied On</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enquiries.map((enq) => (
                  <TableRow key={enq._id} hover>
                    <TableCell>
                      <Chip
                        label={enq.type === 'rider' ? '🛵 RIDER' : '🏪 STORE'}
                        size="small"
                        sx={{
                          fontSize: 10,
                          fontWeight: 800,
                          bgcolor: enq.type === 'rider' ? '#eff6ff' : '#fef3c7',
                          color: enq.type === 'rider' ? '#0B3EDB' : '#b45309',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {enq.fullName || enq.storeName || enq.ownerName || 'Applicant'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{enq.mobile}</TableCell>
                    <TableCell>{enq.area || '—'}</TableCell>
                    <TableCell>{enq.vehicleType || enq.liveItems || '—'}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {new Date(enq.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={enq.status.toUpperCase()}
                        size="small"
                        color={enq.status === 'approved' ? 'success' : enq.status === 'contacted' ? 'info' : 'warning'}
                        sx={{ fontWeight: 800, fontSize: 10 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleUpdateEnquiryStatus(enq._id, 'contacted')}
                          sx={{ textTransform: 'none', fontSize: 11 }}
                        >
                          Contacted
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleUpdateEnquiryStatus(enq._id, 'approved')}
                          sx={{ textTransform: 'none', fontSize: 11 }}
                        >
                          Approve
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {enquiries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                      No incoming partner applications yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* ================= PLAN CREATE / EDIT MODAL ================= */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmitPlan}>
          <DialogTitle sx={{ fontWeight: 800, color: '#07162E' }}>
            {editingPlan ? 'Edit Membership Plan' : 'Create New Membership Plan'}
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Plan Name"
                  fullWidth
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Tricelyn Premier Monthly"
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  select
                  label="Target Audience"
                  fullWidth
                  required
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                >
                  <MenuItem value="user">👤 Customer (Premier)</MenuItem>
                  <MenuItem value="rider">🛵 Rider Partner (Pro Pass)</MenuItem>
                  <MenuItem value="vendor">🏪 Supermarket Merchant</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  select
                  label="Billing Cycle"
                  fullWidth
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                >
                  <MenuItem value="day">Daily (1 Day)</MenuItem>
                  <MenuItem value="week">Weekly (7 Days)</MenuItem>
                  <MenuItem value="month">Monthly (30 Days)</MenuItem>
                  <MenuItem value="quarter">Quarterly (90 Days)</MenuItem>
                  <MenuItem value="year">Annual (365 Days)</MenuItem>
                  <MenuItem value="one-time">One-Time (Onboarding)</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Active Price (₹)"
                  type="number"
                  fullWidth
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Original Price (₹) (Strikethrough)"
                  type="number"
                  fullWidth
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Badge Text (Shown Next to Name)"
                  fullWidth
                  required
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. PREMIER, PRO RIDER"
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Badge Color Hex"
                  fullWidth
                  value={formData.badgeColor}
                  onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                  placeholder="#0B3EDB"
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Tag Pill (e.g. POPULAR, BEST VALUE)"
                  fullWidth
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Commission Rate / Notes"
                  fullWidth
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                  placeholder="e.g. 5 to 8% or +₹4-₹9/order"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Subtitle / Headline"
                  fullWidth
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Real perks, no free-delivery tricks."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Features List (One feature per line)"
                  multiline
                  rows={5}
                  fullWidth
                  required
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  placeholder={"Peak-hour fees stay the same as normal hours\nPriority delivery when riders are short\nScheduled delivery slots\nCash on delivery on eligible orders"}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Plan is Active & Live in Apps/Website"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setIsModalOpen(false)} sx={{ color: '#64748b' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{ bgcolor: '#0B3EDB', fontWeight: 700, px: 3 }}
            >
              {isSubmitting ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

