import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../utils/utils";
import {
  Cake,
  CardGiftcard,
  Celebration,
  Schedule,
  Refresh,
  AttachMoney
} from "@mui/icons-material";

export default function GiftsWorkspace() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalPartners: 0
  });
  const [orders, setOrders] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const overviewRes = await axios.get(`${API_BASE_URL}/api/v1/admin/workspaces/gifts_bakery/overview?city=Indore`, { headers });
      if (overviewRes.data?.success) setMetrics(overviewRes.data.data.metrics || {});

      const ordersRes = await axios.get(`${API_BASE_URL}/api/v1/admin/workspaces/gifts_bakery/orders`, { headers });
      if (ordersRes.data?.success) setOrders(ordersRes.data.data.orders || []);
    } catch (err) {
      console.error("Error loading gifts workspace:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-100 text-pink-700 rounded-xl">
            <Cake fontSize="large" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Bakery, Cakes & Gifts Control Tower</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-pink-100 text-pink-800 rounded-full">Indore Celebrations</span>
            </div>
            <p className="text-sm text-slate-500">Custom fresh cakes, flowers, celebration hampers & scheduled surprise deliveries</p>
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
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Cake & Gift Orders</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{metrics.totalOrders}</h3>
            <span className="text-xs text-pink-600 font-medium">Delivered & Scheduled</span>
          </div>
          <div className="p-3 bg-pink-50 text-pink-600 rounded-xl"><CardGiftcard /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Bakery Prep</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{metrics.activeOrders}</h3>
            <span className="text-xs text-amber-600 font-medium">Baking & Packing</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Celebration /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Partner Bakeries & Florists</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{metrics.totalPartners}</h3>
            <span className="text-xs text-slate-500 font-medium">Verified Indore Vendors</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Cake /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Celebration GMV</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">₹{metrics.totalRevenue?.toLocaleString('en-IN')}</h3>
            <span className="text-xs text-emerald-600 font-medium">Delivered Sales</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><AttachMoney /></div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 p-4">
          <h3 className="font-bold text-slate-800">Cakes, Bakery & Gifts Orders ({orders.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Store</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Order Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr><td colSpan="6" className="text-center p-8 text-slate-400">No bakery & gift orders found.</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-medium text-slate-900">{o.orderNumber}</td>
                    <td className="p-4 font-medium text-slate-900">{o.customerName}</td>
                    <td className="p-4 text-slate-700">{o.restaurantName}</td>
                    <td className="p-4 font-semibold text-slate-900">₹{o.totalAmount}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-pink-100 text-pink-800 rounded-full">{o.orderStatus}</span>
                    </td>
                    <td className="p-4 text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

