import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { Edit, DeleteOutline, ViewCarousel, ViewWeek } from '@mui/icons-material';
import { useRestaurantBanner } from '../../api/restaurantbanner.js';
import { useNavigate } from 'react-router-dom';

const RestaurantBannerTable = () => {
  const navigate = useNavigate();
  const { banners, loading, error, deleteBanner } = useRestaurantBanner();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading banners...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  const bannerList = Array.isArray(banners)
    ? banners
    : Array.isArray(banners?.banners)
    ? banners.banners
    : [];

  if (bannerList.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm max-w-xl mx-auto my-8">
        <ViewCarousel className="text-gray-300 text-6xl mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-800">No Custom Banners Yet</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          Default Tricelyn grocery hero slides & offer cards are currently live on your storefront. Create your first custom campaign banner below!
        </p>
        <Button
          variant="contained"
          onClick={() => navigate('/add-restaurant-banner')}
          sx={{ backgroundColor: '#0B3EDB', '&:hover': { backgroundColor: '#0A2B6B' } }}
          className="capitalize rounded-xl font-bold"
        >
          + Add New Banner / Offer Card
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-black text-gray-900">Active Banners & Promo Cards</h2>
          <p className="text-xs text-gray-500">Manage hero slider carousels and 3-column promotional offer cards</p>
        </div>
        <Button
          variant="contained"
          onClick={() => navigate('/add-restaurant-banner')}
          sx={{ backgroundColor: '#0B3EDB', '&:hover': { backgroundColor: '#0A2B6B' } }}
          className="capitalize rounded-xl font-bold shadow-xs text-xs px-4 py-2"
        >
          + Add Banner
        </Button>
      </div>

      <TableContainer component={Paper} className="shadow-xs rounded-2xl overflow-hidden border border-gray-100">
        <Table sx={{ minWidth: 650 }}>
          <TableHead className="bg-gray-100/70">
            <TableRow>
              <TableCell className="font-bold text-xs">#</TableCell>
              <TableCell className="font-bold text-xs">Type / Placement</TableCell>
              <TableCell className="font-bold text-xs">Banner Details</TableCell>
              <TableCell className="font-bold text-xs">Picture</TableCell>
              <TableCell className="font-bold text-xs">Target Link</TableCell>
              <TableCell className="font-bold text-xs">City / Hub</TableCell>
              <TableCell className="font-bold text-xs">Status</TableCell>
              <TableCell className="font-bold text-xs text-right">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {bannerList.map((row, index) => {
              const isOfferCard = row.placement === 'offer_card' || row.type === 'offer_card';
              return (
                <TableRow key={row._id} hover className="transition-colors">
                  <TableCell className="text-xs text-gray-500 font-mono">{index + 1}</TableCell>

                  <TableCell>
                    {isOfferCard ? (
                      <Chip
                        icon={<ViewWeek style={{ fontSize: 14 }} />}
                        label="Offer Card (3-Col)"
                        size="small"
                        className="bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200"
                      />
                    ) : (
                      <Chip
                        icon={<ViewCarousel style={{ fontSize: 14 }} />}
                        label="Hero Slider"
                        size="small"
                        className="bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200"
                      />
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5 max-w-xs">
                      {row.badge && (
                        <span className="inline-block text-[9px] font-black uppercase tracking-wider text-[#0B3EDB] bg-blue-50 px-1.5 py-0.5 rounded">
                          {row.badge}
                        </span>
                      )}
                      <div className="font-extrabold text-sm text-gray-900 leading-tight">
                        {row.title}
                      </div>
                      {row.subtitle && (
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {row.subtitle}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {row.image ? (
                      <div className="w-20 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                        <img
                          src={row.image}
                          alt={row.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No Image
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <span className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                      {row.link || '/categories'}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="text-xs px-2 py-1 rounded bg-blue-50 font-medium text-blue-800">
                      {row.cityName ? `📍 ${row.cityName}` : (row.city && row.city !== 'all' ? `📍 ${row.city}` : '🌐 All Hubs')}
                    </span>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={row.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      variant="outlined"
                      className={
                        row.isActive
                          ? 'border-green-500 text-green-700 bg-green-50/50 font-bold'
                          : 'border-gray-300 text-gray-500 font-medium'
                      }
                    />
                  </TableCell>

                  <TableCell align="right">
                    <div className="flex items-center justify-end space-x-1">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(`/edit-restaurant-banner/${row._id}`, {
                            state: row,
                          })
                        }
                        className="text-blue-600 hover:bg-blue-50"
                        title="Edit Banner"
                      >
                        <Edit fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedId(row._id);
                          setConfirmOpen(true);
                        }}
                        className="text-red-500 hover:bg-red-50"
                        title="Delete Banner"
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ className: 'rounded-2xl p-2' }}
      >
        <DialogTitle className="font-black text-gray-900">
          Delete Banner?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete this banner? It will immediately disappear from the Customer App and Website storefront.
          </Typography>
        </DialogContent>
        <DialogActions className="p-4">
          <Button
            onClick={() => setConfirmOpen(false)}
            variant="outlined"
            className="border-gray-300 text-gray-700 capitalize rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (selectedId) {
                await deleteBanner(selectedId);
                setConfirmOpen(false);
              }
            }}
            variant="contained"
            color="error"
            className="capitalize rounded-xl font-bold"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RestaurantBannerTable;
