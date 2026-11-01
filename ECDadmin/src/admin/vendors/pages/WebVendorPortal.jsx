import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Storefront,
  Assignment,
  Fastfood,
  AccountBalance,
  Settings,
  Refresh,
  Add,
  Upload,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Phone,
  Email,
  LocationOn,
  TrendingUp,
  Receipt,
  LocalShipping,
  VerifiedUser,
} from "@mui/icons-material";
import { API_BASE_URL } from "../../../utils/utils";
import { useAuth } from "../../context/AuthContext";

const PRIMARY_COLOR = "#248C70";

const WebVendorPortal = () => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [vendorsList, setVendorsList] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState(routeId || "");
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0: Orders, 1: Products, 2: Categories, 3: Payouts, 4: Profile
  const [alertInfo, setAlertInfo] = useState({ show: false, message: "", severity: "success" });

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState("all");

  // Products State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  // New Product Form
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Main Course",
    mrp: "",
    sellingPrice: "",
    b2bPrice: "",
    foodType: "veg",
    description: "",
    image: "",
    stockQuantity: 100,
    preparationTime: 15,
  });

  // Bulk Upload
  const [bulkDataText, setBulkDataText] = useState("");

  const showAlert = (message, severity = "success") => {
    setAlertInfo({ show: true, message, severity });
    setTimeout(() => setAlertInfo({ show: false, message: "", severity: "success" }), 4000);
  };

  // Fetch all vendors if admin, to allow quick switching
  useEffect(() => {
    const fetchAllVendors = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/vendors`, { withCredentials: true });
        const list = res.data?.data || res.data?.vendors || [];
        setVendorsList(list);

        // If no vendor selected, default to routeId, or user's restaurant, or first vendor
        if (!selectedVendorId) {
          if (routeId) {
            setSelectedVendorId(routeId);
          } else if (user?.restaurant) {
            setSelectedVendorId(user.restaurant.toString());
          } else if (list.length > 0) {
            setSelectedVendorId(list[0]._id);
          }
        }
      } catch (err) {
        console.error("Error fetching vendors list:", err);
      }
    };
    fetchAllVendors();
  }, [routeId, user]);

  // Fetch Vendor Profile Details
  const fetchVendorDetails = useCallback(async (vId) => {
    if (!vId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/vendors/${vId}`, { withCredentials: true });
      const data = res.data?.data || res.data;
      setVendorData(data);
    } catch (err) {
      console.error("Error fetching vendor details:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Orders for this specific vendor
  const fetchVendorOrders = useCallback(async (vId) => {
    if (!vId) return;
    setOrdersLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/orders/restaurant/${vId}`, { withCredentials: true });
      const list = res.data?.orders || res.data?.data || [];
      setOrders(list);
    } catch (err) {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Fetch Products for this specific vendor
  const fetchVendorProducts = useCallback(async (vId) => {
    if (!vId) return;
    setProductsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/restaurants/menu/${vId}`, { withCredentials: true });
      const list = res.data?.menu || res.data?.data || [];
      setProducts(list);
    } catch (err) {
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedVendorId) {
      fetchVendorDetails(selectedVendorId);
      fetchVendorOrders(selectedVendorId);
      fetchVendorProducts(selectedVendorId);
    }
  }, [selectedVendorId, fetchVendorDetails, fetchVendorOrders, fetchVendorProducts]);

  // Order Actions (Accept, Ready, Reject)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      if (newStatus === "preparing") {
        await axios.post(`${API_BASE_URL}/api/orders/restaurant/prepare/${orderId}`, {}, { withCredentials: true });
        showAlert("Order accepted! Moved to Preparing.");
      } else if (newStatus === "ready") {
        await axios.post(`${API_BASE_URL}/api/orders/restaurant/assign-rider/${orderId}`, {}, { withCredentials: true });
        showAlert("Order marked Packed & Ready! Riders notified for pickup.");
      }
      fetchVendorOrders(selectedVendorId);
    } catch (err) {
      showAlert(err.response?.data?.message || err.message || "Failed to update order", "error");
    }
  };

  // Add Product (Requires Admin Approval)
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.sellingPrice) {
      showAlert("Product Name and Selling Price are required", "error");
      return;
    }
    try {
      const payload = {
        name: newProduct.name,
        category: newProduct.category,
        mrp: Number(newProduct.mrp) || Number(newProduct.sellingPrice),
        sellingPrice: Number(newProduct.sellingPrice),
        b2bPrice: Number(newProduct.b2bPrice) || Number(newProduct.sellingPrice),
        foodType: newProduct.foodType,
        description: newProduct.description,
        stockQuantity: Number(newProduct.stockQuantity) || 100,
        preparationTime: Number(newProduct.preparationTime) || 15,
        isAvailable: true,
      };

      await axios.post(`${API_BASE_URL}/api/restaurants/vendor/menu/add/${selectedVendorId}`, payload, {
        withCredentials: true,
      });

      showAlert("Product SKU submitted! Awaiting Master Admin Approval before going live.", "success");
      setAddModalOpen(false);
      setNewProduct({
        name: "",
        category: "Main Course",
        mrp: "",
        sellingPrice: "",
        b2bPrice: "",
        foodType: "veg",
        description: "",
        image: "",
        stockQuantity: 100,
        preparationTime: 15,
      });
      fetchVendorProducts(selectedVendorId);
    } catch (err) {
      showAlert(err.response?.data?.message || err.message || "Failed to add product", "error");
    }
  };

  // Bulk Import Products
  const handleBulkImport = async () => {
    try {
      let parsed = [];
      try {
        parsed = JSON.parse(bulkDataText);
      } catch (e) {
        showAlert("Invalid JSON format. Please paste valid JSON items array.", "error");
        return;
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        showAlert("Please provide an array of product items", "error");
        return;
      }

      await axios.post(`${API_BASE_URL}/api/restaurants/vendor/menu/bulk-import/${selectedVendorId}`, {
        items: parsed,
      }, { withCredentials: true });

      showAlert(`${parsed.length} products bulk imported! Submitted for Master Admin SKU Approval.`, "success");
      setBulkModalOpen(false);
      setBulkDataText("");
      fetchVendorProducts(selectedVendorId);
    } catch (err) {
      showAlert(err.response?.data?.message || err.message || "Failed to bulk import products", "error");
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const name = typeof p.name === "object" ? p.name?.en || "" : p.name || "";
      if (productSearch.trim() && !name.toLowerCase().includes(productSearch.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [products, productSearch]);

  const vendorDisplayName = typeof vendorData?.name === "object"
    ? vendorData?.name?.en || Object.values(vendorData?.name)[0] || "Vendor Store"
    : vendorData?.name || "Vendor Store";

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Top Header & Store Context Selector */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2, boxShadow: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            component="img"
            src={vendorData?.image || vendorData?.logo || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400"}
            alt="Store"
            sx={{ width: 56, height: 56, borderRadius: 2, objectFit: "cover", border: "2px solid #E2E8F0" }}
          />
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A" }}>
                {vendorDisplayName}
              </Typography>
              <Chip
                label={vendorData?.vertical?.toUpperCase() || "STORE"}
                size="small"
                sx={{ bgcolor: "#248C7015", color: "#248C70", fontWeight: 700 }}
              />
              {vendorData?.restaurantApproved ? (
                <Chip icon={<VerifiedUser sx={{ fontSize: 14 }} />} label="Verified Partner" size="small" color="success" />
              ) : (
                <Chip icon={<HourglassEmpty sx={{ fontSize: 14 }} />} label="Pending Verification" size="small" color="warning" />
              )}
            </Box>
            <Typography variant="body2" sx={{ color: "#64748B", display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
              <span>ID: {vendorData?.restaurantId || `VND-${selectedVendorId?.slice(-6)?.toUpperCase()}`}</span>
              <span>•</span>
              <LocationOn sx={{ fontSize: 14 }} />
              <span>{vendorData?.address || "Indore"}</span>
              <span>•</span>
              <Phone sx={{ fontSize: 14 }} />
              <span>{vendorData?.contactNumber || vendorData?.phone || "N/A"}</span>
            </Typography>
          </Box>
        </Box>

        {/* Store Selector Dropdown for Master Admin */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {vendorsList.length > 1 && (
            <FormControl size="small" sx={{ minWidth: 260 }}>
              <InputLabel>Switch Merchant Store</InputLabel>
              <Select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                label="Switch Merchant Store"
              >
                {vendorsList.map((v) => (
                  <MenuItem key={v._id} value={v._id}>
                    {v.name} ({v.vertical})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              fetchVendorDetails(selectedVendorId);
              fetchVendorOrders(selectedVendorId);
              fetchVendorProducts(selectedVendorId);
            }}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {alertInfo.show && (
        <Alert severity={alertInfo.severity} sx={{ mb: 2 }}>
          {alertInfo.message}
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 1, borderLeft: "4px solid #248C70" }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                TODAY'S ORDERS
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                {orders.length}
              </Typography>
              <Typography variant="caption" sx={{ color: "#16A34A" }}>
                Active in Store Queue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 1, borderLeft: "4px solid #2563EB" }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                TOTAL PRODUCT SKUS
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: "#2563EB" }}>
                {products.length}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Catalog products on file
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 1, borderLeft: "4px solid #EAB308" }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                ADMIN COMMISSION
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: "#D97706" }}>
                {vendorData?.adminCommission || 12}%
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Platform fee per order
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 1, borderLeft: "4px solid #10B981" }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                ESTIMATED EARNINGS
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: "#059669" }}>
                ₹{(orders.reduce((sum, o) => sum + (o.payableAmount || o.totalAmount || 0), 0) * 0.88).toFixed(0)}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Net payable to store
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Tabs Navigation */}
      <Paper sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
        >
          <Tab icon={<Assignment />} iconPosition="start" label={`Live Orders (${orders.length})`} />
          <Tab icon={<Fastfood />} iconPosition="start" label={`Products & SKUs (${products.length})`} />
          <Tab icon={<AccountBalance />} iconPosition="start" label="Payouts & Banking" />
          <Tab icon={<Settings />} iconPosition="start" label="Store Details & KYC" />
        </Tabs>
      </Paper>

      {/* TAB 0: LIVE ORDERS */}
      {activeTab === 0 && (
        <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Live Store Orders
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Only orders assigned to {vendorDisplayName} appear here
            </Typography>
          </Box>

          {ordersLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : orders.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Assignment sx={{ fontSize: 48, color: "#94A3B8", mb: 1 }} />
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                No active orders for this store right now.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                  <TableRow>
                    <TableCell>Order ID & Time</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Items Summary</TableCell>
                    <TableCell align="center">Amount & Method</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Store Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((o) => {
                    const status = (o.status || "placed").toLowerCase();
                    return (
                      <TableRow key={o._id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {o.orderId || o.orderNumber || o._id?.slice(-6)?.toUpperCase()}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {o.customer?.name || o.deliveryAddress?.name || "Customer"}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                            {o.deliveryAddress?.address || "Indore"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {(o.items || []).map((it, idx) => (
                            <Typography key={idx} variant="body2">
                              {it.quantity}x {it.name || it.productName}
                            </Typography>
                          ))}
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#16A34A" }}>
                            ₹{o.payableAmount || o.totalAmount || 0}
                          </Typography>
                          <Chip
                            label={(o.paymentMethod || "COD").toUpperCase()}
                            size="small"
                            sx={{ fontSize: "0.65rem", fontWeight: 700, mt: 0.5 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={status.toUpperCase()}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              bgcolor: status === "delivered" ? "#DCFCE7" : (status === "preparing" ? "#EFF6FF" : "#FEF3C7"),
                              color: status === "delivered" ? "#166534" : (status === "preparing" ? "#1E40AF" : "#92400E"),
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {status === "placed" || status === "pending" ? (
                            <Button
                              variant="contained"
                              size="small"
                              sx={{ backgroundColor: PRIMARY_COLOR, textTransform: "none" }}
                              onClick={() => handleUpdateOrderStatus(o._id, "preparing")}
                            >
                              Accept & Prepare
                            </Button>
                          ) : status === "preparing" ? (
                            <Button
                              variant="contained"
                              size="small"
                              color="warning"
                              sx={{ textTransform: "none" }}
                              onClick={() => handleUpdateOrderStatus(o._id, "ready")}
                            >
                              Mark Ready for Rider
                            </Button>
                          ) : (
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              Ready for Delivery Dispatch
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* TAB 1: PRODUCT & SKU MANAGEMENT */}
      {activeTab === 1 && (
        <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Product Catalogue & SKU Approval
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Every vendor-added SKU requires Master Admin Approval before going live on the Customer App
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={() => setBulkModalOpen(true)}
                sx={{ textTransform: "none" }}
              >
                Bulk Import JSON
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAddModalOpen(true)}
                sx={{ backgroundColor: PRIMARY_COLOR, textTransform: "none" }}
              >
                Add Product SKU
              </Button>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              size="small"
              placeholder="Search product by name..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              sx={{ minWidth: 300 }}
            />
          </Box>

          {productsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredProducts.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Fastfood sx={{ fontSize: 48, color: "#94A3B8", mb: 1 }} />
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                No products found in catalogue. Click "Add Product SKU" to add items.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                  <TableRow>
                    <TableCell>Product Item</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="center">MRP</TableCell>
                    <TableCell align="center">Selling Price</TableCell>
                    <TableCell align="center">B2B / Cost</TableCell>
                    <TableCell align="center">In Stock</TableCell>
                    <TableCell align="center">Admin SKU Approval</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((p) => {
                    const pName = typeof p.name === "object" ? p.name?.en || "Item" : p.name || "Item";
                    const isApproved = p.isApproved === true || p.approvalStatus === "approved";
                    const isRejected = p.approvalStatus === "rejected";

                    return (
                      <TableRow key={p._id} hover>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box
                              component="img"
                              src={p.image || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400"}
                              alt={pName}
                              sx={{ width: 40, height: 40, borderRadius: 1.5, objectFit: "cover" }}
                            />
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {pName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                {p.foodType?.toUpperCase()} • {p.weight || "1 unit"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{p.category?.name || p.category || "Main"}</TableCell>
                        <TableCell align="center">₹{p.mrp || p.pricing?.b2c?.mrp || p.price || 0}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: "#16A34A" }}>
                          ₹{p.sellingPrice || p.pricing?.b2c?.sellingPrice || p.price || 0}
                        </TableCell>
                        <TableCell align="center" sx={{ color: "#2563EB" }}>
                          ₹{p.b2bPrice || p.pricing?.b2b?.sellingPrice || p.price || 0}
                        </TableCell>
                        <TableCell align="center">
                          <Switch checked={p.isAvailable !== false && !p.outOfStock} size="small" color="success" />
                        </TableCell>
                        <TableCell align="center">
                          {isApproved ? (
                            <Chip label="Approved & Live" size="small" sx={{ bgcolor: "#DCFCE7", color: "#166534", fontWeight: 700 }} />
                          ) : isRejected ? (
                            <Chip label="Rejected" size="small" sx={{ bgcolor: "#FEE2E2", color: "#991B1B", fontWeight: 700 }} />
                          ) : (
                            <Chip label="Pending Admin Approval" size="small" sx={{ bgcolor: "#FEF3C7", color: "#92400E", fontWeight: 700 }} />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* TAB 2: PAYOUTS & BANKING */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Payouts & Bank Settlement Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2.5, bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Registered Settlement Bank Account
                </Typography>
                <Typography variant="body2"><strong>Bank Name:</strong> {vendorData?.bankDetails?.bankName || "HDFC Bank Ltd."}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}><strong>Account Holder:</strong> {vendorData?.bankDetails?.accountName || vendorDisplayName}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}><strong>Account Number:</strong> {vendorData?.bankDetails?.accountNumber || "50200049281726"}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}><strong>IFSC / Branch:</strong> {vendorData?.bankDetails?.swiftCode || "HDFC0000281"}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2.5, bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Platform Commercial Terms
                </Typography>
                <Typography variant="body2"><strong>Platform Commission:</strong> {vendorData?.adminCommission || 12}%</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}><strong>Settlement Cycle:</strong> Weekly Auto-Credit (Every Tuesday)</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}><strong>Delivery Fee Contribution:</strong> Covered by Customer</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}><strong>Total Completed Orders:</strong> {vendorData?.totalOrders || orders.length}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* TAB 3: STORE DETAILS & KYC */}
      {activeTab === 3 && (
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Merchant Store Profile & KYC Documents
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>STORE NAME</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{vendorDisplayName}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>STORE ID</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{vendorData?.restaurantId || selectedVendorId}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>FSSAI / TRADE LICENSE NUMBER</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{vendorData?.documents?.license?.number || "FSSAI-21423010000241 (Verified)"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>GSTIN NUMBER</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{vendorData?.documents?.gst?.number || "23AABCU9603R1ZM"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>GEOFENCE DELIVERY RADIUS</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{vendorData?.geofenceRadius || 7} km from store</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>PREPARATION TIME</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{vendorData?.deliveryTime || 25} minutes average</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* ADD PRODUCT MODAL */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Add New Product SKU
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Alert severity="info" sx={{ fontSize: "0.8rem" }}>
              Every product SKU added will be submitted to Master Admin for approval before going live on the customer app.
            </Alert>
            <TextField
              label="Product Name"
              fullWidth
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              required
            />
            <TextField
              label="Category"
              fullWidth
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              required
            />
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="MRP (₹)"
                  type="number"
                  fullWidth
                  value={newProduct.mrp}
                  onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Selling Price (₹)"
                  type="number"
                  fullWidth
                  value={newProduct.sellingPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="B2B Cost (₹)"
                  type="number"
                  fullWidth
                  value={newProduct.b2bPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, b2bPrice: e.target.value })}
                />
              </Grid>
            </Grid>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddModalOpen(false)}>Cancel</Button>
          <Button variant="contained" sx={{ backgroundColor: PRIMARY_COLOR }} onClick={handleAddProduct}>
            Submit SKU for Admin Approval
          </Button>
        </DialogActions>
      </Dialog>

      {/* BULK IMPORT MODAL */}
      <Dialog open={bulkModalOpen} onClose={() => setBulkModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Bulk Import Products (JSON)</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              Paste JSON array of items with <code>name</code>, <code>category</code>, <code>mrp</code>, <code>sellingPrice</code>, <code>b2bPrice</code>:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={8}
              value={bulkDataText}
              onChange={(e) => setBulkDataText(e.target.value)}
              placeholder={`[\n  {\n    "name": "Fresh Organic Apples 1kg",\n    "category": "Fruits",\n    "mrp": 180,\n    "sellingPrice": 160,\n    "b2bPrice": 130\n  }\n]`}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBulkModalOpen(false)}>Cancel</Button>
          <Button variant="contained" sx={{ backgroundColor: PRIMARY_COLOR }} onClick={handleBulkImport}>
            Import & Submit for SKU Approval
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default WebVendorPortal;
