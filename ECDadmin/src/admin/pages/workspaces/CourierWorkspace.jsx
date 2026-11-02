import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../utils/utils";
import {
  LocalShipping,
  Send,
  Navigation,
  Key,
  Refresh,
  AttachMoney,
  CheckCircle,
  HourglassEmpty
} from "@mui/icons-material";

export default function CourierWorkspace() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  });
  const [tasks, setTasks] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const overviewRes = await axios.get(`${API_BASE_URL}/api/v1/admin/workspaces/courier/overview?city=Indore`, { headers });
      if (overviewRes.data?.success) setMetrics(overviewRes.data.data.metrics || {});

      const ordersRes = await axios.get(`${API_BASE_URL}/api/v1/admin/workspaces/courier/orders`, { headers });
      if (ordersRes.data?.success) setTasks(ordersRes.data.data.orders || []);
    } catch (err) {
      console.error("Error loading courier workspace:", err);
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
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
            <LocalShipping fontSize="large" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Courier & Parcel Control Tower</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">Indore Drop Network</span>
            </div>
            <p className="text-sm text-slate-500">Real-time parcel dispatches, pickup/drop addresses, OTP handoffs & weight pricing</p>
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
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Courier Tasks</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{metrics.totalOrders}</h3>
            <span className="text-xs text-amber-600 font-medium">All completed & in-transit</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><LocalShipping /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active In-Transit</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{metrics.activeOrders}</h3>
            <span className="text-xs text-blue-600 font-medium">Delivery Partners en-route</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Navigation /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivered Parcels</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{metrics.completedOrders}</h3>
            <span className="text-xs text-emerald-600 font-medium">Verified by Delivery OTP</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Courier Fare GMV</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">₹{metrics.totalRevenue?.toLocaleString('en-IN')}</h3>
            <span className="text-xs text-slate-500 font-medium">Settled Delivery Fees</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><AttachMoney /></div>
        </div>
      </div>

      {/* Dispatches Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 p-4">
          <h3 className="font-bold text-slate-800">Live Parcel Dispatches ({tasks.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Tracking No</th>
                <th className="p-4">Sender / Customer</th>
                <th className="p-4">Pickup Address</th>
                <th className="p-4">Drop Address</th>
                <th className="p-4">Parcel Specs</th>
                <th className="p-4">OTPs (Pickup / Drop)</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-slate-400">
                    No active courier parcel tasks found.
                  </td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-medium text-slate-900">{t.orderNumber}</td>
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{t.customerName}</div>
                      <div className="text-xs text-slate-400">{t.customerPhone}</div>
                    </td>
                    <td className="p-4 text-xs max-w-xs truncate text-slate-700">
                      {t.parcelDetails?.pickupAddress?.addressLine || t.parcelDetails?.pickupAddress?.city || "Indore Pickup"}
                    </td>
                    <td className="p-4 text-xs max-w-xs truncate text-slate-700">
                      {t.parcelDetails?.dropAddress?.addressLine || t.parcelDetails?.dropAddress?.city || "Indore Drop"}
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-slate-900">{t.parcelDetails?.weightKg || 1} kg</span>
                      <div className="text-xs text-slate-400 capitalize">{t.parcelDetails?.parcelType || "Package"}</div>
                    </td>
                    <td className="p-4 font-mono text-xs">
                      <span className="text-emerald-700 font-bold">{t.pickupOtp || "----"}</span>
                      <span className="text-slate-300 mx-1">/</span>
                      <span className="text-blue-700 font-bold">{t.deliveryOtp || "----"}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        t.orderStatus === "Delivered" ? "bg-emerald-100 text-emerald-800" :
                        t.orderStatus === "Picked Up" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {t.orderStatus}
                      </span>
                    </td>
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

