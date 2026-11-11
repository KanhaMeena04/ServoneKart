import React, { useState } from 'react';
import {
  MenuItem,
  Select,
  Button,
  Paper,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Chip
} from '@mui/material';
import { PhotoSizeSelectActual, ViewCarousel, ViewWeek, AutoAwesome } from '@mui/icons-material';

import { useRestaurantBanner } from '../../api/restaurantbanner.js';
import { useRestaurantNameList } from '../../api/restaurant.js';
import { useCities } from '../../api/city.js';
import { useNavigate } from 'react-router-dom';

const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';
const IMAGEKIT_PUBLIC_KEY = 'public_bndzwvE17qu6mX6x96Ak/PhnGY0=';

const GRADIENT_PRESETS = [
  { label: '🌿 Farm Emerald Green', value: 'from-[#064e3b] via-[#047857] to-[#10b981]' },
  { label: '⚡ Tricelyn Royal Blue', value: 'from-[#002b80] via-[#0055ff] to-[#38bdf8]' },
  { label: '🍊 Citrus Sunset Orange', value: 'from-[#7c2d12] via-[#c2410c] to-[#ea580c]' },
  { label: '🍇 Royal Grape Purple', value: 'from-[#3b0764] via-[#7c3aed] to-[#a855f7]' },
  { label: '🧼 Clean Cyan Blue', value: 'from-[#0c4a6e] via-[#0284c7] to-[#0ea5e9]' },
  { label: '🌸 Berry Violet', value: 'from-[#312e81] via-[#4f46e5] to-[#7c3aed]' },
];

const QUICK_CATEGORIES = [
  { label: 'Fruits & Vegetables', path: '/category/fruits-vegetables' },
  { label: 'Dairy, Bread & Eggs', path: '/category/dairy-bread-eggs' },
  { label: 'Atta, Rice & Dals', path: '/category/atta-rice-dal' },
  { label: 'Cold Drinks & Juices', path: '/category/cold-drinks-juices' },
  { label: 'Snacks & Munchies', path: '/category/snacks-munchies' },
  { label: 'Household Cleaning', path: '/category/household-cleaning' },
  { label: 'Personal Care & Hygiene', path: '/category/personal-care' },
  { label: 'All Catalog Aisles', path: '/categories' },
];

