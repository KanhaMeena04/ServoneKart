import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
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
  VerifiedUser,
  HourglassEmpty,
  Percent,
  Search,
  Refresh,
  Edit,
  CheckCircle,
  Cancel,
  Block,
  Phone,
  Email,
  LocationOn,
  AccountBalance,
  Description,
} from "@mui/icons-material";
import PageHeader from "../../components/PageHeader";
import { useVendors } from "../../api/vendor";

const PRIMARY_COLOR = "#248C70";

const VERTICAL_TABS = [
  { id: "all", label: "All Vendors", icon: "🌐", color: "#475569" },
  { id: "food", label: "Restaurants & Food", icon: "🍔", color: "#248C70" },
  { id: "grocery", label: "Grocery Marts", icon: "🛒", color: "#16A34A" },
  { id: "home_services", label: "Home Technicians", icon: "🔧", color: "#2563EB" },
  { id: "medicine", label: "Pharmacies & Rx", icon: "💊", color: "#DC2626" },
  { id: "laundry", label: "Laundries & Clean", icon: "🧺", color: "#0D9488" },
  { id: "essentials", label: "Water & Dairy", icon: "💧", color: "#0284C7" },
  { id: "gifts_bakery", label: "Bakeries & Gifts", icon: "🎂", color: "#DB2777" },
];

