import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Switch,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Tooltip,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import {
  VpnKey,
  ContentCopy,
  Visibility,
  VisibilityOff,
  Edit,
  Security,
  Storefront,
  OpenInNew,
  Search,
  Refresh,
  CheckCircle,
  Block,
  Phone,
  Email
} from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/utils';

const PERMISSION_OPTIONS = [
  { id: 'orders', label: 'Live Order Processing & Packing', desc: 'Accept, pack, and hand over orders to delivery riders' },
  { id: 'inventory', label: 'Real-Time Stock & Out-of-Stock Control', desc: 'Update item stock levels, set low stock limits, toggle out-of-stock' },
  { id: 'products', label: 'Submit Products for Admin Approval', desc: 'Add new store products and submit to Super Admin for verification' },
  { id: 'payouts', label: 'Settlement Ledger & Payout Requests', desc: 'View net store earnings, commission deduction and request bank payouts' },
  { id: 'settings', label: 'Store Timings & Operational Switches', desc: 'Set daily opening/closing hours and holiday closure' },
  { id: 'analytics', label: 'Store Performance Analytics', desc: 'View daily GMV, delivered order count, and customer ratings' },
];

export default function VendorCredentialsManagement() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [visiblePins, setVisiblePins] = useState({});

  // Credential Dialog State
  const [credDialogOpen, setCredDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [credForm, setCredForm] = useState({
    pin: '',
    password: '',
    ownerName: '',
    phone: '',
    email: '',
    assignedRole: 'Store Manager',
    permissions: []
  });
  const [saving, setSaving] = useState(false);

  // RBAC Dialog State
  const [rbacDialogOpen, setRbacDialogOpen] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/vendors/credentials/all`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      if (res.data?.vendors) {
        setVendors(res.data.vendors);
      }
    } catch (err) {
      console.error('Failed to load vendor credentials:', err.message);
      toast.error('Failed to load vendor credentials');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const togglePinVisibility = (id) => {
    setVisiblePins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  // Generate clean WhatsApp / SMS login slip to send to vendor
  const copyLoginSlip = (v) => {
    const text = `🏪 *TRICELYN STORE PARTNER LOGIN CREDENTIALS*
━━━━━━━━━━━━━━━━━━━━━
📍 *Store:* ${v.name}
👤 *Manager:* ${v.ownerName}
🌐 *Portal URL:* https://vendor.tricelyn.com or Vendor Partner App
📱 *Login ID (Mobile):* ${v.phone}
🔑 *Security PIN:* ${v.pin}
🛡️ *Assigned Role:* ${v.assignedRole}
⚡ *Granted Permissions:* ${v.permissions?.join(', ')}
━━━━━━━━━━━━━━━━━━━━━
_Please keep your credentials confidential. Issued by Tricelyn Super Admin._`;

    navigator.clipboard.writeText(text);
    toast.success(`Full login credential slip for "${v.name}" copied! Ready to paste into WhatsApp / Email.`);
  };

  // Open Edit Credentials Modal
  const openEditCredModal = (v) => {
    setSelectedVendor(v);
    setCredForm({
      pin: v.pin || '1234',
      password: '',
      ownerName: v.ownerName || '',
      phone: v.phone || '',
      email: v.email || '',
      assignedRole: v.assignedRole || 'Store Manager',
      permissions: v.permissions || ['orders', 'inventory']
    });
    setCredDialogOpen(true);
  };

  // Open RBAC Modal
  const openRbacModal = (v) => {
    setSelectedVendor(v);
    setCredForm({
      pin: v.pin || '1234',
      password: '',
      ownerName: v.ownerName || '',
      phone: v.phone || '',
      email: v.email || '',
      assignedRole: v.assignedRole || 'Store Manager',
      permissions: v.permissions || ['orders', 'inventory']
    });
    setRbacDialogOpen(true);
  };

  // Save Credentials
  const handleSaveCredentials = async () => {
    if (!selectedVendor) return;
    setSaving(true);
    try {
      await axios.put(
        `${API_BASE_URL}/api/admin/vendors/${selectedVendor._id}/credentials`,
        credForm,
        { headers: getAuthHeaders(), withCredentials: true }
      );

      setVendors(prev => prev.map(v => {
        if (v._id === selectedVendor._id) {
          return {
            ...v,
            pin: credForm.pin || v.pin,
            ownerName: credForm.ownerName || v.ownerName,
            phone: credForm.phone || v.phone,
            email: credForm.email || v.email,
            assignedRole: credForm.assignedRole || v.assignedRole,
            permissions: credForm.permissions || v.permissions
          };
        }
        return v;
      }));

      toast.success(`Credentials and security PIN updated for ${selectedVendor.name}!`);
      setCredDialogOpen(false);
      setRbacDialogOpen(false);
    } catch (err) {
      console.error('Error updating credentials:', err);
      toast.error('Failed to update credentials: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (v) => {
    const nextStatus = !v.isActive;
    try {
      await axios.put(
        `${API_BASE_URL}/api/admin/vendors/${v._id}/credentials`,
        { isActive: nextStatus },
        { headers: getAuthHeaders(), withCredentials: true }
      );

      setVendors(prev => prev.map(item => item._id === v._id ? { ...item, isActive: nextStatus, status: nextStatus ? 'active' : 'suspended' } : item));
      toast.success(`${v.name} status set to ${nextStatus ? 'ACTIVE' : 'SUSPENDED'}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filtered = vendors.filter(v => {
    const s = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(s) ||
      (v.phone && v.phone.includes(s)) ||
      (v.ownerName && v.ownerName.toLowerCase().includes(s))
    );
  });

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider bg-blue-100 text-[#0055ff] px-2.5 py-0.5 rounded-full">
              👑 Super Admin Platform Console
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2 mt-1">
            <Security className="text-[#0055ff]" />
            Vendor Credentials & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Super Admin master authority to generate partner login credentials (Mobile/Email + Security PIN) and assign granular module permissions to each store.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            onClick={fetchVendors}
            startIcon={<Refresh />}
            className="border-gray-300 text-gray-700 capitalize rounded-xl text-xs py-2 px-3 bg-white"
          >
            Refresh List
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/add-restaurant')}
            sx={{ backgroundColor: '#0055ff', '&:hover': { backgroundColor: '#0047d4' } }}
            className="capitalize rounded-xl text-xs py-2 px-4 shadow-sm font-bold text-white"
          >
            + Register New Store Partner
          </Button>
        </div>
      </div>

      {/* Search & Info Banner */}
      <Paper className="p-4 rounded-2xl border border-gray-100 shadow-xs bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Vendors only get access to features granted by Super Admin below. Vendor Partner app authenticates via Mobile Number + Security PIN.</span>
        </div>

        <div className="w-full sm:w-72">
          <TextField
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search store, owner or phone..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="text-gray-400 text-sm" />
                </InputAdornment>
              ),
              className: 'rounded-xl text-xs bg-gray-50'
            }}
          />
        </div>
      </Paper>

      {/* Main Vendor Credentials Table */}
      <TableContainer component={Paper} className="shadow-xs rounded-2xl overflow-hidden border border-gray-100 bg-white">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <CircularProgress size={32} sx={{ color: '#0055ff' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Storefront className="text-gray-300 text-5xl mx-auto mb-2" />
            <p className="text-sm font-bold">No registered stores found.</p>
          </div>
        ) : (
          <Table sx={{ minWidth: 800 }}>
            <TableHead className="bg-gray-100/70">
              <TableRow>
                <TableCell className="font-bold text-xs">Dark Store & City</TableCell>
                <TableCell className="font-bold text-xs">Manager / Owner</TableCell>
                <TableCell className="font-bold text-xs">Login ID (Mobile)</TableCell>
                <TableCell className="font-bold text-xs">Security PIN</TableCell>
                <TableCell className="font-bold text-xs">Assigned Role</TableCell>
                <TableCell className="font-bold text-xs">Granted RBAC Permissions</TableCell>
                <TableCell className="font-bold text-xs">Status</TableCell>
                <TableCell className="font-bold text-xs text-right">Super Admin Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.map((v) => {
                const isPinVisible = Boolean(visiblePins[v._id]);

                return (
                  <TableRow key={v._id} hover>
                    
                    {/* Store Name & City */}
                    <TableCell>
                      <div className="font-bold text-xs text-gray-900 leading-snug">
                        {v.name}
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {v.city || 'Region Unassigned'}
                      </span>
                    </TableCell>

                    {/* Manager Name */}
                    <TableCell>
                      <div className="font-semibold text-xs text-gray-800">
                        {v.ownerName || 'Store Manager'}
                      </div>
                      {v.email && (
                        <div className="text-[10px] text-gray-400 truncate max-w-[130px]">
                          {v.email}
                        </div>
                      )}
                    </TableCell>

                    {/* Login Mobile Number */}
                    <TableCell>
                      <div className="flex items-center gap-1 font-mono text-xs font-bold text-blue-700">
                        <span>{v.phone || 'Not Set'}</span>
                        {v.phone && (
                          <Tooltip title="Copy Mobile">
                            <IconButton size="small" onClick={() => copyToClipboard(v.phone, 'Mobile Number')} className="text-gray-400 hover:text-blue-600 p-0.5">
                              <ContentCopy style={{ fontSize: 13 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>

                    {/* Security PIN */}
                    <TableCell>
                      <div className="flex items-center gap-1 font-mono font-black text-xs bg-gray-100 px-2 py-1 rounded-lg w-fit">
                        <span className="tracking-wider">
                          {isPinVisible ? v.pin : '••••'}
                        </span>
                        <IconButton size="small" onClick={() => togglePinVisibility(v._id)} className="text-gray-500 p-0.5">
                          {isPinVisible ? <VisibilityOff style={{ fontSize: 13 }} /> : <Visibility style={{ fontSize: 13 }} />}
                        </IconButton>
                        <Tooltip title="Copy PIN">
                          <IconButton size="small" onClick={() => copyToClipboard(v.pin, 'PIN')} className="text-gray-400 hover:text-blue-600 p-0.5">
                            <ContentCopy style={{ fontSize: 13 }} />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>

                    {/* Assigned Role */}
                    <TableCell>
                      <Chip
                        label={v.assignedRole || 'Store Manager'}
                        size="small"
                        className="bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200"
                      />
                    </TableCell>

                    {/* Granted RBAC Permissions */}
                    <TableCell>
                      <div className="flex items-center gap-1 flex-wrap max-w-xs">
                        {v.permissions?.map((p) => (
                          <span
                            key={p}
                            className="inline-block text-[9px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded"
                          >
                            ✓ {p}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    {/* Active Status Toggle */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Switch
                          size="small"
                          checked={v.isActive}
                          onChange={() => handleToggleActive(v)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#0055ff' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#0055ff' }
                          }}
                        />
                        <span className={`text-[10px] font-bold ${v.isActive ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {v.isActive ? 'Active' : 'Locked'}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Tooltip title="Copy Full Login Credential Slip for WhatsApp/Email">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => copyLoginSlip(v)}
                            className="text-[10px] capitalize font-bold rounded-lg py-1 px-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          >
                            📋 Copy Slip
                          </Button>
                        </Tooltip>

                        <Tooltip title="Edit Security PIN & Password">
                          <IconButton
                            size="small"
                            onClick={() => openEditCredModal(v)}
                            className="text-blue-600 hover:bg-blue-50 p-1"
                          >
                            <VpnKey style={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Configure Role & Module Permissions">
                          <IconButton
                            size="small"
                            onClick={() => openRbacModal(v)}
                            className="text-indigo-600 hover:bg-indigo-50 p-1"
                          >
                            <Security style={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Open Store Partner Portal View">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/vendor/portal/${v._id}`)}
                            className="text-emerald-600 hover:bg-emerald-50 p-1"
                          >
                            <OpenInNew style={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>

                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* DIALOG 1: Edit Security PIN & Credentials Modal */}
      <Dialog
        open={credDialogOpen}
        onClose={() => setCredDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ className: 'rounded-2xl p-2' }}
      >
        <DialogTitle className="font-black text-gray-900 pb-1">
          🔐 Manage Store Credentials
        </DialogTitle>
        <DialogContent className="space-y-4 pt-3">
          <div className="text-xs text-gray-500 mb-2">
            Store: <strong className="text-gray-900">{selectedVendor?.name}</strong>
          </div>

          <div className="space-y-3">
            <TextField
              label="Manager / Owner Name"
              size="small"
              fullWidth
              value={credForm.ownerName}
              onChange={(e) => setCredForm(p => ({ ...p, ownerName: e.target.value }))}
            />

            <TextField
              label="Login Mobile Number (Login ID)"
              size="small"
              fullWidth
              value={credForm.phone}
              onChange={(e) => setCredForm(p => ({ ...p, phone: e.target.value }))}
              helperText="Vendor logs in using this 10-digit mobile number"
            />

            <TextField
              label="Security PIN (4 Digits)"
              size="small"
              fullWidth
              type="text"
              value={credForm.pin}
              onChange={(e) => setCredForm(p => ({ ...p, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
              helperText="4-digit PIN for high-speed terminal login (e.g. 1234)"
            />

            <TextField
              label="New Web Password (Optional)"
              size="small"
              fullWidth
              type="password"
              value={credForm.password}
              onChange={(e) => setCredForm(p => ({ ...p, password: e.target.value }))}
              placeholder="Leave blank to keep existing"
            />
          </div>
        </DialogContent>
        <DialogActions className="p-4 pt-2">
          <Button onClick={() => setCredDialogOpen(false)} className="capitalize rounded-xl text-gray-600">
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={saving}
            onClick={handleSaveCredentials}
            sx={{ backgroundColor: '#0055ff', '&:hover': { backgroundColor: '#0047d4' } }}
            className="capitalize rounded-xl font-bold"
          >
            {saving ? 'Saving...' : 'Save Credentials'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG 2: Role-Based Access Control (RBAC) Modal */}
      <Dialog
        open={rbacDialogOpen}
        onClose={() => setRbacDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ className: 'rounded-2xl p-2' }}
      >
        <DialogTitle className="font-black text-gray-900 pb-1">
          🛡️ Assign Role & Granted Permissions
        </DialogTitle>
        <DialogContent className="space-y-4 pt-3">
          <div className="text-xs text-gray-500 mb-2">
            Configuring access for store: <strong className="text-gray-900">{selectedVendor?.name}</strong>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">
              Assigned Operational Role
            </label>
            <Select
              fullWidth
              size="small"
              value={credForm.assignedRole}
              onChange={(e) => setCredForm(p => ({ ...p, assignedRole: e.target.value }))}
              className="rounded-xl bg-gray-50 font-bold text-xs"
            >
              <MenuItem value="Full Store Manager">Full Store Manager (All Capabilities)</MenuItem>
              <MenuItem value="Inventory Manager">Inventory Manager (Stock & Catalog Only)</MenuItem>
              <MenuItem value="Order Dispatcher">Order Dispatcher (Live Packing & Handover Only)</MenuItem>
              <MenuItem value="Finance Viewer">Finance Viewer (Payouts & Reports Only)</MenuItem>
            </Select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">
              Granular Module Permissions
            </label>
            <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
              {PERMISSION_OPTIONS.map((opt) => {
                const isChecked = credForm.permissions?.includes(opt.id);
                return (
                  <div key={opt.id} className="flex items-start gap-2 py-1 border-b border-gray-100 last:border-b-0">
                    <Checkbox
                      checked={isChecked}
                      size="small"
                      onChange={() => {
                        setCredForm(p => {
                          const current = p.permissions || [];
                          const next = isChecked ? current.filter(x => x !== opt.id) : [...current, opt.id];
                          return { ...p, permissions: next };
                        });
                      }}
                      sx={{ p: 0.5, color: '#0055ff', '&.Mui-checked': { color: '#0055ff' } }}
                    />
                    <div>
                      <div className="text-xs font-bold text-gray-900">{opt.label}</div>
                      <div className="text-[10px] text-gray-500 leading-tight">{opt.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
        <DialogActions className="p-4 pt-2">
          <Button onClick={() => setRbacDialogOpen(false)} className="capitalize rounded-xl text-gray-600">
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={saving}
            onClick={handleSaveCredentials}
            sx={{ backgroundColor: '#0055ff', '&:hover': { backgroundColor: '#0047d4' } }}
            className="capitalize rounded-xl font-bold"
          >
            {saving ? 'Updating...' : 'Save RBAC Permissions'}
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}

