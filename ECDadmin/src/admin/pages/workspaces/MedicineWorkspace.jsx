import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../utils/utils";
import {
  LocalHospital,
  Description,
  Verified,
  Healing,
  Refresh,
  Search,
  CheckCircle,
  Cancel
} from "@mui/icons-material";

export default function MedicineWorkspace() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalPartners: 0,
    activePartners: 0
  });
  const [orders, setOrders] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [activeTab, setActiveTab] = useState("prescriptions"); // "prescriptions" | "orders" | "pharmacies"

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const overviewRes = await axios.get(`${API_BASE_URL}/api/v1/admin/workspaces/medicine/overview?city=Indore`, { headers });
      if (overviewRes.data?.success) setMetrics(overviewRes.data.data.metrics || {});

      const ordersRes = await axios.get(`${API_BASE_URL}/api/v1/admin/workspaces/medicine/orders`, { headers });
      if (ordersRes.data?.success) setOrders(ordersRes.data.data.orders || []);

      const pharmRes = await axios.get(`${API_BASE_URL}/api/v1/admin/workspaces/medicine/partners`, { headers });
      if (pharmRes.data?.success) setPharmacies(pharmRes.data.data.partners || []);
    } catch (err) {
      console.error("Error loading medicine workspace:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const prescriptionOrders = orders.filter(o => Boolean(o.prescriptionUrl));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 text-red-700 rounded-xl">
            <LocalHospital fontSize="large" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Medicine & Pharmacy Control Tower</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Indore Healthcare</span>
            </div>
            <p className="text-sm text-slate-500">Prescription verification queue, licensed pharmacies, OTC orders & compliance audits</p>
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
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pharmacy Orders</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{metrics.totalOrders}</h3>
            <span className="text-xs text-red-600 font-medium">Prescriptions + OTC</span>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl"><Healing /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Prescriptions</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{prescriptionOrders.length}</h3>
            <span className="text-xs text-amber-600 font-medium">Awaiting Pharmacist Check</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Description /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Licensed Pharmacies</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{metrics.totalPartners}</h3>
            <span className="text-xs text-emerald-600 font-medium">Indore Licensed Chemists</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Verified /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Medicine GMV</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">₹{metrics.totalRevenue?.toLocaleString('en-IN')}</h3>
            <span className="text-xs text-slate-500 font-medium">Delivered Healthcare</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><LocalHospital /></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 p-4 flex gap-2">
          <button
            onClick={() => setActiveTab("prescriptions")}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
              activeTab === "prescriptions" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Prescription Review Queue ({prescriptionOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
              activeTab === "orders" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Medicine Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("pharmacies")}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
              activeTab === "pharmacies" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Pharmacies ({pharmacies.length})
          </button>
        </div>

        {/* Tab 1: Prescriptions */}
        {activeTab === "prescriptions" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">RX ID</th>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Pharmacy</th>
                  <th className="p-4">Prescription Document</th>
                  <th className="p-4">Review Status</th>
                  <th className="p-4">Uploaded At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prescriptionOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-slate-400">
                      No prescriptions pending review.
                    </td>
                  </tr>
                ) : (
                  prescriptionOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-medium text-slate-900">{o.orderNumber || o._id?.slice(-8)}</td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{o.customerName || "Patient"}</div>
                        <div className="text-xs text-slate-400">{o.customerPhone}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-700">{o.restaurantName || "Partner Chemist"}</td>
                      <td className="p-4">
                        <a
                          href={o.prescriptionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Description fontSize="small" /> View Rx File
                        </a>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                          o.prescriptionVerification?.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          o.prescriptionVerification?.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.prescriptionVerification?.status || 'Pending Verification'}
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

        {/* Tab 2: All Orders */}
        {activeTab === "orders" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Pharmacy</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr><td colSpan="6" className="text-center p-8 text-slate-400">No pharmacy orders found.</td></tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-medium text-slate-900">{o.orderNumber}</td>
                      <td className="p-4 font-medium text-slate-900">{o.customerName}</td>
                      <td className="p-4 text-slate-700">{o.restaurantName}</td>
                      <td className="p-4 font-semibold text-slate-900">₹{o.totalAmount}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-800 rounded-full">{o.orderStatus}</span>
                      </td>
                      <td className="p-4 text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