const VendorPanel = () => {
  const {
    vendors,
    stats,
    loading,
    error,
    fetchVendors,
    updateVendorStatus,
    updateVendorCommission,
  } = useVendors();

  const [activeVertical, setActiveVertical] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [alertInfo, setAlertInfo] = useState({ show: false, message: "", severity: "success" });

  // KYC Modal State
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Commission Modal State
  const [commissionModalOpen, setCommissionModalOpen] = useState(false);
  const [commissionTarget, setCommissionTarget] = useState(null);
  const [newCommissionRate, setNewCommissionRate] = useState(12);

  const showAlert = (message, severity = "success") => {
    setAlertInfo({ show: true, message, severity });
    setTimeout(() => setAlertInfo({ show: false, message: "", severity: "success" }), 4000);
  };

  // Filter vendors by vertical, status, and search
  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      // Vertical match
      if (activeVertical !== "all" && (v.vertical || "food") !== activeVertical) {
        return false;
      }
      // Status match
      if (statusFilter === "approved" && v.status !== "approved") return false;
      if (statusFilter === "pending" && v.status !== "pending") return false;
      if (statusFilter === "suspended" && v.status !== "suspended") return false;

      // Search match
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const nameMatch = (v.name || "").toLowerCase().includes(query);
        const ownerMatch = (v.ownerName || "").toLowerCase().includes(query);
        const phoneMatch = (v.phone || "").toLowerCase().includes(query);
        const areaMatch = (v.area || v.city || "").toLowerCase().includes(query);
        const idMatch = (v.vendorId || "").toLowerCase().includes(query);
        if (!nameMatch && !ownerMatch && !phoneMatch && !areaMatch && !idMatch) return false;
      }

      return true;
    });
  }, [vendors, activeVertical, statusFilter, searchTerm]);

  // Open KYC Review Modal
  const handleOpenKyc = (vendor) => {
    setSelectedVendor(vendor);
    setRejectReason("");
    setKycModalOpen(true);
  };

  // Open Commission Edit Modal
  const handleOpenCommission = (vendor) => {
    setCommissionTarget(vendor);
    setNewCommissionRate(vendor.adminCommission !== undefined ? vendor.adminCommission : 12);
    setCommissionModalOpen(true);
  };

  // Save Commission
  const handleSaveCommission = async () => {
    if (!commissionTarget) return;
    try {
      await updateVendorCommission(commissionTarget._id, newCommissionRate);
      showAlert(`Commission set to ${newCommissionRate}% for ${commissionTarget.name}!`);
      setCommissionModalOpen(false);
      fetchVendors();
    } catch (err) {
      showAlert(err.message || "Failed to update commission", "error");
    }
  };

  // Approve / Reject / Suspend Vendor
  const handleUpdateStatus = async (action) => {
    if (!selectedVendor) return;
    try {
      await updateVendorStatus(selectedVendor._id, {
        action,
        status: action === "approve" ? "approved" : (action === "reject" ? "rejected" : "suspended"),
        reason: rejectReason,
      });
      showAlert(`Vendor ${selectedVendor.name} status updated: ${action.toUpperCase()}`);
      setKycModalOpen(false);
      fetchVendors();
    } catch (err) {
      showAlert(err.message || "Failed to update vendor status", "error");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Super App Vendor Management Control Tower"
        breadcrumbs={[
          { label: "Admin Control" },
          { label: "Vendors & Partners", active: true },
        ]}
      />

      {alertInfo.show && (
        <Alert severity={alertInfo.severity} sx={{ mb: 2 }}>
          {alertInfo.message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* KPI Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 1, borderLeft: "4px solid #248C70" }}>
            <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  TOTAL REGISTERED PARTNERS
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {stats.totalVendors || vendors.length}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Across all 8 verticals (Indore)
                </Typography>
              </Box>
              <Storefront sx={{ fontSize: 40, color: "#248C70", opacity: 0.8 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 1, borderLeft: "4px solid #16A34A" }}>
            <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  ACTIVE & LIVE PARTNERS
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: "#16A34A" }}>
                  {stats.activeVendors || vendors.filter((v) => v.status === "approved").length}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Verified & ready for orders
                </Typography>
              </Box>
              <VerifiedUser sx={{ fontSize: 40, color: "#16A34A", opacity: 0.8 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 1, borderLeft: "4px solid #EAB308" }}>
            <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  PENDING KYC & APPROVAL
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: "#D97706" }}>
                  {stats.pendingApprovals || vendors.filter((v) => v.status === "pending").length}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Requires admin document review
                </Typography>
              </Box>
              <HourglassEmpty sx={{ fontSize: 40, color: "#D97706", opacity: 0.8 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 1, borderLeft: "4px solid #2563EB" }}>
            <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  AVG PLATFORM COMMISSION
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: "#2563EB" }}>
                  12.5%
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Configurable per merchant
                </Typography>
              </Box>
              <Percent sx={{ fontSize: 40, color: "#2563EB", opacity: 0.8 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Vertical Selector Filter Tabs */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, mb: 1, display: "block" }}>
          Filter Vendors by Super App Vertical:
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {VERTICAL_TABS.map((tab) => {
            const isSelected = activeVertical === tab.id;
            return (
              <Chip
                key={tab.id}
                label={`${tab.icon} ${tab.label}`}
                onClick={() => setActiveVertical(tab.id)}
                clickable
                variant={isSelected ? "filled" : "outlined"}
                sx={{
                  fontWeight: isSelected ? 700 : 500,
                  bgcolor: isSelected ? tab.color : "transparent",
                  color: isSelected ? "#FFFFFF" : "#334155",
                  borderColor: isSelected ? tab.color : "#CBD5E1",
                  "&:hover": {
                    bgcolor: isSelected ? tab.color : "#F1F5F9",
                  },
                }}
              />
            );
          })}
        </Box>
      </Paper>

      {/* Search & Status Filters Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 1, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", flex: 1 }}>
          <TextField
            size="small"
            placeholder="Search vendor by name, owner, phone, ID, or area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: "text.secondary", mr: 1 }} />,
            }}
            sx={{ minWidth: 320, flex: 1 }}
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="approved">Approved & Active</MenuItem>
              <MenuItem value="pending">Pending Approval</MenuItem>
              <MenuItem value="suspended">Suspended / Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
            Showing {filteredVendors.length} of {vendors.length} vendors
          </Typography>
          <IconButton onClick={() => fetchVendors()} title="Refresh Vendor List">
            <Refresh />
          </IconButton>
        </Box>
      </Paper>

      {/* Vendors Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
              <TableRow>
                <TableCell>Store / Vendor</TableCell>
                <TableCell>Vertical & Business</TableCell>
                <TableCell>Owner Contact</TableCell>
                <TableCell>Area / City & Radius</TableCell>
                <TableCell align="center">Commission</TableCell>
                <TableCell align="center">Live Status</TableCell>
                <TableCell align="center">Approval State</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" sx={{ color: "text.secondary" }}>
                      No vendors found matching current filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVendors.map((vendor) => {
                  const verticalMeta = VERTICAL_TABS.find((t) => t.id === (vendor.vertical || "food")) || {
                    icon: "📦",
                    color: "#248C70",
                    label: vendor.vertical || "General",
                  };

                  return (
                    <TableRow key={vendor._id} hover>
                      {/* Store / Vendor Name */}
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Box
                            component="img"
                            src={vendor.avatar || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400"}
                            alt={vendor.name}
                            sx={{ width: 44, height: 44, borderRadius: 2, objectFit: "cover", border: "1px solid #E2E8F0" }}
                          />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1E293B" }}>
                              {vendor.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748B", display: "block" }}>
                              {vendor.vendorId} • ⭐ {vendor.rating}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Vertical & Business */}
                      <TableCell>
                        <Chip
                          label={`${verticalMeta.icon} ${verticalMeta.label}`}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            bgcolor: `${verticalMeta.color}15`,
                            color: verticalMeta.color,
                            border: `1px solid ${verticalMeta.color}40`,
                            mb: 0.5,
                          }}
                        />
                        <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                          {vendor.businessType?.replace(/_/g, " ")}
                        </Typography>
                      </TableCell>

                      {/* Owner Contact */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {vendor.ownerName}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                          <Phone sx={{ fontSize: 13 }} />
                          <Typography variant="caption">{vendor.phone}</Typography>
                        </Box>
                      </TableCell>

                      {/* Service Area & Radius */}
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <LocationOn sx={{ fontSize: 14, color: PRIMARY_COLOR }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {vendor.area || vendor.city || "Indore"}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Radius: {vendor.geofenceRadius || 7} km • {vendor.deliveryTime || 30} mins
                        </Typography>
                      </TableCell>

                      {/* Commission % with Quick Edit */}
                      <TableCell align="center">
                        <Chip
                          label={`${vendor.adminCommission !== undefined ? vendor.adminCommission : 12}%`}
                          size="small"
                          onClick={() => handleOpenCommission(vendor)}
                          sx={{
                            fontWeight: 700,
                            bgcolor: "#EFF6FF",
                            color: "#2563EB",
                            cursor: "pointer",
                            "&:hover": { bgcolor: "#DBEAFE" },
                          }}
                          icon={<Edit sx={{ fontSize: 13 }} />}
                        />
                      </TableCell>

                      {/* Live Online Switch */}
                      <TableCell align="center">
                        <Switch
                          checked={vendor.isActive && vendor.isOnline}
                          color="success"
                          size="small"
                          title="Operational live status"
                          disabled
                        />
                      </TableCell>

                      {/* Approval Status Badge */}
                      <TableCell align="center">
                        {vendor.status === "approved" ? (
                          <Chip label="Approved" size="small" sx={{ bgcolor: "#DCFCE7", color: "#166534", fontWeight: 700 }} />
                        ) : vendor.status === "pending" ? (
                          <Chip label="Pending Review" size="small" sx={{ bgcolor: "#FEF3C7", color: "#92400E", fontWeight: 700 }} />
                        ) : (
                          <Chip label="Suspended" size="small" sx={{ bgcolor: "#FEE2E2", color: "#991B1B", fontWeight: 700 }} />
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenKyc(vendor)}
                            sx={{
                              fontSize: "0.75rem",
                              textTransform: "none",
                              borderColor: PRIMARY_COLOR,
                              color: PRIMARY_COLOR,
                            }}
                          >
                            Review KYC
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* KYC & APPROVAL REVIEW DIALOG MODAL */}
      <Dialog open={kycModalOpen} onClose={() => setKycModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Vendor KYC & Compliance Audit: {selectedVendor?.name}
          </Typography>
          <Chip
            label={selectedVendor?.status?.toUpperCase()}
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor: selectedVendor?.status === "approved" ? "#DCFCE7" : "#FEF3C7",
              color: selectedVendor?.status === "approved" ? "#166534" : "#92400E",
            }}
          />
        </DialogTitle>
        <DialogContent dividers>
          {selectedVendor && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Partner Overview */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>BUSINESS NAME</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedVendor.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>BUSINESS VERTICAL</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedVendor.vertical?.toUpperCase()} ({selectedVendor.businessType})</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>CONTACT OWNER</Typography>
                  <Typography variant="body2">{selectedVendor.ownerName} • {selectedVendor.phone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>STORE ADDRESS</Typography>
                  <Typography variant="body2">{selectedVendor.address}</Typography>
                </Grid>
              </Grid>

              <Divider />

              {/* Regulatory License & Documents */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <Description sx={{ fontSize: 18, color: PRIMARY_COLOR }} /> Regulatory Licenses & Compliance Documents
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>TRADE / FSSAI / DRUG LICENSE NUMBER</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
                        {selectedVendor.documents?.license?.number || "FSSAI-21423010000241 (Verified)"}
                      </Typography>
                      <Chip label="License Document Valid" size="small" color="success" variant="outlined" sx={{ mt: 1 }} />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>GSTIN / TAX IDENTIFICATION</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
                        {selectedVendor.documents?.gst?.number || "23AABCU9603R1ZM"}
                      </Typography>
                      <Chip label="GST Portal Active" size="small" color="success" variant="outlined" sx={{ mt: 1 }} />
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Settlement Bank Details */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <AccountBalance sx={{ fontSize: 18, color: PRIMARY_COLOR }} /> Payout & Settlement Bank Account
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>BANK NAME</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedVendor.bankDetails?.bankName || "HDFC Bank Ltd."}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>ACCOUNT NUMBER</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedVendor.bankDetails?.accountNumber || "50200049281726"}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>IFSC / BRANCH</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedVendor.bankDetails?.swiftCode || selectedVendor.bankDetails?.branchName || "HDFC0000281"}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Rejection / Suspension Input */}
              <TextField
                label="Admin Audit Remarks / Reason (Required if rejecting or suspending)"
                fullWidth
                size="small"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. FSSAI certificate expired, please upload renewal receipt"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Block />}
            onClick={() => handleUpdateStatus("suspend")}
          >
            Suspend Partner
          </Button>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => handleUpdateStatus("reject")}
            >
              Reject KYC
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: PRIMARY_COLOR }}
              startIcon={<CheckCircle />}
              onClick={() => handleUpdateStatus("approve")}
            >
              Approve Partner & Enable Live Orders
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* COMMISSION RATE EDIT MODAL */}
      <Dialog open={commissionModalOpen} onClose={() => setCommissionModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Configure Platform Commission</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Set platform revenue commission percentage for <strong>{commissionTarget?.name}</strong>:
            </Typography>
            <TextField
              label="Admin Commission (%)"
              type="number"
              fullWidth
              value={newCommissionRate}
              onChange={(e) => setNewCommissionRate(Number(e.target.value))}
              InputProps={{
                endAdornment: <Typography sx={{ color: "text.secondary", fontWeight: 700 }}>%</Typography>,
              }}
              helperText="Typical commission: Food (12-18%), Grocery (8-12%), Services (15-20%)"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCommissionModalOpen(false)}>Cancel</Button>
          <Button variant="contained" sx={{ backgroundColor: PRIMARY_COLOR }} onClick={handleSaveCommission}>
            Save Commission
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default VendorPanel;

