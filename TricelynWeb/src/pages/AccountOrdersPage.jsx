import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Package, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Plus, 
  Trash2, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderService, userService } from '../services/api';

const AccountOrdersPage = () => {
  const location = useLocation();
  const activeTab = location.pathname.includes('/addresses') ? 'addresses' : 'orders';
  const { user, isAuthenticated, setIsAuthModalOpen } = useAuth();

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Address form modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newTitle, setNewTitle] = useState('Home');
  const [newAddress, setNewAddress] = useState('');
  const [newLandmark, setNewLandmark] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [ordersRes, addrRes] = await Promise.allSettled([
          orderService.getMyOrders(),
          userService.getAddresses(),
        ]);

        if (ordersRes.status === 'fulfilled' && ordersRes.value.data) {
          const list = ordersRes.value.data.orders || ordersRes.value.data.data || [];
          setOrders(list);
        }

        if (addrRes.status === 'fulfilled' && addrRes.value.data) {
          const addrs = addrRes.value.data.addresses || addrRes.value.data.data || [];
          setAddresses(addrs);
        }
      } catch (err) {
        console.error('Error fetching account data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, setIsAuthModalOpen]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.trim()) return;

    try {
      const payload = {
        title: newTitle,
        address: `${newAddress}${newLandmark ? ', Near ' + newLandmark : ''}, Indore`,
        city: 'Indore',
      };
      const res = await userService.addAddress(payload);
      if (res.data) {
        setAddresses([...addresses, res.data.address || payload]);
        setShowAddressModal(false);
        setNewAddress('');
        setNewLandmark('');
      }
    } catch (e) {
      // Local fallback
      setAddresses([...addresses, { title: newTitle, address: newAddress, city: 'Indore', _id: Date.now() }]);
      setShowAddressModal(false);
    }
  };

  const getStatusBadge = (status) => {
    const st = (status || '').toLowerCase();
    if (st === 'delivered' || st === 'completed') {
      return <span className="bg-green-100 text-green-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Delivered</span>;
    }
    if (st === 'cancelled') {
      return <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Cancelled</span>;
    }
    return <span className="bg-blue-100 text-brand-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">In Progress</span>;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Groceries</span>
        </Link>
        <h1 className="text-2xl font-black text-gray-900">My Account</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {user?.name || 'Tricelyn Customer'} ({user?.phone || '+91 98260 00000'}) · Indore, MP
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-gray-200">
        <Link
          to="/account/orders"
          className={`pb-3 text-xs font-extrabold uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </Link>

        <Link
          to="/account/addresses"
          className={`pb-3 text-xs font-extrabold uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
            activeTab === 'addresses'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({addresses.length})</span>
        </Link>
      </div>

      {/* Tab 1: Orders List */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord._id}
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:border-brand-200 transition space-y-3"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="text-xs font-black text-gray-900">#{ord._id}</span>
                  <p className="text-[11px] text-gray-400">
                    {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(ord.status)}
                  <Link
                    to={`/track/${ord._id}`}
                    className="px-3.5 py-1.5 bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>Track Order</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Items summary */}
              <div className="text-xs text-gray-600">
                {(ord.items || []).map((it, idx) => (
                  <span key={idx} className="mr-2">
                    {it.name || it.product?.name || 'Item'} (×{it.quantity})
                    {idx < (ord.items || []).length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 text-xs font-black text-gray-900">
                <span>Total Amount Paid:</span>
                <span className="text-sm text-brand-600">₹{(ord.totalAmount || 0).toFixed(0)}</span>
              </div>
            </div>
          ))}

          {orders.length === 0 && !loading && (
            <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-gray-100 p-8 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-brand-600 mx-auto flex items-center justify-center font-bold text-xl">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">No orders yet</h3>
              <p className="text-xs text-gray-500">
                You haven't placed any orders yet. Try our superfast 10-15 min grocery delivery!
              </p>
              <Link
                to="/"
                className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition"
              >
                Start Shopping Now
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">Your Saved Indore Addresses</h3>
            <button
              onClick={() => setShowAddressModal(true)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr, idx) => (
              <div
                key={addr._id || idx}
                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md">
                      {addr.title || 'Home'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 mt-1">{addr.address}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{addr.city || 'Indore'}, MP</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-gray-900">Add New Address in Indore</h3>
            <form onSubmit={handleAddAddress} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Address Label</label>
                <div className="flex gap-2">
                  {['Home', 'Work', 'Other'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewTitle(t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                        newTitle === t ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Complete Address *</label>
                <textarea
                  required
                  rows={3}
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Flat/House No, Building, Street, Area (e.g. Scheme 54, Vijay Nagar)"
                  className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 resize-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={newLandmark}
                  onChange={(e) => setNewLandmark(e.target.value)}
                  placeholder="Near Sayaji Hotel"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 shadow-sm"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountOrdersPage;
