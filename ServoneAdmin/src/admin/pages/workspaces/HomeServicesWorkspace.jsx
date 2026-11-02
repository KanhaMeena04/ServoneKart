import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../utils/utils";
import {
  Build,
  Assignment,
  VerifiedUser,
  Engineering,
  Search,
  Refresh,
  CalendarToday,
  Schedule,
  CheckCircle,
  HourglassEmpty
} from "@mui/icons-material";

export default function HomeServicesWorkspace() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalPartners: 0,
    activePartners: 0
  });
  const [activeTab, setActiveTab] = useState("bookings"); // "bookings" | "technicians" | "catalog"
  const [bookings, setBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const overviewRes = await axios.get(`${API_BASE_URL}/api/v1/admin/workspaces/home_services/overview?city=Indore`, { headers });
      if (overviewRes.data?.success) {
        setMetrics(overviewRes.data.data.metrics || {});
      }

      const bookingsRes = await axios.get(`${API_BASE_URL}/api/v1/admin/workspaces/home_services/orders?status=${statusFilter}&search=${searchTerm}`, { headers });
      if (bookingsRes.data?.success) {
        setBookings(bookingsRes.data.data.orders || []);
      }

      const techRes = await axios.get(`${API_BASE_URL}/api/v1/admin/workspaces/home_services/partners?search=${searchTerm}`, { headers });
      if (techRes.data?.success) {
        setTechnicians(techRes.data.data.partners || []);
      }
    } catch (err) {
      console.error("Error loading home services workspace:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
            <Build fontSize="large" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Home Services Control Tower</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">Indore Operations</span>
            </div>
            <p className="text-sm text-slate-500">Service appointments, verified technicians, quotation approvals & job completions</p>
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
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Bookings</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{metrics.totalOrders}</h3>
            <span className="text-xs text-blue-600 font-medium">All service categories</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Assignment />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Jobs</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{metrics.activeOrders}</h3>
            <span className="text-xs text-amber-600 font-medium">In-progress & inspecting</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <HourglassEmpty />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Pros</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{metrics.totalPartners}</h3>
            <span className="text-xs text-emerald-600 font-medium">Electricians, Plumbers, AC Techs</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Engineering />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Service GMV</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">₹{metrics.totalRevenue?.toLocaleString('en-IN')}</h3>
            <span className="text-xs text-emerald-600 font-medium">Inspections & Quotations</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <CheckCircle />
          </div>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                activeTab === "bookings" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Service Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab("technicians")}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                activeTab === "technicians" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Service Technicians ({technicians.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Bookings */}
        {activeTab === "bookings" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Appointment Slot</th>
                  <th className="p-4">Technician</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Completion OTP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center p-8 text-slate-400">
                      No home service bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-medium text-slate-900">{b.bookingNumber || b._id?.slice(-8)}</td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{b.customerName || "Customer"}</div>
                        <div className="text-xs text-slate-400">{b.customerPhone || "-"}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg capitalize">
                          {b.category?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-800 font-medium">{new Date(b.scheduledDate).toLocaleDateString('en-IN')}</div>
                        <div className="text-xs text-slate-400">{b.timeSlot}</div>
                      </td>
                      <td className="p-4">
                        {b.providerName ? (
                          <div className="font-medium text-slate-900">{b.providerName}</div>
                        ) : (
                          <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">Unassigned</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          b.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                          b.status === "requested" ? "bg-blue-100 text-blue-800" :
                          b.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {b.status?.replace('_', ' ') || "Requested"}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-700">{b.completionOtp || "----"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Technicians */}
        {activeTab === "technicians" && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicians.length === 0 ? (
              <div className="col-span-full text-center p-8 text-slate-400">No technicians registered yet.</div>
            ) : (
              technicians.map((t) => (
                <div key={t._id} className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">{t.name}</h4>
                      <p className="text-xs text-blue-600 capitalize font-medium">{t.primaryCategory?.replace('_', ' ')} Specialist</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${t.isVerified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {t.isVerified ? "Verified" : "Pending KYC"}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-slate-600 flex justify-between pt-2 border-t border-slate-100">
                    <span>Phone: {t.phone}</span>
                    <span>Rating: ★ {t.rating || "4.8"}</span>
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

