import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Clock, ShieldCheck, Store } from 'lucide-react';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const state = location.state || {};
  const splitOrders = Array.isArray(state.orders) ? state.orders : [];
  const splitCount = state.splitCount || splitOrders.length || 1;
  const paymentModeLabel =
    String(state.paymentMethod || '').toLowerCase() === 'online'
      ? 'Online Payment'
      : 'Cash / UPI on Delivery';

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-green-100 text-accent-green mx-auto flex items-center justify-center shadow-md">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-black uppercase tracking-wider text-accent-greenDark bg-green-50 px-3 py-1 rounded-full">
          {splitCount > 1 ? `Placed across ${splitCount} Partner Stores` : 'Order Placed Successfully'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
          Your Groceries are on the way!
        </h1>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          We have dispatched your order to {splitCount > 1 ? `${splitCount} verified partner stores` : 'your selected dark store'} for rapid packing.
        </p>
      </div>

      {/* Primary Order Info Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 text-left">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <span className="text-xs text-gray-500 font-medium">Primary Order ID:</span>
          <span className="text-xs font-black text-gray-900">#{splitOrders[0]?.orderNumber || orderId}</span>
        </div>

        {state.fulfilmentGroup && (
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <span className="text-xs text-gray-500 font-medium">Fulfilment Group:</span>
            <span className="text-xs font-mono font-bold text-[#0055ff]">{state.fulfilmentGroup}</span>
          </div>
        )}

        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <span className="text-xs text-gray-500 font-medium">Estimated Delivery:</span>
          <span className="text-xs font-black text-accent-green flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>10 - 15 Minutes</span>
          </span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 font-medium">Payment Mode:</span>
          <span className="font-bold text-gray-800">{paymentModeLabel}</span>
        </div>
      </div>

      {/* Multi-Vendor Split Sub-Orders List */}
      {splitOrders.length > 1 && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm text-left space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
            Vendor Shipments ({splitOrders.length})
          </h3>
          <div className="divide-y divide-gray-100">
            {splitOrders.map((ord) => (
              <div key={ord._id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-extrabold text-gray-900 truncate">
                    <Store className="w-3.5 h-3.5 text-[#0055ff] flex-shrink-0" />
                    <span className="truncate">{ord.storeName || ord.restaurantName || 'Partner Store'}</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {ord.items?.length || 0} items · ₹{Number(ord.totalAmount || 0).toFixed(0)} · Pickup OTP: {ord.pickupOtp || 'Pending'}
                  </p>
                </div>
                <Link
                  to={`/track/${ord._id}`}
                  className="px-3 py-1.5 bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white rounded-xl font-bold transition flex-shrink-0"
                >
                  Track
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Link
          to={`/track/${orderId}`}
          className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
        >
          <span>Track Live Order Status</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          to="/"
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold transition block"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-2">
        <ShieldCheck className="w-4 h-4 text-green-600" />
        <span>Tricelyn Multi-Vendor Quick Commerce</span>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
