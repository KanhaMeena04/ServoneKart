import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../utils/utils";
import {
  Storefront,
  ShoppingCart,
  AttachMoney,
  Inventory,
  Search,
  Refresh,
  CheckCircle,
  HourglassEmpty,
  LocalShipping,
  FilterList
} from "@mui/icons-material";

export default function GroceryWorkspace() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalPartners: 0,
    activePartners: 0
  });
  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "stores" | "inventory"
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Fetch Overview Metrics
      const overviewRes = await axios.get(`${API_BASE_URL}/api/v1/admin/workspaces/grocery/overview?city=Indore`, { headers });
      if (overviewRes.data?.success) {
        setMetrics(overviewRes.data.data.metrics || {});
      }

      // 2. Fetch Orders
      const ordersRes = await axios.get(`${API_BASE_URL}/api/v1/admin/workspaces/grocery/orders?status=${statusFilter}&search=${searchTerm}`, { headers });
      if (ordersRes.data?.success) {
        setOrders(ordersRes.data.data.orders || []);
      }

      // 3. Fetch Grocery Stores
      const storesRes = await axios.get(`${API_BASE_URL}/api/v1/admin/workspaces/grocery/partners?search=${searchTerm}`, { headers });
      if (storesRes.data?.success) {
        setStores(storesRes.data.data.partners || []);
      }
    } catch (err) {
      console.error("Error loading grocery workspace data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Workspace Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <Storefront fontSize="large" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Grocery Control Tower</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">Indore Zone</span>
            </div>
            <p className="text-sm text-slate-500">Manage hyper-local marts, inventory levels, order dispatches & substitutions</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
        >
          <Refresh fontSize="small" className={loading ? "animate-spin" : ""} /> Refresh Live Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Grocery Orders</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{metrics.totalOrders}</h3>
            <span className="text-xs text-emerald-600 font-medium">All-time processed</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ShoppingCart />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Dispatches</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{metrics.activeOrders}</h3>
            <span className="text-xs text-amber-600 font-medium">Picking, Packing & En-route</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <HourglassEmpty />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivered GMV</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">₹{metrics.totalRevenue?.toLocaleString('en-IN')}</h3>
            <span className="text-xs text-emerald-600 font-medium">Settled Grocery Sales</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <AttachMoney />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Partner Stores</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{metrics.totalPartners}</h3>
            <span className="text-xs text-slate-500 font-medium">{metrics.activePartners} currently online</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Inventory />
          </div>
        </div>
      </div>

      {/* Main Workspace Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                activeTab === "orders" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Grocery Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("stores")}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                activeTab === "stores" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Partner Stores ({stores.length})
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search orders or stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="absolute left-2.5 top-2.5 text-slate-400" fontSize="small" />
            </div>
            <button type="submit" className="px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700">
              Filter
            </button>
          </form>
        </div>

        {/* Tab 1: Orders Table */}
        {activeTab === "orders" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Store</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center p-8 text-slate-400">
                      No grocery orders found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-medium text-slate-900">{o.orderNumber || o._id?.slice(-8)}</td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{o.customerName || "Customer"}</div>
                        <div className="text-xs text-slate-400">{o.customerPhone || "-"}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-700">{o.restaurantName || o.storeName || "Grocery Partner"}</td>
                      <td className="p-4 font-semibold text-slate-900">₹{o.totalAmount || 0}</td>
                      <td className="p-4 uppercase text-xs font-semibold text-slate-600">{o.paymentMethod || "COD"}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          o.orderStatus === "Delivered" ? "bg-emerald-100 text-emerald-800" :
                          o.orderStatus === "Placed" ? "bg-blue-100 text-blue-800" :
                          o.orderStatus === "Cancelled" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {o.orderStatus || "Pending"}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-400">{new Date(o.createdAt).toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Partner Stores */}
        {activeTab === "stores" && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.length === 0 ? (
              <div className="col-span-full text-center p-8 text-slate-400">No grocery store partners registered yet.</div>
            ) : (
              stores.map((s) => (
                <div key={s._id} className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">{s.name}</h4>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${s.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                      {s.isActive ? "Online" : "Offline"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{s.address || "Indore, MP"}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <span>Rating: ★ {s.rating || "4.5"}</span>
                    <span>Min Order: ₹{s.minOrderAmount || 100}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