const AddRestaurantBannerForm = () => {
  const { addBanner, loading } = useRestaurantBanner();
  const { restaurants, loading: restaurantLoading } = useRestaurantNameList();
  const { cities, loading: cityLoading } = useCities();
  const navigate = useNavigate();

  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  const [formData, setFormData] = useState({
    placement: 'hero', // 'hero' | 'offer_card'
    title: '',
    subtitle: '',
    badge: 'TRICELYN FRESH · 10-15 MINS',
    buttonText: 'Order Fresh',
    link: '/category/fruits-vegetables',
    bgGradient: 'from-[#064e3b] via-[#047857] to-[#10b981]',
    position: 1,
    restaurant: 'all',
    city: 'all',
    status: 'active',
    bannerImage: null,
    imageUrl: ''
  });

  const uploadToImageKitDirect = async (file) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('fileName', `banner_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
      fd.append('publicKey', IMAGEKIT_PUBLIC_KEY);
      fd.append('folder', '/tricelyn/banners');

      const res = await fetch(IMAGEKIT_UPLOAD_URL, {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      if (!data.url) throw new Error('No URL in upload response');

      setUploadedImageUrl(data.url);
      setPreview(data.url);
      setFormData(prev => ({ ...prev, imageUrl: data.url, bannerImage: null }));
      return data.url;
    } catch (err) {
      console.error('Image upload failed:', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      // Preset defaults based on placement
      if (name === 'placement') {
        if (value === 'hero') {
          next.badge = 'TRICELYN FRESH · 10-15 MINS';
          next.buttonText = 'Order Fresh';
        } else {
          next.badge = 'FLAT 30% OFF';
          next.buttonText = 'Shop Now';
          next.bgGradient = 'from-[#7c2d12] via-[#c2410c] to-[#ea580c]';
        }
      }
      return next;
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    const ikUrl = await uploadToImageKitDirect(file);
    if (!ikUrl) {
      setFormData(prev => ({ ...prev, bannerImage: file, imageUrl: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalImage = formData.imageUrl || uploadedImageUrl;
    if (!finalImage && !formData.bannerImage && !formData.title) {
      alert('Please upload an image or provide a title');
      return;
    }

    const payload = new FormData();
    payload.append('placement', formData.placement);
    payload.append('title', formData.title || (formData.placement === 'hero' ? 'Fresh Daily Essentials' : 'Exclusive Deal'));
    payload.append('subtitle', formData.subtitle || '');
    payload.append('badge', formData.badge || '');
    payload.append('buttonText', formData.buttonText || 'Shop Now');
    payload.append('link', formData.link || '/categories');
    payload.append('bgGradient', formData.bgGradient || 'from-[#002b80] via-[#0055ff] to-[#38bdf8]');
    payload.append('position', Number(formData.position) || 1);
    payload.append('city', formData.city || 'all');
    payload.append('isActive', formData.status === 'active');
    payload.append('type', (formData.restaurant && formData.restaurant !== 'all') ? 'restaurant' : 'static');

    if (formData.restaurant && formData.restaurant !== 'all') {
      payload.append('restaurant', formData.restaurant);
    }

    if (finalImage) {
      payload.append('image', finalImage);
    } else if (formData.bannerImage) {
      payload.append('image', formData.bannerImage);
    }

    try {
      await addBanner(payload);
      alert('✅ Banner created successfully! It is now live on Website and Customer App.');
      navigate('/restaurant-banner');
    } catch (err) {
      console.error('Error saving banner:', err);
      alert('Failed to save banner: ' + (err.response?.data?.message || err.message));
    }
  };

  const dynamicCityList = React.useMemo(() => {
    const citySet = new Set();
    if (Array.isArray(cities)) {
      cities.forEach(c => {
        const name = typeof c === 'string' ? c : (c.name || c.cityName);
        if (name && name.trim()) citySet.add(name.trim());
      });
    }
    if (Array.isArray(restaurants)) {
      restaurants.forEach(r => {
        if (r.city && r.city.trim()) citySet.add(r.city.trim());
      });
    }
    return Array.from(citySet);
  }, [cities, restaurants]);

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <AutoAwesome className="text-[#0055ff]" />
              Create Dynamic Banner & Offer Card
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Configure Hero Carousel Slides or 3-Column Promo Cards. Changes reflect dynamically across Web & Mobile apps.
            </p>
          </div>
          <Button
            variant="outlined"
            onClick={() => navigate('/restaurant-banner')}
            className="border-gray-300 text-gray-700 capitalize"
          >
            Back to List
          </Button>
        </div>

        <Paper className="p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 bg-white">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Step 1: Banner Placement Type Selection */}
            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-3">
              <label className="text-sm font-extrabold text-gray-900 uppercase tracking-wider block">
                1. Select Banner Display Placement
              </label>
              <RadioGroup
                row
                name="placement"
                value={formData.placement}
                onChange={handleChange}
                className="gap-4"
              >
                <div
                  onClick={() => setFormData(p => ({ ...p, placement: 'hero', badge: 'TRICELYN FRESH · 10-15 MINS', buttonText: 'Order Fresh' }))}
                  className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.placement === 'hero'
                      ? 'border-[#0055ff] bg-white shadow-xs'
                      : 'border-gray-200 bg-white/60 hover:border-gray-300'
                  }`}
                >
                  <FormControlLabel
                    value="hero"
                    control={<Radio sx={{ color: '#0055ff', '&.Mui-checked': { color: '#0055ff' } }} />}
                    label={
                      <div className="ml-1">
                        <div className="flex items-center gap-1.5 font-bold text-gray-900">
                          <ViewCarousel className="text-[#0055ff] text-xl" />
                          <span>Hero Carousel Slider</span>
                          <Chip label="Top Slider" size="small" className="bg-blue-100 text-blue-700 font-bold text-[10px]" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Large interactive top hero banner with auto-sliding transitions, full bleed images, and gradient ambiance.
                        </p>
                      </div>
                    }
                  />
                </div>

                <div
                  onClick={() => setFormData(p => ({ ...p, placement: 'offer_card', badge: 'FLAT 30% OFF', buttonText: 'Shop Now', bgGradient: 'from-[#7c2d12] via-[#c2410c] to-[#ea580c]' }))}
                  className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.placement === 'offer_card'
                      ? 'border-[#0055ff] bg-white shadow-xs'
                      : 'border-gray-200 bg-white/60 hover:border-gray-300'
                  }`}
                >
                  <FormControlLabel
                    value="offer_card"
                    control={<Radio sx={{ color: '#0055ff', '&.Mui-checked': { color: '#0055ff' } }} />}
                    label={
                      <div className="ml-1">
                        <div className="flex items-center gap-1.5 font-bold text-gray-900">
                          <ViewWeek className="text-emerald-600 text-xl" />
                          <span>Promo Offer Card (3-Column)</span>
                          <Chip label="Feature Grid" size="small" className="bg-emerald-100 text-emerald-700 font-bold text-[10px]" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Compact promo card for the 3-column feature grid below hero. Swipeable on mobile with offer badge.
                        </p>
                      </div>
                    }
                  />
                </div>
              </RadioGroup>
            </div>

            {/* Step 2: Content & Copywriting */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Banner Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder={formData.placement === 'hero' ? 'Farm Fresh Fruits & Vegetables' : 'Kitchen Staples & Pure Ghee'}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#0055ff] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Subtitle / Description
                  </label>
                  <textarea
                    rows={2}
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    placeholder="Crisp seasonal greens, organic veggies & juicy fruits delivered straight from Indore mandis"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#0055ff] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Badge / Tag Text
                    </label>
                    <input
                      type="text"
                      name="badge"
                      value={formData.badge}
                      onChange={handleChange}
                      placeholder="e.g. FLAT 30% OFF"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-[#0055ff]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Button CTA Text
                    </label>
                    <input
                      type="text"
                      name="buttonText"
                      value={formData.buttonText}
                      onChange={handleChange}
                      placeholder="e.g. Order Fresh"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-[#0055ff]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Destination Link / Category
                  </label>
                  <Select
                    value={formData.link}
                    onChange={(e) => setFormData(p => ({ ...p, link: e.target.value }))}
                    size="small"
                    className="bg-white rounded-xl"
                  >
                    {QUICK_CATEGORIES.map((cat, idx) => (
                      <MenuItem key={idx} value={cat.path}>
                        {cat.label} ({cat.path})
                      </MenuItem>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Right Column: Styling, Image & Geo targeting */}
              <div className="space-y-4">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Background Gradient Theme
                  </label>
                  <Select
                    name="bgGradient"
                    value={formData.bgGradient}
                    onChange={handleChange}
                    size="small"
                    className="bg-white rounded-xl"
                  >
                    {GRADIENT_PRESETS.map((p, idx) => (
                      <MenuItem key={idx} value={p.value}>
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-md bg-gradient-to-r ${p.value} shadow-2xs`} />
                          <span>{p.label}</span>
                        </div>
                      </MenuItem>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Target Dark Store / Mart
                    </label>
                    <Select
                      name="restaurant"
                      value={formData.restaurant}
                      onChange={handleChange}
                      size="small"
                      className="bg-white rounded-xl"
                      disabled={restaurantLoading}
                    >
                      <MenuItem value="all">🌐 All Dark Stores (Global)</MenuItem>
                      {restaurants?.map(r => (
                        <MenuItem key={r._id || r.id} value={r._id || r.id}>
                          {r.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Target City / Hub
                    </label>
                    <Select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      size="small"
                      className="bg-white rounded-xl"
                      disabled={cityLoading}
                    >
                      <MenuItem value="all">🌐 All Operating Regions / Cities (Global)</MenuItem>
                      {dynamicCityList.map((cityName, idx) => (
                        <MenuItem key={idx} value={cityName}>
                          {cityName}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Display Priority Order
                    </label>
                    <input
                      type="number"
                      name="position"
                      min={1}
                      max={99}
                      value={formData.position}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-[#0055ff]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Publish Status
                    </label>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      size="small"
                      className="bg-white rounded-xl"
                    >
                      <MenuItem value="active">Active (Visible)</MenuItem>
                      <MenuItem value="inactive">Inactive (Hidden)</MenuItem>
                    </Select>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Banner Cutout / Packshot Image
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="contained"
                      component="label"
                      disabled={uploading}
                      sx={{ backgroundColor: '#0055ff', '&:hover': { backgroundColor: '#0047d4' } }}
                      className="capitalize shadow-none rounded-xl text-xs py-2 px-4"
                    >
                      {uploading ? (
                        <><CircularProgress size={14} sx={{ color: 'white', mr: 1 }} /> Uploading...</>
                      ) : 'Upload Image'}
                      <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                    </Button>
                    <span className="text-xs text-gray-400">or direct ImageKit URL:</span>
                  </div>

                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData(p => ({ ...p, imageUrl: e.target.value }));
                      setPreview(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/... or ImageKit link"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-mono outline-none focus:border-[#0055ff]"
                  />
                </div>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="pt-4 border-t border-gray-100">
              <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider block mb-2">
                Live Preview (How it will render on Customer Website & App)
              </label>

              {formData.placement === 'hero' ? (
                /* Hero Preview */
                <div className={`w-full rounded-2xl overflow-hidden relative p-6 flex items-center justify-between min-h-[160px] bg-gradient-to-r ${formData.bgGradient} text-white shadow-sm`}>
                  <div className="max-w-[65%] space-y-2 z-10">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-white/20 border border-white/30">
                      {formData.badge || 'TRICELYN FRESH'}
                    </span>
                    <h3 className="text-xl font-black leading-tight drop-shadow-xs">
                      {formData.title || 'Banner Title'}
                    </h3>
                    <p className="text-xs text-white/90 line-clamp-2">
                      {formData.subtitle || 'Short descriptive tagline about this grocery category'}
                    </p>
                    <button type="button" className="px-4 py-1.5 bg-white text-gray-900 rounded-full font-bold text-xs shadow-xs">
                      {formData.buttonText || 'Shop Now'} →
                    </button>
                  </div>
                  <div className="w-[35%] flex items-center justify-end">
                    {preview ? (
                      <img src={preview} alt="preview" className="h-28 object-contain drop-shadow-md rounded-lg" />
                    ) : (
                      <PhotoSizeSelectActual className="text-white/40 text-6xl" />
                    )}
                  </div>
                </div>
              ) : (
                /* Offer Card Preview */
                <div className="max-w-md">
                  <div className={`rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[140px] bg-gradient-to-r ${formData.bgGradient} text-white shadow-sm`}>
                    <div className="max-w-[65%] space-y-1 z-10">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-white/20 border border-white/30">
                        {formData.badge || 'FLAT 30% OFF'}
                      </span>
                      <h4 className="text-base font-black leading-tight">
                        {formData.title || 'Offer Card Title'}
                      </h4>
                      <p className="text-[11px] text-white/90 line-clamp-2">
                        {formData.subtitle || 'Subtitle details'}
                      </p>
                    </div>
                    <div className="pt-2 z-10">
                      <span className="inline-block px-3 py-1 bg-white text-gray-900 rounded-full text-[11px] font-black">
                        {formData.buttonText || 'Shop Now'} →
                      </span>
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-[40%] flex items-center justify-end overflow-hidden">
                      {preview ? (
                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <PhotoSizeSelectActual className="text-white/40 text-6xl mr-2" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <Button
                type="submit"
                disabled={loading || uploading}
                variant="contained"
                sx={{ backgroundColor: '#0055ff', '&:hover': { backgroundColor: '#0047d4' } }}
                className="px-8 py-2.5 capitalize rounded-xl font-bold shadow-md"
              >
                {loading ? 'Publishing Banner...' : '🚀 Publish Banner & Make Live'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/restaurant-banner')}
                className="border-gray-300 text-gray-700 capitalize rounded-xl"
              >
                Cancel
              </Button>
            </div>

          </form>
        </Paper>
      </div>
    </div>
  );
};

export default AddRestaurantBannerForm;
