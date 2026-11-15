import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogContent,
  CircularProgress,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Box,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Divider,
  Grid
} from '@mui/material';
import {
  ReceiptLong,
  Print,
  Close,
  Search,
  CheckCircle,
  LocalShipping,
  Store,
  Palette,
  Save,
  Business,
  Settings,
  HelpOutline,
  Storefront,
  Description,
  Refresh,
  Check
} from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../utils/utils';

export default function InvoiceManagement() {
  const [activeTab, setActiveTab] = useState(0);

  // Tab 1: Orders & Invoices State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Tab 2: Dynamic Format & Design Studio State
  const [invoiceConfig, setInvoiceConfig] = useState({
    brandName: 'TRICELYN',
    tagline: 'Groceries in minutes, from your own supermarket',
    legalEntityName: 'Tricelyn Hyperlocal Commerce Pvt. Ltd.',
    companyAddress: 'Scheme 54, Vijay Nagar, Indore, MP - 452010',
    gstin: '23AABCT1234F1Z8',
    fssai: '11422850000123',
    pan: 'AABCT1234F',
    supportEmail: 'care@tricelyn.com',
    supportPhone: '+91 731-4099880',
    supportHours: '24/7 Live Customer Support',
    invoicePrefix: 'TRC-INV',
    accentColor: '#0055ff',
    templateStyle: 'modern',
    showLogo: true,
    showTaxBreakup: true,
    showStoreDetails: true,
    showDeliveryPartner: true,
    customFooterNote: 'This is a computer-generated invoice and requires no physical signature. Thank you for shopping with Tricelyn Quick Commerce!',
    termsAndConditions: '1. All disputes subject to Indore jurisdiction.\n2. Fresh produce & essentials eligible for instant doorstep inspection & return.\n3. Goods sold under Tricelyn freshness & quality guarantee.',
    authorizedSignatoryLabel: 'Authorized Signatory for Tricelyn Commerce',
    signatureImageUrl: ''
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // Tab 3: Vendor / Partner Store Custom Details
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [vendorInvoiceForm, setVendorInvoiceForm] = useState({
    customStoreName: '',
    tradeName: '',
    billingAddress: '',
    gstin: '',
    fssai: '',
    pan: '',
    contactPhone: '',
    authorizedSignatory: '',
    customStoreNote: ''
  });
  const [savingVendor, setSavingVendor] = useState(false);

  // Fetch initial orders and invoice settings
  useEffect(() => {
    fetchOrders();
    fetchInvoiceSettings();
    fetchStoresList();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const headers = getHeaders();
      let res;
      try {
        res = await axios.get(`${API_BASE_URL}/api/orders/admin/all?limit=50`, { headers, withCredentials: true });
      } catch (_) {
        res = await axios.get(`${API_BASE_URL}/api/admin/orders?limit=50`, { headers, withCredentials: true });
      }
      const rawList = res.data?.orders || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setOrders(Array.isArray(rawList) ? rawList : []);
    } catch (err) {
      console.error('Failed to load invoice orders:', err.message);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchInvoiceSettings = async () => {
    try {
      const headers = getHeaders();
      let res;
      try {
        res = await axios.get(`${API_BASE_URL}/api/admin/settings/invoice`, { headers, withCredentials: true });
      } catch (_) {
        res = await axios.get(`${API_BASE_URL}/api/settings/invoice`, { headers, withCredentials: true });
      }
      if (res?.data?.invoiceConfig) {
        setInvoiceConfig(prev => ({ ...prev, ...res.data.invoiceConfig }));
      }
    } catch (err) {
      console.error('Failed to load invoice settings:', err.message);
    }
  };

  const fetchStoresList = async () => {
    setLoadingStores(true);
    try {
      const headers = getHeaders();
      let res;
      try {
        res = await axios.get(`${API_BASE_URL}/api/restaurant/admin/all-invoice-settings`, { headers, withCredentials: true });
      } catch (_) {
        res = await axios.get(`${API_BASE_URL}/api/restaurant/admin/list`, { headers, withCredentials: true });
      }
      const storeList = res.data?.stores || res.data?.restaurants || (Array.isArray(res.data) ? res.data : []);
      setStores(storeList);
      if (storeList.length > 0 && !selectedStoreId) {
        const first = storeList[0];
        setSelectedStoreId(first._id);
        loadStoreDetails(first);
      }
    } catch (err) {
      console.error('Failed to load stores:', err.message);
    } finally {
      setLoadingStores(false);
    }
  };

  const loadStoreDetails = (store) => {
    if (!store) return;
    const inv = store.invoiceDetails || {};
    const storeName = typeof store.name === 'object' ? (store.name.en || Object.values(store.name)[0] || 'Store') : (store.name || 'Store');
    setVendorInvoiceForm({
      customStoreName: inv.customStoreName || storeName,
      tradeName: inv.tradeName || storeName,
      billingAddress: inv.billingAddress || store.address || '',
      gstin: inv.gstin || store.documents?.gst?.number || store.gstin || '',
      fssai: inv.fssai || store.documents?.license?.number || store.fssai || '',
      pan: inv.pan || store.documents?.pan?.number || '',
      contactPhone: inv.contactPhone || store.phone || '',
      authorizedSignatory: inv.authorizedSignatory || 'Authorized Store Signatory',
      customStoreNote: inv.customStoreNote || 'Fresh dispatch checked & verified.'
    });
  };

  const handleStoreChange = (e) => {
    const storeId = e.target.value;
    setSelectedStoreId(storeId);
    const store = stores.find(s => s._id === storeId);
    if (store) {
      loadStoreDetails(store);
    }
  };

  const openInvoice = async (orderId) => {
    setSelectedInvoice(null);
    setInvoiceLoading(true);
    setModalOpen(true);
    try {
      const headers = getHeaders();
      const res = await axios.get(`${API_BASE_URL}/api/grocery/orders/${orderId}/invoice`, { headers, withCredentials: true });
      if (res.data?.invoice) {
        setSelectedInvoice(res.data.invoice);
      } else {
        toast.error(res.data?.message || 'Invoice data not available');
        setModalOpen(false);
      }
    } catch (err) {
      console.error('Invoice error:', err);
      toast.error(err.response?.data?.message || 'Unable to load tax invoice');
      setModalOpen(false);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleSaveInvoiceConfig = async () => {
    setSavingConfig(true);
    try {
      const headers = getHeaders();
      await axios.put(`${API_BASE_URL}/api/admin/settings/invoice`, { invoiceConfig }, { headers, withCredentials: true });
      toast.success('Dynamic invoice format & styling saved successfully!');
    } catch (err) {
      console.error('Failed to save invoice config:', err);
      toast.error(err.response?.data?.message || 'Failed to save invoice settings');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSaveVendorInvoice = async () => {
    if (!selectedStoreId) {
      toast.error('Please select a store to customize');
      return;
    }
    setSavingVendor(true);
    try {
      const headers = getHeaders();
      await axios.put(`${API_BASE_URL}/api/restaurant/admin/${selectedStoreId}/invoice-settings`, {
        invoiceDetails: vendorInvoiceForm
      }, { headers, withCredentials: true });
      toast.success('Vendor store custom invoice details saved!');
      // Update local store state
      setStores(prev => prev.map(s => s._id === selectedStoreId ? { ...s, invoiceDetails: vendorInvoiceForm } : s));
    } catch (err) {
      console.error('Failed to save vendor invoice:', err);
      toast.error(err.response?.data?.message || 'Failed to save vendor invoice details');
    } finally {
      setSavingVendor(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredOrders = orders.filter(o => {
    const s = search.toLowerCase();
    const id = String(o._id || o.id || '').toLowerCase();
    const orderNum = String(o.orderNumber || '').toLowerCase();
    const name = String(o.customerName || o.user?.name || '').toLowerCase();
    return id.includes(s) || orderNum.includes(s) || name.includes(s);
  });

  const selectedStoreObj = stores.find(s => s._id === selectedStoreId);

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen space-y-6">

      {/* Header & Tabs Navigation */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider bg-blue-100 text-[#0055ff] px-2.5 py-0.5 rounded-full">
                👑 Super Admin Central Invoicing
              </span>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Live 100% Dynamic DB
              </span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <ReceiptLong className="text-[#0055ff]" />
              GST Tax Invoicing & Format Customizer
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage order tax invoices, dynamically customize platform branding & tagline, and configure partner store dispatch details.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                fetchOrders();
                fetchInvoiceSettings();
                fetchStoresList();
                toast.success('Invoicing data refreshed');
              }}
              startIcon={<Refresh />}
              className="rounded-xl capitalize text-xs font-bold text-gray-700 border-gray-300"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="border-t border-gray-100 pt-3">
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                minHeight: 44,
                borderRadius: '12px',
                mr: 1
              }
            }}
          >
            <Tab icon={<ReceiptLong sx={{ fontSize: 18 }} />} iconPosition="start" label={`Order Invoices (${orders.length})`} />
            <Tab icon={<Palette sx={{ fontSize: 18 }} />} iconPosition="start" label="Invoice Design & Format Customizer" />
            <Tab icon={<Storefront sx={{ fontSize: 18 }} />} iconPosition="start" label={`Vendor Store Custom Invoicing (${stores.length})`} />
          </Tabs>
        </div>
      </div>

      {/* ================= TAB 1: ORDER INVOICES ================= */}
      {activeTab === 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Customer Orders & GST Receipts</h2>
              <p className="text-xs text-gray-500">Every placed order has an auto-generated GST Tax invoice linked directly to live store fulfillment.</p>
            </div>

            <div className="w-full sm:w-72">
              <TextField
                size="small"
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Order ID, Number, Customer..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search className="text-gray-400 text-sm" />
                    </InputAdornment>
                  ),
                  className: 'rounded-xl text-xs bg-white'
                }}
              />
            </div>
          </div>

          <TableContainer component={Paper} className="shadow-xs rounded-2xl overflow-hidden border border-gray-100 bg-white">
            {loadingOrders ? (
              <div className="p-12 text-center text-gray-500">
                <CircularProgress size={32} sx={{ color: '#0055ff' }} />
                <p className="text-xs font-bold mt-2">Loading customer orders...</p>
              </div>
            ) : (
              <Table sx={{ minWidth: 650 }}>
                <TableHead className="bg-gray-100/70">
                  <TableRow>
                    <TableCell className="font-bold text-xs">Order ID & Date</TableCell>
                    <TableCell className="font-bold text-xs">Customer</TableCell>
                    <TableCell className="font-bold text-xs">Fulfillment Dark Store</TableCell>
                    <TableCell className="font-bold text-xs">Payment Method</TableCell>
                    <TableCell className="font-bold text-xs">Bill Amount</TableCell>
                    <TableCell className="font-bold text-xs">Status</TableCell>
                    <TableCell className="font-bold text-xs text-right">Tax Invoice</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" className="py-10 text-xs text-gray-500 font-semibold">
                        No customer orders found matching your search. Orders placed on web or app will appear here for GST tax invoicing.
                      </TableCell>
                    </TableRow>
                  ) : filteredOrders.map((ord) => {
                    const id = String(ord._id || ord.id || '');
                    const date = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today';
                    const custName = ord.customerName || ord.user?.name || ord.deliveryAddress?.name || 'Customer';
                    const custAddr = ord.deliveryAddress?.addressLine || ord.deliveryAddress?.fullAddress || ord.address || 'Address unavailable';
                    const rawStore = ord.storeName || ord.restaurantName || ord.restaurant?.name;
                    const storeDisplay = typeof rawStore === 'object' ? (rawStore?.en || Object.values(rawStore || {})[0] || 'Partner Store') : (rawStore || 'Partner Store');
                    const total = ord.totalAmount ?? ord.total ?? 0;
                    const statusLabel = ord.orderStatus || ord.status || 'Placed';

                    return (
                      <TableRow key={id} hover>
                        <TableCell>
                          <div className="font-mono font-bold text-xs text-blue-700">
                            {ord.orderNumber || `#${id.slice(-8).toUpperCase()}`}
                          </div>
                          <div className="text-[10px] text-gray-400">{date}</div>
                        </TableCell>

                        <TableCell>
                          <div className="font-bold text-xs text-gray-900">{custName}</div>
                          <div className="text-[10px] text-gray-500 truncate max-w-xs">{custAddr}</div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1 text-xs text-gray-700 font-medium">
                            <Store className="text-gray-400 text-xs" />
                            <span>{storeDisplay}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={(ord.paymentMethod || 'Online').toUpperCase()}
                            size="small"
                            className="bg-gray-100 text-gray-700 font-bold text-[10px]"
                          />
                        </TableCell>

                        <TableCell>
                          <div className="font-black text-sm text-gray-900">
                            ₹{total}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Chip
                            icon={<CheckCircle style={{ fontSize: 12 }} />}
                            label={statusLabel}
                            size="small"
                            className="bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200 capitalize"
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => openInvoice(id)}
                            startIcon={<Print />}
                            sx={{ backgroundColor: '#0055ff', '&:hover': { backgroundColor: '#0047d4' } }}
                            className="capitalize rounded-xl text-xs py-1 px-3 shadow-2xs font-bold"
                          >
                            Print Tax Invoice
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </div>
      )}

      {/* ================= TAB 2: INVOICE DESIGN & FORMAT STUDIO ================= */}
      {activeTab === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form: Editable Configurator */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <Palette className="text-[#0055ff]" />
                  Dynamic Invoice Template & Legal Details
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Changes made here update the invoice across Web, Mobile App, and Admin printouts immediately.
                </p>
              </div>

              <Button
                variant="contained"
                onClick={handleSaveInvoiceConfig}
                disabled={savingConfig}
                startIcon={savingConfig ? <CircularProgress size={16} color="inherit" /> : <Save />}
                sx={{ backgroundColor: '#0055ff', '&:hover': { backgroundColor: '#0047d4' } }}
                className="capitalize rounded-xl text-xs font-bold py-1.5 px-4 shadow-sm"
              >
                {savingConfig ? 'Saving...' : 'Save Design & Settings'}
              </Button>
            </div>

            {/* Brand & Tagline */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">1. Brand Identity & Header Tagline</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="Platform Brand Name"
                  size="small"
                  fullWidth
                  value={invoiceConfig.brandName}
                  onChange={(e) => setInvoiceConfig({ ...invoiceConfig, brandName: e.target.value })}
                  helperText="Displayed in large bold title"
                />
                <TextField
                  label="Header Tagline"
                  size="small"
                  fullWidth
                  value={invoiceConfig.tagline}
                  onChange={(e) => setInvoiceConfig({ ...invoiceConfig, tagline: e.target.value })}
                  helperText="Company tagline printed beneath logo"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="Legal Entity Company Name"
                  size="small"
                  fullWidth
                  value={invoiceConfig.legalEntityName}
                  onChange={(e) => setInvoiceConfig({ ...invoiceConfig, legalEntityName: e.target.value })}
                />
                <TextField
                  label="Invoice Number Prefix"
                  size="small"
                  fullWidth
                  value={invoiceConfig.invoicePrefix}
                  onChange={(e) => setInvoiceConfig({ ...invoiceConfig, invoicePrefix: e.target.value })}
                  helperText="e.g. TRC-INV generates TRC-INV-2026-XXXXXX"
                />
              </div>

              <TextField
                label="Head Office / Registered Address"
                size="small"
                fullWidth
                multiline
                rows={2}
                value={invoiceConfig.companyAddress}
                onChange={(e) => setInvoiceConfig({ ...invoiceConfig, companyAddress: e.target.value })}
              />
            </div>

            {/* Tax & Legal Compliance Numbers */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">2. Tax & Legal Compliance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <TextField
                  label="Company GSTIN"
                  size="small"
                  fullWidth
                  value={invoiceConfig.gstin}
                  onChange={(e) => setInvoiceConfig({ ...invoiceConfig, gstin: e.target.value })}
                />
                <TextField
                  label="FSSAI License No."
                  size="small"
                  fullWidth
                  value={invoiceConfig.fssai}
                  onChange={(e) => setInvoiceConfig({ ...invoiceConfig, fssai: e.target.value })}
                />
                <TextField
                  label="PAN Number"
                  size="small"
                  fullWidth
                  value={invoiceConfig.pan}
                  onChange={(e) => setInvoiceConfig({ ...invoiceConfig, pan: e.target.value })}
                />
              </div>
            </div>

            {/* Contact & Support */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">3. Customer Support & Helpline</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <TextField
                  label="Support Email"
                  size="small"
                  fullWidth
                  value={invoiceConfig.supportEmail}
                  onChange={(e) => setInvoiceConfig({ ...invoiceConfig, supportEmail: e.target.value })}
                />
                <TextField
                  label="Helpline Phone"
                  size="small"
                  fullWidth
                  value={invoiceConfig.supportPhone}
                  onChange={(e) => setInvoiceConfig({ ...invoiceConfig, supportPhone: e.target.value })}
                />
                <TextField
                  label="Support Working Hours"
                  size="small"
                  fullWidth
                  value={invoiceConfig.supportHours}
                  onChange={(e) => setInvoiceConfig({ ...invoiceConfig, supportHours: e.target.value })}
                />
              </div>
            </div>

            {/* Visual Styling & Theme Color */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">4. Styling, Accent Colors & Style</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormControl size="small" fullWidth>
                  <InputLabel>Template Style</InputLabel>
                  <Select
                    value={invoiceConfig.templateStyle || 'modern'}
                    label="Template Style"
                    onChange={(e) => setInvoiceConfig({ ...invoiceConfig, templateStyle: e.target.value })}
                  >
                    <MenuItem value="modern">Modern Quick-Commerce (Header Banner)</MenuItem>
                    <MenuItem value="classic">Classic Corporate (Double Border)</MenuItem>
                    <MenuItem value="minimal">Minimalist Clean (Compact)</MenuItem>
                  </Select>
                </FormControl>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Invoice Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={invoiceConfig.accentColor || '#0055ff'}
                      onChange={(e) => setInvoiceConfig({ ...invoiceConfig, accentColor: e.target.value })}
                      className="w-10 h-9 p-0.5 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5">
                      {['#0055ff', '#059669', '#dc2626', '#7c3aed', '#111827'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setInvoiceConfig({ ...invoiceConfig, accentColor: c })}
                          style={{ backgroundColor: c }}
                          className={`w-6 h-6 rounded-full border-2 transition ${invoiceConfig.accentColor === c ? 'border-black scale-110' : 'border-white'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <FormControlLabel
                  control={
                    <Switch
                      checked={invoiceConfig.showTaxBreakup !== false}
                      onChange={(e) => setInvoiceConfig({ ...invoiceConfig, showTaxBreakup: e.target.checked })}
                      size="small"
                      color="primary"
                    />
                  }
                  label={<span className="text-xs font-semibold text-gray-700">Show CGST/SGST</span>}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={invoiceConfig.showStoreDetails !== false}
                      onChange={(e) => setInvoiceConfig({ ...invoiceConfig, showStoreDetails: e.target.checked })}
                      size="small"
                      color="primary"
                    />
                  }
                  label={<span className="text-xs font-semibold text-gray-700">Show Vendor Box</span>}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={invoiceConfig.showLogo !== false}
                      onChange={(e) => setInvoiceConfig({ ...invoiceConfig, showLogo: e.target.checked })}
                      size="small"
                      color="primary"
                    />
                  }
                  label={<span className="text-xs font-semibold text-gray-700">Show Platform Badge</span>}
                />
              </div>
            </div>

            {/* Terms & Footer Note */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">5. Legal Disclaimers, Terms & Signatory</h3>
              <TextField
                label="Authorized Signatory Label"
                size="small"
                fullWidth
                value={invoiceConfig.authorizedSignatoryLabel}
                onChange={(e) => setInvoiceConfig({ ...invoiceConfig, authorizedSignatoryLabel: e.target.value })}
              />

              <TextField
                label="Custom Invoice Footer Note"
                size="small"
                fullWidth
                multiline
                rows={2}
                value={invoiceConfig.customFooterNote}
                onChange={(e) => setInvoiceConfig({ ...invoiceConfig, customFooterNote: e.target.value })}
              />

              <TextField
                label="Terms & Conditions (Line by Line)"
                size="small"
                fullWidth
                multiline
                rows={3}
                value={invoiceConfig.termsAndConditions}
                onChange={(e) => setInvoiceConfig({ ...invoiceConfig, termsAndConditions: e.target.value })}
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="contained"
                onClick={handleSaveInvoiceConfig}
                disabled={savingConfig}
                startIcon={savingConfig ? <CircularProgress size={16} color="inherit" /> : <Save />}
                sx={{ backgroundColor: '#0055ff', '&:hover': { backgroundColor: '#0047d4' } }}
                className="capitalize rounded-xl text-xs font-bold py-2 px-6 shadow-sm"
              >
                {savingConfig ? 'Saving Settings...' : 'Save Invoice Design & Settings'}
              </Button>
            </div>
          </div>

          {/* Right Column: Real-Time Live Preview */}
          <div className="lg:col-span-5 sticky top-6">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-gray-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Description className="text-blue-400 text-sm" />
                  <span className="text-xs font-bold">Interactive Live Invoice Preview</span>
                </div>
                <span className="text-[10px] font-bold bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded">
                  {invoiceConfig.templateStyle?.toUpperCase() || 'MODERN'}
                </span>
              </div>

              {/* Printable-style Preview Content */}
              <div className="p-6 text-xs text-gray-800 space-y-4 bg-white max-h-[80vh] overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <h3 className="text-xl font-black tracking-tight" style={{ color: invoiceConfig.accentColor }}>
                      {invoiceConfig.brandName}
                    </h3>
                    <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">
                      {invoiceConfig.tagline}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1 max-w-xs leading-tight">
                      {invoiceConfig.legalEntityName}<br />
                      {invoiceConfig.companyAddress}<br />
                      GSTIN: {invoiceConfig.gstin} · FSSAI: {invoiceConfig.fssai}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="bg-gray-100 text-gray-700 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                      TAX INVOICE
                    </span>
                    <p className="text-[10px] font-bold text-gray-900 mt-1 font-mono">
                      {invoiceConfig.invoicePrefix}-2026-984210
                    </p>
                    <p className="text-[9px] text-gray-500">Order: #ORD-7819</p>
                    <p className="text-[9px] text-gray-500">Date: Today, 14:30</p>
                  </div>
                </div>

                {/* Seller & Customer */}
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl text-[10px] border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-400 uppercase">Sold & Dispatched By:</p>
                    <p className="font-bold text-gray-900 mt-0.5">Sodhi's Supermarket Express</p>
                    <p className="text-gray-500">Shop 14, Scheme 54, Indore</p>
                    <p className="font-mono text-gray-500 mt-0.5">GSTIN: {invoiceConfig.gstin}</p>
                  </div>

                  <div className="border-l border-gray-200/80 pl-2">
                    <p className="font-bold text-gray-400 uppercase">Delivered To:</p>
                    <p className="font-bold text-gray-900 mt-0.5">Rahul Verma</p>
                    <p className="text-gray-500">Flat 402, Royal Palms, Indore</p>
                    <p className="text-emerald-700 font-bold mt-0.5">PAID (UPI)</p>
                  </div>
                </div>

                {/* Mock Item Table */}
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="border-b text-gray-400 font-bold uppercase">
                      <th className="py-1">#</th>
                      <th className="py-1">Item</th>
                      <th className="py-1 text-center">Qty</th>
                      <th className="py-1 text-right">Rate</th>
                      <th className="py-1 text-right">Taxable</th>
                      <th className="py-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-1.5 text-gray-400">1</td>
                      <td className="py-1.5 font-bold">Amul Taaza Milk 500ml</td>
                      <td className="py-1.5 text-center">2</td>
                      <td className="py-1.5 text-right">₹27.00</td>
                      <td className="py-1.5 text-right">₹51.42</td>
                      <td className="py-1.5 text-right font-bold">₹54.00</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-gray-400">2</td>
                      <td className="py-1.5 font-bold">Fortune Sunlite Oil 1L</td>
                      <td className="py-1.5 text-center">1</td>
                      <td className="py-1.5 text-right">₹145.00</td>
                      <td className="py-1.5 text-right">₹138.09</td>
                      <td className="py-1.5 text-right font-bold">₹145.00</td>
                    </tr>
                  </tbody>
                </table>

                {/* Summary */}
                <div className="border-t pt-2 flex justify-end">
                  <div className="w-48 space-y-1 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Items Total:</span>
                      <strong className="text-gray-900">₹199.00</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Delivery:</span>
                      <strong className="text-emerald-600">FREE</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Platform Handling:</span>
                      <strong className="text-gray-900">₹2.00</strong>
                    </div>
                    <div className="flex justify-between border-t pt-1 font-black text-xs">
                      <span>Grand Total:</span>
                      <span style={{ color: invoiceConfig.accentColor }}>₹201.00</span>
                    </div>
                    {invoiceConfig.showTaxBreakup && (
                      <p className="text-[9px] text-gray-400 text-right">Includes ₹9.57 CGST+SGST (5%)</p>
                    )}
                  </div>
                </div>

                {/* Terms */}
                {invoiceConfig.termsAndConditions && (
                  <div className="border-t pt-2 text-[8px] text-gray-400 leading-tight whitespace-pre-line">
                    <span className="font-bold text-gray-600">Terms: </span>
                    {invoiceConfig.termsAndConditions}
                  </div>
                )}

                {/* Footer Note */}
                <div className="border-t pt-2 text-center text-[9px] text-gray-400">
                  <p>{invoiceConfig.customFooterNote}</p>
                  <p className="font-semibold text-gray-600 mt-0.5">
                    {invoiceConfig.supportEmail} · {invoiceConfig.supportPhone}
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: VENDOR / STORE CUSTOM INVOICING ================= */}
      {activeTab === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form: Vendor Store Selection & Setup */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <Storefront className="text-[#0055ff]" />
                  Partner Store / Vendor Custom Invoicing
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Partner stores can configure custom billing business names, dispatch addresses, GSTIN, and store signatory.
                </p>
              </div>

              <Button
                variant="contained"
                onClick={handleSaveVendorInvoice}
                disabled={savingVendor || !selectedStoreId}
                startIcon={savingVendor ? <CircularProgress size={16} color="inherit" /> : <Save />}
                sx={{ backgroundColor: '#0055ff', '&:hover': { backgroundColor: '#0047d4' } }}
                className="capitalize rounded-xl text-xs font-bold py-1.5 px-4 shadow-sm"
              >
                {savingVendor ? 'Saving...' : 'Save Store Details'}
              </Button>
            </div>

            {/* Store Picker */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-700 block uppercase tracking-wide">
                Select Partner Store to Customize
              </label>
              {loadingStores ? (
                <CircularProgress size={24} sx={{ color: '#0055ff' }} />
              ) : (
                <FormControl fullWidth size="small">
                  <InputLabel>Partner Store</InputLabel>
                  <Select
                    value={selectedStoreId}
                    label="Partner Store"
                    onChange={handleStoreChange}
                  >
                    {stores.map((st) => {
                      const name = typeof st.name === 'object' ? (st.name.en || Object.values(st.name)[0] || 'Store') : (st.name || 'Store');
                      return (
                        <MenuItem key={st._id} value={st._id}>
                          {name} — {st.city || 'Indore'} {st.invoiceDetails?.gstin ? '(GST Configured)' : ''}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              )}
            </div>

            {/* Selected Store Invoicing Form */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                Store Dispatch Entity Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="Custom Store Display Name"
                  size="small"
                  fullWidth
                  value={vendorInvoiceForm.customStoreName}
                  onChange={(e) => setVendorInvoiceForm({ ...vendorInvoiceForm, customStoreName: e.target.value })}
                  helperText="Name printed on customer dispatch invoice"
                />
                <TextField
                  label="Registered Vendor Legal / Trade Name"
                  size="small"
                  fullWidth
                  value={vendorInvoiceForm.tradeName}
                  onChange={(e) => setVendorInvoiceForm({ ...vendorInvoiceForm, tradeName: e.target.value })}
                  helperText="e.g. Sodhi Retail Enterprises LLP"
                />
              </div>

              <TextField
                label="Store Billing & Dispatch Address"
                size="small"
                fullWidth
                multiline
                rows={2}
                value={vendorInvoiceForm.billingAddress}
                onChange={(e) => setVendorInvoiceForm({ ...vendorInvoiceForm, billingAddress: e.target.value })}
                helperText="Physical shop or fulfillment dark store location"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <TextField
                  label="Store GSTIN"
                  size="small"
                  fullWidth
                  value={vendorInvoiceForm.gstin}
                  onChange={(e) => setVendorInvoiceForm({ ...vendorInvoiceForm, gstin: e.target.value })}
                  placeholder="23AAAAA0000A1Z5"
                />
                <TextField
                  label="Store FSSAI License"
                  size="small"
                  fullWidth
                  value={vendorInvoiceForm.fssai}
                  onChange={(e) => setVendorInvoiceForm({ ...vendorInvoiceForm, fssai: e.target.value })}
                  placeholder="11422850000000"
                />
                <TextField
                  label="Store PAN"
                  size="small"
                  fullWidth
                  value={vendorInvoiceForm.pan}
                  onChange={(e) => setVendorInvoiceForm({ ...vendorInvoiceForm, pan: e.target.value })}
                  placeholder="AAAAA0000A"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="Store Contact / Helpline Phone"
                  size="small"
                  fullWidth
                  value={vendorInvoiceForm.contactPhone}
                  onChange={(e) => setVendorInvoiceForm({ ...vendorInvoiceForm, contactPhone: e.target.value })}
                />
                <TextField
                  label="Authorized Store Signatory"
                  size="small"
                  fullWidth
                  value={vendorInvoiceForm.authorizedSignatory}
                  onChange={(e) => setVendorInvoiceForm({ ...vendorInvoiceForm, authorizedSignatory: e.target.value })}
                  helperText="Name or designation printed on receipt"
                />
              </div>

              <TextField
                label="Custom Store Packing / Quality Note"
                size="small"
                fullWidth
                multiline
                rows={2}
                value={vendorInvoiceForm.customStoreNote}
                onChange={(e) => setVendorInvoiceForm({ ...vendorInvoiceForm, customStoreNote: e.target.value })}
                placeholder="Goods packed and quality verified before dispatch."
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="contained"
                onClick={handleSaveVendorInvoice}
                disabled={savingVendor || !selectedStoreId}
                startIcon={savingVendor ? <CircularProgress size={16} color="inherit" /> : <Save />}
                sx={{ backgroundColor: '#0055ff', '&:hover': { backgroundColor: '#0047d4' } }}
                className="capitalize rounded-xl text-xs font-bold py-2 px-6 shadow-sm"
              >
                {savingVendor ? 'Saving Store Details...' : 'Save Store Custom Invoicing Details'}
              </Button>
            </div>
          </div>

          {/* Right Column: Vendor Dispatch Invoice Preview */}
          <div className="lg:col-span-5 sticky top-6">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-gray-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="text-emerald-400 text-sm" />
                  <span className="text-xs font-bold">Store Dispatch Invoice Preview</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded">
                  STORE LEVEL
                </span>
              </div>

              <div className="p-6 text-xs text-gray-800 space-y-4 bg-white">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    Dispatched & Sold By:
                  </p>
                  <p className="text-sm font-black text-gray-900 mt-0.5">
                    {vendorInvoiceForm.customStoreName || 'Partner Store Name'}
                  </p>
                  {vendorInvoiceForm.tradeName && (
                    <p className="text-[10px] text-gray-600 font-semibold">({vendorInvoiceForm.tradeName})</p>
                  )}
                  <p className="text-[11px] text-gray-600 mt-1 leading-tight">
                    {vendorInvoiceForm.billingAddress || 'Store physical address will be shown here'}
                  </p>
                  <div className="mt-2 pt-2 border-t border-emerald-200/60 font-mono text-[10px] text-gray-700 space-y-0.5">
                    <p><strong>GSTIN:</strong> {vendorInvoiceForm.gstin || 'Unregistered'}</p>
                    <p><strong>FSSAI:</strong> {vendorInvoiceForm.fssai || 'N/A'}</p>
                    <p><strong>Contact:</strong> {vendorInvoiceForm.contactPhone || '+91 00000 00000'}</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[10px] space-y-1">
                  <p className="font-bold text-gray-700">Quality & Safety Guarantee:</p>
                  <p className="text-gray-500">{vendorInvoiceForm.customStoreNote || 'Fresh dispatch checked & verified.'}</p>
                  <p className="pt-2 font-bold text-gray-900">{vendorInvoiceForm.authorizedSignatory || 'Authorized Store Signatory'}</p>
                  <p className="text-[9px] text-gray-400">Dispatch Manager / Supervisor</p>
                </div>

                <div className="text-[10px] text-gray-400 text-center border-t pt-3">
                  This custom store billing section is automatically embedded in all order receipts dispatched by this partner dark store.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAX INVOICE PRINTABLE MODAL ================= */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ className: 'rounded-2xl p-0 overflow-hidden' }}
      >
        <div className="p-4 bg-gray-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <ReceiptLong className="text-blue-400" />
            <span className="font-bold text-sm">Official Tax Invoice Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="contained"
              onClick={handlePrint}
              startIcon={<Print />}
              sx={{ backgroundColor: '#0055ff' }}
              className="capitalize text-xs rounded-xl font-bold"
            >
              Print / Save PDF
            </Button>
            <IconButton onClick={() => setModalOpen(false)} size="small" className="text-white hover:bg-white/10">
              <Close />
            </IconButton>
          </div>
        </div>

        <DialogContent className="p-6 sm:p-8 bg-white print:p-0">
          {invoiceLoading || !selectedInvoice ? (
            <div className="p-12 text-center text-gray-500">
              <CircularProgress size={32} sx={{ color: '#0055ff' }} />
              <p className="text-xs font-bold mt-2">Generating Tax Invoice...</p>
            </div>
          ) : (
            <div className="space-y-6 text-gray-900 print:text-black" id="printable-invoice">

              {/* Invoice Header */}
              <div className="flex items-start justify-between border-b pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-2xl font-black italic tracking-tighter"
                      style={{ color: selectedInvoice.invoiceConfig?.accentColor || '#0055ff' }}
                    >
                      {selectedInvoice.invoiceConfig?.brandName || 'TRICELYN'}
                    </span>
                    <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">TAX INVOICE</span>
                  </div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">
                    {selectedInvoice.invoiceConfig?.tagline || 'Groceries in minutes, from your own supermarket'}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {selectedInvoice.invoiceConfig?.legalEntityName || 'Tricelyn Hyperlocal Commerce Pvt. Ltd.'}<br />
                    {selectedInvoice.invoiceConfig?.companyAddress || 'Scheme 54, Vijay Nagar, Indore, MP - 452010'}
                  </p>
                </div>

                <div className="text-right text-xs space-y-0.5 font-medium">
                  <div><span className="text-gray-500">Invoice No:</span> <strong className="font-mono">{selectedInvoice.invoiceNumber}</strong></div>
                  <div><span className="text-gray-500">Invoice Date:</span> <strong>{selectedInvoice.invoiceDate} {selectedInvoice.invoiceTime}</strong></div>
                  <div><span className="text-gray-500">Order ID:</span> <strong className="font-mono">#{selectedInvoice.orderId?.slice(-8).toUpperCase()}</strong></div>
                  <div><span className="text-gray-500">Payment:</span> <strong className="text-emerald-600 font-bold">{selectedInvoice.paymentStatus} ({selectedInvoice.paymentMethod})</strong></div>
                </div>
              </div>

              {/* Seller & Buyer Grid */}
              <div className="grid grid-cols-2 gap-6 text-xs border-b pb-6">
                <div className="space-y-1 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <div className="font-black text-gray-900 uppercase tracking-wide text-[10px]">Sold & Dispatched By:</div>
                  <div className="font-bold text-gray-900 text-sm">{selectedInvoice.seller.storeName}</div>
                  {selectedInvoice.seller.tradeName && selectedInvoice.seller.tradeName !== selectedInvoice.seller.storeName && (
                    <div className="text-[11px] text-gray-500 italic">({selectedInvoice.seller.tradeName})</div>
                  )}
                  <div className="text-gray-600 leading-tight">{selectedInvoice.seller.address}</div>
                  <div className="font-mono text-gray-800 pt-1">
                    <strong>GSTIN:</strong> {selectedInvoice.seller.gstin} | <strong>FSSAI:</strong> {selectedInvoice.seller.fssaiNumber}
                  </div>
                  {selectedInvoice.seller.helpline && (
                    <div className="text-gray-500 text-[10px]">Store Contact: {selectedInvoice.seller.helpline}</div>
                  )}
                </div>

                <div className="space-y-1 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <div className="font-black text-gray-900 uppercase tracking-wide text-[10px]">Billed & Delivered To:</div>
                  <div className="font-bold text-gray-900 text-sm">{selectedInvoice.customer.name}</div>
                  <div className="text-gray-600 leading-tight">{selectedInvoice.customer.deliveryAddress}</div>
                  <div className="text-gray-800 pt-1">
                    <strong>Phone:</strong> {selectedInvoice.customer.phone} | <strong>State:</strong> {selectedInvoice.customer.state}
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div>
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b bg-gray-100 text-[11px] font-bold text-gray-700">
                      <th className="py-2 px-2">#</th>
                      <th className="py-2 px-2">Item Description</th>
                      <th className="py-2 px-2">Unit</th>
                      <th className="py-2 px-2 text-center">Qty</th>
                      <th className="py-2 px-2 text-right">Rate</th>
                      <th className="py-2 px-2 text-right">Taxable</th>
                      <th className="py-2 px-2 text-right">CGST (2.5%)</th>
                      <th className="py-2 px-2 text-right">SGST (2.5%)</th>
                      <th className="py-2 px-2 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items?.map((it) => (
                      <tr key={it.srNo} className="border-b border-gray-100">
                        <td className="py-2 px-2 text-gray-500 font-mono">{it.srNo}</td>
                        <td className="py-2 px-2 font-bold text-gray-900">{it.name}</td>
                        <td className="py-2 px-2 text-gray-500">{it.unit}</td>
                        <td className="py-2 px-2 text-center font-bold">{it.quantity}</td>
                        <td className="py-2 px-2 text-right">₹{it.unitPrice}</td>
                        <td className="py-2 px-2 text-right">₹{it.taxableValue}</td>
                        <td className="py-2 px-2 text-right text-gray-600">₹{it.cgstAmount}</td>
                        <td className="py-2 px-2 text-right text-gray-600">₹{it.sgstAmount}</td>
                        <td className="py-2 px-2 text-right font-black">₹{it.totalAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Billing Summary Box */}
              <div className="flex justify-between items-start pt-2">
                <div className="text-[10px] text-gray-500 space-y-1 max-w-xs">
                  <p className="font-bold text-gray-700">Signatory Details:</p>
                  <p>{selectedInvoice.seller.authorizedSignatory || 'Authorized Store Signatory'}</p>
                  {selectedInvoice.seller.customStoreNote && (
                    <p className="text-gray-400 italic">"{selectedInvoice.seller.customStoreNote}"</p>
                  )}
                </div>

                <div className="w-full sm:w-72 space-y-1.5 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items Subtotal:</span>
                    <strong className="text-gray-900">₹{selectedInvoice.billingSummary.itemsSubtotal}</strong>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Handling / Packaging:</span>
                    <span>₹{selectedInvoice.billingSummary.packagingFee}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charge (10-15m):</span>
                    <span>{selectedInvoice.billingSummary.deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${selectedInvoice.billingSummary.deliveryFee}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Platform Fee:</span>
                    <span>₹{selectedInvoice.billingSummary.platformFee}</span>
                  </div>
                  {selectedInvoice.billingSummary.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Promo Discount:</span>
                      <span>-₹{selectedInvoice.billingSummary.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2 text-sm font-black text-gray-900">
                    <span>Grand Total:</span>
                    <span style={{ color: selectedInvoice.invoiceConfig?.accentColor || '#0055ff' }}>
                      ₹{selectedInvoice.billingSummary.grandTotal}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 text-right">
                    Includes ₹{(selectedInvoice.billingSummary.cgstTotal + selectedInvoice.billingSummary.sgstTotal).toFixed(2)} Total GST (CGST + SGST)
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              {selectedInvoice.invoiceConfig?.termsAndConditions && (
                <div className="border-t pt-3 text-[9px] text-gray-400 leading-relaxed whitespace-pre-line">
                  <strong className="text-gray-600 uppercase">Terms & Conditions: </strong>
                  {selectedInvoice.invoiceConfig.termsAndConditions}
                </div>
              )}

              {/* Footer Note */}
              <div className="border-t pt-3 text-[10px] text-gray-400 text-center leading-relaxed">
                {selectedInvoice.invoiceConfig?.customFooterNote || 'This is a computer-generated invoice and requires no physical signature.'}
                <div className="mt-0.5">
                  For customer support, write to <strong>{selectedInvoice.seller.supportEmail || 'care@tricelyn.com'}</strong> or call <strong>{selectedInvoice.seller.helpline || '+91 731-4099880'}</strong>.
                </div>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
