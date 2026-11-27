import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import PageActionBar from '../../components/PageActionBar';
import RestaurantBannerTable from '../components/RestaurantBannerTable';
import { useNavigate } from 'react-router-dom';
import { Switch, FormControlLabel, Paper, CircularProgress } from '@mui/material';
import { ViewCarousel } from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../../utils/utils';

function RestaurantBanner() {
  const navigate = useNavigate();
  const [showHeroBanner, setShowHeroBanner] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [loadingSetting, setLoadingSetting] = useState(true);

  useEffect(() => {
    fetchBannerSetting();
  }, []);

  const fetchBannerSetting = async () => {
    setLoadingSetting(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE_URL}/api/settings`, { headers, withCredentials: true });
      setShowHeroBanner(res.data?.showHeroBanner === true);
    } catch (err) {
      console.error('Failed to fetch hero banner setting:', err);
    } finally {
      setLoadingSetting(false);
    }
  };

  const handleToggleHero = async (e) => {
    const nextVal = e.target.checked;
    setToggling(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.put(`${API_BASE_URL}/api/admin/settings`, { showHeroBanner: nextVal }, { headers, withCredentials: true });
      setShowHeroBanner(nextVal);
      toast.success(nextVal ? 'Hero Carousel Banner is now VISIBLE on Website & App' : 'Hero Carousel Banner is now HIDDEN on Website & App');
    } catch (err) {
      console.error('Failed to update hero banner visibility:', err);
      toast.error('Failed to update banner visibility');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="w-full lg:mt-0 p-4 xs:p-5 space-y-4">
      <PageHeader
        title="Banner List & Visibility"
        breadcrumbs={[
          { label: "Banner" },
          { label: "Banner List", active: true }
        ]}
      />

      {/* Hero Banner Master Toggle Card */}
      <Paper className="p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${showHeroBanner ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
              <ViewCarousel />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-gray-900">
                  Homepage Hero Banner Visibility (Website & App)
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${showHeroBanner ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                  {showHeroBanner ? 'Live: Visible' : 'Live: Hidden'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Toggle to display or hide the top hero carousel banners across the Website storefront and Customer Mobile App in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:self-center">
            {loadingSetting ? (
              <CircularProgress size={20} sx={{ color: '#0145F2' }} />
            ) : (
              <FormControlLabel
                control={
                  <Switch
                    checked={showHeroBanner}
                    onChange={handleToggleHero}
                    disabled={toggling}
                    color="primary"
                  />
                }
                label={
                  <span className="text-xs font-bold text-gray-700">
                    {showHeroBanner ? 'Hero Banner ON' : 'Hero Banner OFF'}
                  </span>
                }
              />
            )}
          </div>
        </div>
      </Paper>
      
      <PageActionBar
        buttonLabel="Add Banner"   
        onButtonClick={() => navigate("/add-restaurant-banner")} 
        searchLabel="Search"
      />    
      
      <RestaurantBannerTable />
    </div>
  );
}

export default RestaurantBanner;
