import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Typography,
  MenuItem,
  CircularProgress,
  Chip
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../../../utils/utils';

const PLATFORM_MODE_OPTIONS = [
  {
    value: 'grocery',
    title: 'Grocery Delivery Only (Core Priority)',
    badge: 'RECOMMENDED DEFAULT',
    desc: '100% Quick-Commerce Grocery mode across Website, Customer App, Vendor Partner App & Delivery App. Food delivery UI is completely hidden.',
    accent: '#059669',
    bg: 'bg-emerald-50 border-emerald-500 text-emerald-950'
  },
  {
    value: 'both',
    title: 'Grocery (Primary) + Food Delivery',
    badge: 'DUAL VERTICAL',
    desc: 'Grocery remains the core primary experience while also exposing Food Delivery & Restaurant discovery where supported.',
    accent: '#0B3EDB',
    bg: 'bg-blue-50 border-blue-500 text-blue-950'
  },
  {
    value: 'food',
    title: 'Food Delivery Only',
    badge: 'RESTAURANT MODE',
    desc: 'Focuses apps and website on Restaurant & Food Ordering workflows while disabling Grocery Store discovery.',
    accent: '#ea580c',
    bg: 'bg-orange-50 border-orange-500 text-orange-950'
  }
];

const SiteSetting = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [switchingMode, setSwitchingMode] = useState(false);
  const [settings, setSettings] = useState({
    platformMode: 'grocery',
    primaryVertical: 'grocery',
    enableFoodDelivery: false,
    enableGroceryDelivery: true,
    appName: 'Tricelyn Quick Grocery',
    metaTitle: 'Tricelyn - 10-Min Multi-Vendor Grocery Delivery',
    metaDescription: 'Tricelyn | Order fresh fruits, vegetables, dairy, staples & daily essentials from local partner stores',
    iosAppLink: 'https://apps.apple.com/in/app/servonekart-delivery/id12113974',
    androidAppLink: 'https://play.google.com/store/apps/details?id=com.servonekart.userapp',
    siteEmail: 'care@tricelyn.com',
    siteContact: '9847192735',
    menuColors: '#0B3EDB',
    highlightColors: '#10b981',
    adminCommission: '20',
    restaurantCommission: '80',
    globalGeofenceRadius: '5000',
    defaultUnit: 'KM',
    orderPrefix: 'GRO',
    primaryLanguage: 'English',
    secondaryLanguage: 'None',
    facebook: 'https://www.facebook.com/',
    instagram: 'https://www.instagram.com/',
    emailEnable: 'Yes',
    smsEnable: 'No',
    codEnable: 'Yes',
    onlinePaymentEnable: 'Yes',
    freeDeliveryEnable: 'Yes',
    isTaxInclusive: 'Yes'
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/settings`, {
        headers: getAuthHeaders()
      });
      if (res.data) {
        const mode = res.data.platformMode || 'grocery';
        setSettings((prev) => ({
          ...prev,
          ...res.data,
          platformMode: mode,
          enableFoodDelivery: mode === 'food' || mode === 'both',
          enableGroceryDelivery: mode === 'grocery' || mode === 'both',
          appName: res.data.appName || prev.appName,
          metaTitle: res.data.metaTitle || prev.metaTitle,
          metaDescription: res.data.metaDescription || prev.metaDescription,
          androidAppLink: res.data.androidAppLink || prev.androidAppLink,
          siteEmail: res.data.siteEmail || prev.siteEmail,
          menuColors: res.data.menuColors || prev.menuColors,
          highlightColors: res.data.highlightColors || prev.highlightColors
        }));
      }
    } catch (err) {
      console.warn("Using default Tricelyn master settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlatformModeSwitch = async (nextMode) => {
    setSwitchingMode(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/settings/platform-mode`,
        { platformMode: nextMode },
        { headers: getAuthHeaders(), withCredentials: true }
      );
      const confirmedMode = res.data?.platformMode || nextMode;
      setSettings((prev) => ({
        ...prev,
        platformMode: confirmedMode,
        primaryVertical: confirmedMode === 'food' ? 'food' : 'grocery',
        enableFoodDelivery: confirmedMode === 'food' || confirmedMode === 'both',
        enableGroceryDelivery: confirmedMode === 'grocery' || confirmedMode === 'both',
      }));
      window.dispatchEvent(new CustomEvent('platformModeChanged', { detail: { platformMode: confirmedMode } }));
      toast.success(`Platform vertical mode switched to ${confirmedMode.toUpperCase()} across all apps & web!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to switch platform vertical mode');
    } finally {
      setSwitchingMode(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/api/settings`, settings, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      if (res.data) {
        const mode = res.data.platformMode || settings.platformMode;
        window.dispatchEvent(new CustomEvent('platformModeChanged', { detail: { platformMode: mode } }));
        toast.success('Master settings updated successfully in Database!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update master settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <CircularProgress color="success" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans space-y-6">
      {/* Dynamic Platform Vertical Mode Switcher */}
      <div className="max-w-[1600px] mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Dynamic Platform Vertical Control</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Super Admin switch — updates Customer App, Partner Store App, Delivery Rider App &amp; Website live in real time.
            </p>
          </div>
          <Chip
            label={`ACTIVE MODE: ${String(settings.platformMode || 'grocery').toUpperCase()}`}
            color={settings.platformMode === 'grocery' ? 'success' : settings.platformMode === 'both' ? 'primary' : 'warning'}
            sx={{ fontWeight: 800, letterSpacing: '0.5px' }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLATFORM_MODE_OPTIONS.map((opt) => {
            const active = settings.platformMode === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={switchingMode}
                onClick={() => handlePlatformModeSwitch(opt.value)}
                className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  active
                    ? `${opt.bg} shadow-sm`
                    : 'bg-gray-50/70 border-gray-200 hover:border-gray-400 text-gray-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-white/90 border border-current/20">
                    {opt.badge}
                  </span>
                  {active && (
                    <span className="text-[11px] font-extrabold uppercase text-emerald-700">✓ LIVE</span>
                  )}
                </div>
                <div className="font-bold text-sm">{opt.title}</div>
                <p className="text-xs opacity-80 mt-1 leading-relaxed">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Master Platform Settings Form */}
      <div className="max-w-[1600px] mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Master Platform Settings</h2>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          <InputField label="App Name" name="appName" value={settings.appName} onChange={handleChange} />
          <InputField label="Meta Title" name="metaTitle" value={settings.metaTitle} onChange={handleChange} />

          <InputField label="Meta Description" name="metaDescription" value={settings.metaDescription} onChange={handleChange} />
          <InputField label="iOS App Link" name="iosAppLink" value={settings.iosAppLink} onChange={handleChange} />

          <InputField label="Android App Link" name="androidAppLink" value={settings.androidAppLink} onChange={handleChange} />
          <InputField label="Site Email" name="siteEmail" value={settings.siteEmail} onChange={handleChange} />

          <InputField label="Site Contact" name="siteContact" value={settings.siteContact} onChange={handleChange} />
          <InputField label="Menu Colors" name="menuColors" value={settings.menuColors} onChange={handleChange} />
          <InputField label="Highlight Colors" name="highlightColors" value={settings.highlightColors} onChange={handleChange} />
          <InputField label="Admin Commission (%)" name="adminCommission" value={settings.adminCommission} onChange={handleChange} />

          <InputField label="Store Partner Share (%)" name="restaurantCommission" value={settings.restaurantCommission} onChange={handleChange} />
          <InputField label="Global Geofence Radius (Meters)" name="globalGeofenceRadius" value={settings.globalGeofenceRadius} onChange={handleChange} />

          <SelectField label="Default Unit" name="defaultUnit" value={settings.defaultUnit} options={['KM', 'MILES']} onChange={handleChange} />
          <InputField label="Order Prefix" name="orderPrefix" value={settings.orderPrefix} onChange={handleChange} />

          <InputField label="Facebook Page" name="facebook" value={settings.facebook} onChange={handleChange} />
          <InputField label="Instagram Page" name="instagram" value={settings.instagram} onChange={handleChange} />

          {/* Switches (Radio Groups) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 col-span-1 md:col-span-2 mt-4">
            <RadioField label="Email Notifications Enable" name="emailEnable" value={settings.emailEnable} onChange={handleChange} />
            <RadioField label="SMS Enable" name="smsEnable" value={settings.smsEnable} onChange={handleChange} />
            <RadioField label="COD Payment Enable" name="codEnable" value={settings.codEnable} onChange={handleChange} />
            <RadioField label="Online Payment Enable" name="onlinePaymentEnable" value={settings.onlinePaymentEnable} onChange={handleChange} />
            <RadioField label="Free Delivery Policy Enable" name="freeDeliveryEnable" value={settings.freeDeliveryEnable} onChange={handleChange} />
            <RadioField label="Is Tax Inclusive" name="isTaxInclusive" value={settings.isTaxInclusive} onChange={handleChange} />
          </div>

          {/* Buttons */}
          <div className="col-span-1 md:col-span-2 pt-6 flex justify-between">
            <Button
              variant="contained"
              disabled={saving}
              onClick={handleSave}
              sx={{ backgroundColor: '#248C70', '&:hover': { backgroundColor: '#1c6d57' }, px: 6, py: 1.5, fontWeight: 700 }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    <Typography variant="caption" className="text-gray-500 font-semibold">{label}</Typography>
    <TextField fullWidth size="small" variant="outlined" {...props} />
  </div>
);

const SelectField = ({ label, options, ...props }) => (
  <div className="flex flex-col gap-1">
    <Typography variant="caption" className="text-gray-500 font-semibold">{label}</Typography>
    <TextField select fullWidth size="small" variant="outlined" {...props}>
      {options.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
    </TextField>
  </div>
);

const RadioField = ({ label, name, value, onChange }) => (
  <div className="flex flex-col gap-1">
    <Typography variant="caption" className="text-gray-500 font-semibold">{label}</Typography>
    <RadioGroup row name={name} value={value} onChange={onChange}>
      <FormControlLabel value="Yes" control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#248C70' } }} />} label={<span className="text-xs">Yes</span>} />
      <FormControlLabel value="No" control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#248C70' } }} />} label={<span className="text-xs">No</span>} />
    </RadioGroup>
  </div>
);

export default SiteSetting;
