import React, { useState, useEffect } from 'react';
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
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useRestaurantBanner } from '../../api/restaurantbanner.js';
import { useRestaurantNameList } from '../../api/restaurant.js';
import { useCities } from '../../api/city.js';

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

const EditRestaurantBannerForm = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { editBanner, getBannerById, loading } = useRestaurantBanner();
  const { restaurants, loading: restaurantLoading } = useRestaurantNameList();
  const { cities, loading: cityLoading } = useCities();

  const [formData, setFormData] = useState({
    placement: 'hero',
    title: '',
    subtitle: '',
    badge: '',
    buttonText: 'Shop Now',
    link: '/categories',
    bgGradient: 'from-[#002b80] via-[#0055ff] to-[#38bdf8]',
    position: 1,
    restaurant: 'all',
    city: 'all',
    status: 'active',
    bannerImage: null,
    imageUrl: ''
  });

  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        let banner = state;
        if (!banner && id) {
          banner = await getBannerById(id);
        }

        if (!banner) {
          navigate('/restaurant-banner', { replace: true });
          return;
        }

        setFormData({
          placement: banner.placement || (banner.type === 'offer_card' ? 'offer_card' : 'hero'),
          title: banner.title || '',
          subtitle: banner.subtitle || '',
          badge: banner.badge || '',
          buttonText: banner.buttonText || 'Shop Now',
          link: banner.link || '/categories',
          bgGradient: banner.bgGradient || 'from-[#002b80] via-[#0055ff] to-[#38bdf8]',
          position: banner.position || 1,
          restaurant: banner.restaurant?._id || banner.restaurant || 'all',
          city: banner.city?._id || banner.city || 'all',
          status: banner.isActive !== false ? 'active' : 'inactive',
          bannerImage: null,
          imageUrl: banner.image || ''
        });

        setPreview(banner.image || '');
        setInitialized(true);
      } catch (err) {
        console.error('Hydration failed:', err);
      }
    };
    hydrate();
  }, [id, state, getBannerById, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

      setPreview(data.url);
      setFormData(prev => ({ ...prev, imageUrl: data.url, bannerImage: null }));
      return data.url;
    } catch (err) {
      console.error('Upload failed:', err);
      return null;
    } finally {
      setUploading(false);
    }
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

    const payload = new FormData();
    payload.append('placement', formData.placement);
    payload.append('title', formData.title || 'Banner');
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

    if (formData.imageUrl) {
      payload.append('image', formData.imageUrl);
    } else if (formData.bannerImage) {
      payload.append('image', formData.bannerImage);
    }

    try {
      await editBanner(id, payload);
      alert('✅ Banner updated successfully! Changes reflect immediately on storefront.');
      navigate('/restaurant-banner');
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update banner: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!initialized) {
    return <div className="p-8 text-gray-500">Loading banner details...</div>;
  }

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <AutoAwesome className="text-[#0055ff]" />
              Edit Banner / Promo Card
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Update copy, imagery, placement type, and destination links.
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
            
            {/* Step 1: Banner Placement Selection */}
            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-3">
              <label className="text-sm font-extrabold text-gray-900 uppercase tracking-wider block">
                Banner Display Placement
              </label>
              <RadioGroup
                row
                name="placement"
                value={formData.placement}
                onChange={handleChange}
                className="gap-4"
              >
                <div
                  onClick={() => setFormData(p => ({ ...p, placement: 'hero' }))}
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
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Top interactive hero banner with full bleed artwork</p>
                      </div>
                    }
                  />
                </div>

                <div
                  onClick={() => setFormData(p => ({ ...p, placement: 'offer_card' }))}
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
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Feature cards in 3-column grid below hero</p>
                      </div>
                    }
                  />
                </div>
              </RadioGroup>
            </div>

            {/* Step 2: Content & Details */}
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
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#0055ff]"
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
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#0055ff]"
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

              {/* Right Column */}
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
                      {cities?.map((c, idx) => {
                        const cName = typeof c === 'string' ? c : (c.name || c.cityName);
                        return <MenuItem key={idx} value={cName}>{cName}</MenuItem>;
                      })}
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Display Priority
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

                {/* Image */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Banner Artwork Image
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="contained"
                      component="label"
                      disabled={uploading}
                      sx={{ backgroundColor: '#0055ff', '&:hover': { backgroundColor: '#0047d4' } }}
                      className="capitalize shadow-none rounded-xl text-xs py-2 px-4"
                    >
                      {uploading ? 'Uploading...' : 'Replace Image'}
                      <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                    </Button>
                    <span className="text-xs text-gray-400">or direct URL below</span>
                  </div>

                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData(p => ({ ...p, imageUrl: e.target.value }));
                      setPreview(e.target.value);
                    }}
                    placeholder="https://..."
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-mono outline-none focus:border-[#0055ff]"
                  />
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="pt-4 border-t border-gray-100">
              <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider block mb-2">
                Live Preview
              </label>
              <div className={`w-full rounded-2xl overflow-hidden relative p-6 flex items-center justify-between min-h-[140px] bg-gradient-to-r ${formData.bgGradient} text-white shadow-sm`}>
                <div className="max-w-[65%] space-y-1.5 z-10">
                  {formData.badge && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-white/20 border border-white/30">
                      {formData.badge}
                    </span>
                  )}
                  <h3 className="text-lg font-black leading-tight">
                    {formData.title || 'Banner Title'}
                  </h3>
                  <p className="text-xs text-white/90 line-clamp-2">
                    {formData.subtitle || 'Tagline'}
                  </p>
                  <button type="button" className="px-4 py-1.5 bg-white text-gray-900 rounded-full font-bold text-xs shadow-xs mt-2">
                    {formData.buttonText || 'Shop Now'} →
                  </button>
                </div>
                <div className="w-[35%] flex items-center justify-end">
                  {preview ? (
                    <img src={preview} alt="preview" className="h-24 object-contain rounded-lg drop-shadow" />
                  ) : (
                    <PhotoSizeSelectActual className="text-white/40 text-5xl" />
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <Button
                type="submit"
                disabled={loading || uploading}
                variant="contained"
                sx={{ backgroundColor: '#0055ff', '&:hover': { backgroundColor: '#0047d4' } }}
                className="px-8 py-2.5 capitalize rounded-xl font-bold shadow-md"
              >
                {loading ? 'Saving...' : '💾 Save Changes & Update Live'}
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

export default EditRestaurantBannerForm;
