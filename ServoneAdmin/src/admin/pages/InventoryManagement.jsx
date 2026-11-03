import React, { useState, useEffect, useCallback } from 'react';
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
  Tabs,
  Tab,
  InputAdornment,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Search,
  Refresh,
  Inventory,
  WarningAmber,
  CheckCircle,
  Cancel,
  CurrencyRupee,
  Add,
  Remove,
  Save,
  FilterList
} from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/utils';

export default function InventoryManagement() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    totalSkus: 0,
    inStockCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValuation: 0
  });
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('all'); // 'all' | 'low_stock' | 'out_of_stock' | 'in_stock'
  const [editedStock, setEditedStock] = useState({});

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/grocery/inventory`, {
        params: {
          search: search.trim() || undefined,
          status: statusTab !== 'all' ? statusTab : undefined,
          limit: 100
        }
      });
      if (res.data?.success) {
        setItems(res.data.products || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusTab]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Handle local stock adjustment
  const handleStockChange = (id, newQty) => {
    const val = Math.max(0, parseInt(newQty) || 0);
    setEditedStock(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        stockQuantity: val,
        inStock: val > 0
      }
    }));
  };

  // Adjust stock by delta (+1, -1, +5, -5)
  const adjustStock = (item, delta) => {
    const current = editedStock[item._id]?.stockQuantity ?? item.stockQuantity;
    handleStockChange(item._id, current + delta);
  };

  // Toggle inStock flag
  const toggleInStock = (item) => {
    const currentInStock = editedStock[item._id]?.inStock ?? item.inStock;
    const currentQty = editedStock[item._id]?.stockQuantity ?? item.stockQuantity;
    const nextInStock = !currentInStock;

    setEditedStock(prev => ({
      ...prev,
      [item._id]: {
        ...(prev[item._id] || {}),
        inStock: nextInStock,
        stockQuantity: nextInStock && currentQty === 0 ? 10 : (nextInStock ? currentQty : 0)
      }
    }));
  };

  // Save changes for a single item
  const saveItemStock = async (item) => {
    const edits = editedStock[item._id];
    if (!edits) return;

    setSavingId(item._id);
    try {
      await axios.put(`${API_BASE_URL}/api/grocery/inventory/${item._id}`, edits);
      // Update local state
      setItems(prev => prev.map(p => {
        if (p._id === item._id) {
          const newQty = edits.stockQuantity !== undefined ? edits.stockQuantity : p.stockQuantity;
          const newInStock = edits.inStock !== undefined ? edits.inStock : (newQty > 0);
          const newStatus = !newInStock || newQty === 0 ? 'out_of_stock' : (newQty <= p.lowStockThreshold ? 'low_stock' : 'in_stock');
          return {
            ...p,
            stockQuantity: newQty,
            inStock: newInStock,
            status: newStatus
          };
        }
        return p;
      }));

      // Clear from pending edits
      setEditedStock(prev => {
        const copy = { ...prev };
        delete copy[item._id];
        return copy;
      });
    } catch (err) {
      console.error('Failed to update stock:', err);
      alert('Failed to save stock update: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen space-y-6">
      
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Inventory className="text-[#0055ff]" />
            Real-Time Inventory & Stock Manager
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Monitor dark store inventory, update stock levels, and set out-of-stock protections across Tricelyn Web & Mobile Apps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            onClick={fetchInventory}
            startIcon={<Refresh />}
            className="border-gray-300 text-gray-700 capitalize rounded-xl text-xs py-2 px-3"
          >
            Refresh Stock
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <Paper className="p-4 rounded-2xl border border-blue-100 shadow-2xs bg-white">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total SKUs</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{stats.totalSkus}</div>
          <div className="text-[10px] text-blue-600 font-semibold mt-0.5">Catalog products</div>
        </Paper>

        <Paper className="p-4 rounded-2xl border border-emerald-100 shadow-2xs bg-white">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide">In Stock</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{stats.inStockCount}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Ready to order</div>
        </Paper>

        <Paper className="p-4 rounded-2xl border border-amber-100 shadow-2xs bg-white">
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wide">Low Stock Alert</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{stats.lowStockCount}</div>
          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">&le; 10 units left</div>
        </Paper>

        <Paper className="p-4 rounded-2xl border border-rose-100 shadow-2xs bg-white">
          <div className="text-xs font-bold text-rose-700 uppercase tracking-wide">Out of Stock</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{stats.outOfStockCount}</div>
          <div className="text-[10px] text-rose-600 font-semibold mt-0.5">Disabled on Store</div>
        </Paper>

        <Paper className="p-4 rounded-2xl border border-indigo-100 shadow-2xs bg-white col-span-2 md:col-span-1">
          <div className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Valuation</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">₹{stats.totalValuation?.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">Total inventory value</div>
        </Paper>
      </div>

      {/* Filter Tabs & Search Bar */}
      <Paper className="p-4 rounded-2xl border border-gray-100 shadow-xs bg-white space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <Tabs
            value={statusTab}
            onChange={(_, val) => setStatusTab(val)}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 40 }}
          >
            <Tab label={`All Items (${stats.totalSkus})`} value="all" className="capitalize text-xs font-bold" />
            <Tab label={`Low Stock (${stats.lowStockCount})`} value="low_stock" className="capitalize text-xs font-bold text-amber-600" />
            <Tab label={`Out of Stock (${stats.outOfStockCount})`} value="out_of_stock" className="capitalize text-xs font-bold text-rose-600" />
            <Tab label={`In Stock (${stats.inStockCount})`} value="in_stock" className="capitalize text-xs font-bold text-emerald-600" />
          </Tabs>

          <div className="w-full md:w-72">
            <TextField
              size="small"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name or SKU..."
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
        </div>
      </Paper>

      {/* Main Stock Inventory Table */}
      <TableContainer component={Paper} className="shadow-xs rounded-2xl overflow-hidden border border-gray-100 bg-white">
        {loading ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <CircularProgress size={32} sx={{ color: '#0055ff' }} />
            <p className="text-xs font-bold">Synchronizing real-time inventory...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-sm font-bold">No products match your search or filter.</p>
          </div>
        ) : (
          <Table sx={{ minWidth: 750 }}>
            <TableHead className="bg-gray-100/70">
              <TableRow>
                <TableCell className="font-bold text-xs">Product & SKU</TableCell>
                <TableCell className="font-bold text-xs">Category & Store</TableCell>
                <TableCell className="font-bold text-xs">Unit & Price</TableCell>
                <TableCell className="font-bold text-xs">Stock Level (Units)</TableCell>
                <TableCell className="font-bold text-xs">Stock Status</TableCell>
                <TableCell className="font-bold text-xs">Store Visibility</TableCell>
                <TableCell className="font-bold text-xs text-right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {items.map((item) => {
                const pending = editedStock[item._id];
                const currentQty = pending?.stockQuantity !== undefined ? pending.stockQuantity : item.stockQuantity;
                const currentInStock = pending?.inStock !== undefined ? pending.inStock : item.inStock;
                const isModified = pending !== undefined;
                const isSaving = savingId === item._id;

                const isLow = currentQty > 0 && currentQty <= item.lowStockThreshold;
                const isOut = !currentInStock || currentQty === 0;

                return (
                  <TableRow key={item._id} hover className={isModified ? 'bg-blue-50/20' : ''}>
                    
                    {/* Product & SKU */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 flex-shrink-0 flex items-center justify-center p-1">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-gray-900 leading-snug max-w-xs">
                            {item.name}
                          </div>
                          <span className="text-[10px] font-mono text-gray-400">
                            {item.sku}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category & Store */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          {item.categoryName}
                        </span>
                        <div className="text-[11px] text-gray-500 font-medium truncate max-w-[140px]">
                          {item.storeName}
                        </div>
                      </div>
                    </TableCell>

                    {/* Unit & Price */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-gray-900">
                          ₹{item.sellingPrice}
                        </span>
                        {item.mrp > item.sellingPrice && (
                          <span className="text-[10px] text-gray-400 line-through ml-1">
                            ₹{item.mrp}
                          </span>
                        )}
                        <div className="text-[10px] text-gray-500">
                          per {item.unit}
                        </div>
                      </div>
                    </TableCell>

                    {/* Stock Counter with +/- */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <IconButton
                          size="small"
                          onClick={() => adjustStock(item, -1)}
                          disabled={currentQty <= 0}
                          className="w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                        >
                          <Remove fontSize="inherit" />
                        </IconButton>

                        <input
                          type="number"
                          min={0}
                          value={currentQty}
                          onChange={(e) => handleStockChange(item._id, e.target.value)}
                          className={`w-16 text-center font-bold text-xs py-1.5 rounded-lg border outline-none ${
                            isModified
                              ? 'border-[#0055ff] bg-blue-50/40 text-blue-900'
                              : 'border-gray-200 bg-gray-50 text-gray-900'
                          }`}
                        />

                        <IconButton
                          size="small"
                          onClick={() => adjustStock(item, 1)}
                          className="w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                        >
                          <Add fontSize="inherit" />
                        </IconButton>

                        <button
                          onClick={() => adjustStock(item, 10)}
                          className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-1.5 py-1 rounded"
                          title="Add 10 units"
                        >
                          +10
                        </button>
                      </div>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      {isOut ? (
                        <Chip
                          icon={<Cancel style={{ fontSize: 13 }} />}
                          label="Out of Stock"
                          size="small"
                          className="bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200"
                        />
                      ) : isLow ? (
                        <Chip
                          icon={<WarningAmber style={{ fontSize: 13 }} />}
                          label={`Low Stock (${currentQty})`}
                          size="small"
                          className="bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200"
                        />
                      ) : (
                        <Chip
                          icon={<CheckCircle style={{ fontSize: 13 }} />}
                          label={`In Stock (${currentQty})`}
                          size="small"
                          className="bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200"
                        />
                      )}
                    </TableCell>

                    {/* Store Visibility Toggle */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Switch
                          size="small"
                          checked={currentInStock && currentQty > 0}
                          onChange={() => toggleInStock(item)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#0055ff' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#0055ff' }
                          }}
                        />
                        <span className={`text-[10px] font-bold ${currentInStock && currentQty > 0 ? 'text-emerald-700' : 'text-gray-400'}`}>
                          {currentInStock && currentQty > 0 ? 'Available' : 'Hidden'}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      {isModified ? (
                        <Button
                          size="small"
                          variant="contained"
                          disabled={isSaving}
                          onClick={() => saveItemStock(item)}
                          startIcon={isSaving ? <CircularProgress size={12} sx={{ color: 'white' }} /> : <Save />}
                          sx={{ backgroundColor: '#0055ff', '&:hover': { backgroundColor: '#0047d4' } }}
                          className="capitalize rounded-lg text-xs py-1 px-3 shadow-2xs font-bold"
                        >
                          {isSaving ? 'Saving' : 'Save'}
                        </Button>
                      ) : (
                        <span className="text-[11px] text-gray-400 font-medium">Synced</span>
                      )}
                    </TableCell>

                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </TableContainer>

    </div>
  );
}
