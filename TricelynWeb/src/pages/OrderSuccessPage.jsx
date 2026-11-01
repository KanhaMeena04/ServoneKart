import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Clock, ShieldCheck, ShoppingBag } from 'lucide-react';

const OrderSuccessPage = () => {
  const { orderId } = useParams();

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
      
      {/* Animated Success Badge */}
      <div className="w-20 h-20 rounded-full bg-green-100 text-accent-green mx-auto flex items-center justify-center animate-bounce shadow-md">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-black uppercase tracking-wider text-accent-greenDark bg-green-50 px-3 py-1 rounded-full">
          Order Placed Successfully
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
          Your Groceries are on the way!
        </h1>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          We have received your order. Our team in Indore is already packing your fresh items for delivery.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 text-left">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <span className="text-xs text-gray-500 font-medium">Order Number:</span>
          <span className="text-xs font-black text-gray-900">#{orderId}</span>
        </div>

        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <span className="text-xs text-gray-500 font-medium">Estimated Delivery:</span>
          <span className="text-xs font-black text-accent-green flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>10 - 15 Minutes</span>
          </span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 font-medium">Payment Mode:</span>
          <span className="font-bold text-gray-800">Cash on Delivery / UPI</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Link
          to={`/track/${orderId}`}
          className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
        >
          <span>Track Live Order & Rider on Map</span>
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
        <span>Tricelyn Superfast 10-15 Min Guarantee in Indore</span>
      </div>

    </div>
  );
};

export default OrderSuccessPage;

