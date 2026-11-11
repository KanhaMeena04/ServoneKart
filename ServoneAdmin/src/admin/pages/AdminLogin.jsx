import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../api/auth.js';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Lock, User, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const AdminLogin = () => {
  const { login, loading, error, success } = useAdminAuth();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!success) return;
    if (user && user.role === 'admin') {
      navigate('/dashboard');
    } else if (user && (user.role === 'restaurant_owner' || user.role === 'vendor')) {
      navigate('/vendor/portal');
    } else {
      navigate('/');
    }
  }, [success, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loggedUser = await login(loginId, password);
    if (!loggedUser) return;
    if (loggedUser.role === "admin") {
      navigate("/dashboard");
    } else if (loggedUser.role === "restaurant_owner" || loggedUser.role === "vendor") {
      navigate("/vendor/portal");
    } else {
      navigate("/");
    }
  };

  // Direct One-Click Demo Super Admin Sign In (authenticates via real API)
  const handleDemoLogin = async () => {
    setLoginId("admin@gmail.com");
    setPassword("admin123");

    const loggedUser = await login("admin@gmail.com", "admin123");
    if (!loggedUser) return;
    if (loggedUser.role === "admin") {
      navigate("/dashboard");
    } else if (loggedUser.role === "restaurant_owner" || loggedUser.role === "vendor") {
      navigate("/vendor/portal");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8faff]">
      
      {/* LEFT COLUMN: Deep Royal Electric Blue Banner (Tricelyn Theme) */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#021b44] via-[#0047cc] to-[#0055ff] text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Tag */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold tracking-wide backdrop-blur-sm shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse"></span>
            TRICELYN MASTER SUPER ADMIN
          </div>
        </div>

        {/* Middle Main Content */}
        <div className="relative z-10 my-10 lg:my-0 max-w-xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white mb-5 font-heading">
            Tricelyn Multi-Vendor Grocery &amp; Quick-Commerce Control Tower
          </h1>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-normal">
            Master Super Admin operations hub: manage multi-vendor grocery stores, dark store inventory, RBAC partner credentials, dynamic delivery verticals, GST invoicing, and live rider fleet across regions.
          </p>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">Multi-Vendor</div>
            <div className="text-xs text-blue-200 mt-0.5">Role-Based Access Control</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">10-15 Mins</div>
            <div className="text-xs text-blue-200 mt-0.5">Live Rider Routing</div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">100% Dynamic</div>
            <div className="text-xs text-blue-200 mt-0.5">Real-Time Store &amp; Catalog Sync</div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Clean White Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-[#f8faff]">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,85,255,0.08)] border border-blue-100">
          
          {/* Logo Header */}
          <div className="text-left mb-6">
            <div className="mb-4">
              {/* Branded Dark Blue Container so White Logo is 100% Clearly Visible */}
              <div className="inline-flex items-center bg-[#021b44] px-4 py-2.5 rounded-2xl border border-blue-400/40 shadow-sm">
                <img 
                  src="/logo.png" 
                  alt="Tricelyn Logo" 
                  className="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 hover:scale-105" 
                />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight font-heading">
              Welcome Super Admin
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
              Sign in as Master Super Admin to control stores, inventory, billing &amp; delivery operations
            </p>
          </div>

          {/* Quick Demo Credentials Pill */}
          <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 text-xs text-blue-900 flex items-center justify-between mb-5">
            <div>
              <span className="font-bold text-gray-700">Default Admin: </span>
              <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-blue-100 font-bold text-blue-700">admin@gmail.com</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-blue-100 font-bold text-blue-700">admin123</span>
            </div>
            <button
              type="button"
              onClick={() => { setLoginId("admin@gmail.com"); setPassword("admin123"); }}
              className="text-[11px] font-black text-[#0055ff] hover:underline cursor-pointer"
            >
              Auto-fill
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Login ID: Email Address or Mobile Number */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5" htmlFor="loginId">
                Login ID (Email or Mobile Number)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4 text-[#0055ff]" />
                </div>
                <input
                  id="loginId"
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="admin@gmail.com or 9876543210"
                  required
                  disabled={loading}
                  style={{ color: '#0f172a', WebkitTextFillColor: '#0f172a', backgroundColor: '#FFFFFF' }}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 font-semibold focus:ring-2 focus:ring-blue-100 focus:border-[#0055ff] focus:outline-none transition duration-200 shadow-xs"
                />
              </div>
            </div>

            {/* Password / PIN */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5" htmlFor="password">
                Password or Security PIN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4 text-[#0055ff]" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••••••• or PIN"
                  required
                  disabled={loading}
                  style={{ color: '#0f172a', WebkitTextFillColor: '#0f172a', backgroundColor: '#FFFFFF' }}
                  className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 font-semibold focus:ring-2 focus:ring-blue-100 focus:border-[#0055ff] focus:outline-none transition duration-200 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#0055ff] focus:outline-none transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 shadow-xs flex items-center gap-2">
                <span className="shrink-0 font-bold">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 shadow-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Login successful! Opening dashboard...</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-6 rounded-xl font-black text-sm text-white shadow-md transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer ${
                loading
                  ? 'bg-[#0055ff]/70 cursor-not-allowed shadow-none'
                  : 'bg-[#0055ff] hover:bg-[#0043c7] shadow-blue-500/25'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Enter Dashboard Console</span>
              )}
            </button>

            {/* ONE-CLICK DEMO SUPER ADMIN LOGIN BUTTON */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-3 px-5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-[#0055ff] border border-blue-200 transition-all flex items-center justify-center gap-2 active:scale-[0.99] shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#0055ff]" />
              <span>One-Click Demo Super Admin Sign In</span>
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-400 font-medium">
              Tricelyn Hyperlocal Platform &copy; 2026 &bull; Central Operations Hub
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
