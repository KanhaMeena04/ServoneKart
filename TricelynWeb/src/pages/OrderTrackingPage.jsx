import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Package, 
  Truck, 
  Store, 
  ArrowLeft,
  Send,
  FileText,
  AlertTriangle,
  RefreshCw,
  X
} from 'lucide-react';
import { orderService } from '../services/api';
import socketService from '../services/socket';
import { useCart } from '../context/CartContext';
import InvoiceModal from '../components/InvoiceModal';

const extractName = (val, fallback = 'Partner Store') => {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  return val.en || Object.values(val)[0] || fallback;
};

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const { setActiveOrderId } = useCart();

  const [order, setOrder] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [eta, setEta] = useState('10-15 minutes');
  const [riderMessage, setRiderMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Invoice & Cancel modals
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Placed order by mistake');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [isCancelled, setIsCancelled] = useState(false);

  const pipelineSteps = [
    { id: 1, key: 'placed', label: 'Order Placed' },
    { id: 2, key: 'accepted', label: 'Store Accepted' },
    { id: 3, key: 'packed', label: 'Packed & Ready' },
    { id: 4, key: 'out_for_delivery', label: 'Out for Delivery' },
    { id: 5, key: 'delivered', label: 'Delivered' },
  ];

  const fetchOrderDetails = useCallback(async () => {
    try {
      const res = await orderService.getOrderById(orderId);
      const ord = res.data?.order || res.data?.data;
      if (!ord) {
        throw new Error('Order details were empty');
      }
      setOrder(ord);
      setFetchError('');

      const st = (ord.status || '').toLowerCase();
      if (st === 'cancelled') {
        setIsCancelled(true);
        setEta('Cancelled');
        return;
      }
      setIsCancelled(false);
      if (st === 'placed' || st === 'pending') {
        setCurrentStep(1);
        setEta('12-15 minutes');
      } else if (st === 'confirmed' || st === 'accepted') {
        setCurrentStep(2);
        setEta('10-14 minutes');
      } else if (st === 'preparing' || st === 'packed' || st === 'ready' || st === 'ready_for_pickup') {
        setCurrentStep(3);
        setEta('8-12 minutes');
      } else if (st === 'picked_up' || st === 'out_for_delivery' || st === 'on_the_way' || st === 'delivery_arrived') {
        setCurrentStep(4);
        setEta('5-8 minutes');
      } else if (st === 'delivered' || st === 'completed') {
        setCurrentStep(5);
        setEta('Delivered');
        setActiveOrderId(null);
      }
    } catch (err) {
      setFetchError(
        err.response?.data?.message ||
          err.message ||
          'Unable to load order tracking information right now.'
      );
    } finally {
      setLoading(false);
    }
  }, [orderId, setActiveOrderId]);

  useEffect(() => {
    setActiveOrderId(orderId);
    fetchOrderDetails();

    socketService.joinOrder(orderId);
    socketService.onOrderStatusUpdate(() => {
      fetchOrderDetails();
    });

    const intervalId = setInterval(fetchOrderDetails, 12000);

    return () => {
      clearInterval(intervalId);
      socketService.leaveOrder(orderId);
    };
  }, [orderId, setActiveOrderId, fetchOrderDetails]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (riderMessage.trim()) {
      setMessageSent(true);
      setRiderMessage('');
      setTimeout(() => setMessageSent(false), 3000);
    }
  };

  const handleCancelOrder = async () => {
    setCancelling(true);
    setCancelError('');
    try {
      await orderService.cancelOrder(orderId, cancelReason);
      setIsCancelled(true);
      setIsCancelModalOpen(false);
      setEta('Cancelled');
      setActiveOrderId(null);
    } catch (e) {
      setCancelError(
        e.response?.data?.message || 'Unable to cancel this order now. Please contact support.'
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading && !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-gray-500">Fetching live order telemetry...</p>
      </div>
    );
  }

  if (fetchError && !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="bg-white rounded-3xl p-8 border border-red-100 shadow-sm space-y-3">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-lg font-black text-gray-900">Order Tracking Unavailable</h2>
          <p className="text-xs text-gray-600">{fetchError}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setLoading(true);
                fetchOrderDetails();
              }}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <Link
              to="/account/orders"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
            >
              My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const storeDisplayName =
    extractName(order?.restaurant?.name) ||
    order?.storeName ||
    order?.restaurantName ||
    'Tricelyn Partner Store';
  const addressDisplay =
    order?.deliveryAddress?.addressLine ||
    order?.deliveryAddress?.fullAddress ||
    order?.deliveryAddress?.address ||
    'Delivery Location';
  const assignedRider = order?.rider && typeof order.rider === 'object' ? order.rider : null;
  const riderDisplayName = assignedRider?.name || order?.riderName || null;
  const riderDisplayPhone = assignedRider?.phone || order?.riderPhone || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Groceries</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
            Delivering to {addressDisplay.split(',')[0]}
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Order #{order?.orderNumber || orderId} · Store: {storeDisplayName}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsInvoiceOpen(true)}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:border-brand-500 rounded-xl text-xs font-bold text-gray-700 hover:text-brand-600 transition flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-brand-600" />
            <span>View Tax Invoice</span>
          </button>

          {!isCancelled && currentStep <= 2 && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-bold text-red-600 transition"
            >
              Cancel Order
            </button>
          )}

          <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border ${
            isCancelled ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
          }`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white ${
              isCancelled ? 'bg-red-500' : 'bg-accent-green'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                isCancelled ? 'text-red-700' : 'text-green-700'
              }`}>
                {isCancelled ? 'Order Cancelled' : 'Live Status'}
              </span>
              <p className={`text-xs font-black ${isCancelled ? 'text-red-900' : 'text-green-900'}`}>
                {isCancelled ? 'Cancelled' : eta}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Pipeline */}
      {!isCancelled ? (
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
          <div className="min-w-[600px] flex items-center justify-between relative">
            {pipelineSteps.map((step, idx) => {
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              return (
                <div key={step.id} className="flex-1 flex flex-col items-center relative z-10">
                  {idx > 0 && (
                    <div 
                      className={`absolute top-4 -left-1/2 w-full h-1 -z-10 transition-colors duration-500 ${
                        step.id <= currentStep ? 'bg-accent-green' : 'bg-gray-200'
                      }`} 
                    />
                  )}

                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 shadow-xs ${
                      isCurrent
                        ? 'bg-accent-green text-white ring-4 ring-green-100 scale-110'
                        : isCompleted
                        ? 'bg-accent-green text-white'
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                  </div>

                  <span
                    className={`text-xs mt-2 font-bold text-center ${
                      isCurrent
                        ? 'text-accent-green font-black'
                        : isCompleted
                        ? 'text-gray-800'
                        : 'text-gray-400 font-medium'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="text-base font-black text-red-800">This Order Has Been Cancelled</h3>
          <p className="text-xs text-red-600 max-w-md mx-auto">
            Reason: {order?.cancellationReason || cancelReason}. Any paid amount will be refunded to your original payment method.
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="relative w-full h-72 sm:h-80 bg-[#e5e3df] overflow-hidden">
            <svg className="w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d4d1cc" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <line x1="0" y1="120" x2="1000" y2="120" stroke="#ffffff" strokeWidth="8" />
              <line x1="0" y1="240" x2="1000" y2="240" stroke="#ffffff" strokeWidth="12" />
              <line x1="220" y1="0" x2="220" y2="600" stroke="#ffffff" strokeWidth="8" />
              <line x1="520" y1="0" x2="520" y2="600" stroke="#ffffff" strokeWidth="14" />
              <path
                d="M 160 240 L 340 240 L 340 120 L 520 120 L 520 190"
                fill="none"
                stroke="#10B981"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="8 6"
              />
            </svg>

            <div className="absolute top-[210px] left-[140px] flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <Store className="w-4 h-4" />
              </div>
              <span className="bg-white/95 text-[10px] font-bold text-gray-800 px-2 py-0.5 rounded shadow-sm mt-1 whitespace-nowrap">
                {storeDisplayName}
              </span>
            </div>

            {!isCancelled && currentStep >= 4 && (
              <div className="absolute top-[95px] left-[380px] flex flex-col items-center animate-bounce">
                <div className="w-10 h-10 rounded-full bg-accent-green text-white flex items-center justify-center shadow-xl border-2 border-white">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="bg-gray-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md mt-1 whitespace-nowrap">
                  Rider En Route
                </span>
              </div>
            )}

            <div className="absolute top-[165px] left-[500px] flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="bg-white/95 text-[10px] font-bold text-gray-800 px-2 py-0.5 rounded shadow-sm mt-1 whitespace-nowrap">
                Your Address
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-600" />
                <span>Order Items ({order?.items?.length || 0})</span>
              </h3>
              {order?.deliveryOtp && (
                <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                  Delivery OTP: {order.deliveryOtp}
                </span>
              )}
            </div>

            <div className="divide-y divide-gray-100">
              {(order?.items || []).map((it, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-green-100 text-green-800 flex items-center justify-center font-bold text-[10px]">
                      ✓
                    </span>
                    <span className="font-semibold text-gray-800">{it.name || it.product?.name || 'Item'}</span>
                    <span className="text-gray-400 font-normal">× {it.quantity}</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    ₹{((Number(it.price) || 0) * it.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-between text-xs font-black text-gray-900">
              <span>Total Paid / Payable</span>
              <span className="text-sm text-brand-600">₹{Number(order?.totalAmount || 0).toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Rider & Support */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              Delivery Partner
            </span>

            {riderDisplayName ? (
              <>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 font-extrabold flex items-center justify-center text-base border border-brand-200">
                    {riderDisplayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-gray-900 truncate">{riderDisplayName}</h4>
                    <p className="text-[11px] text-gray-500 truncate">
                      {assignedRider?.vehicle?.model || 'Verified Tricelyn Rider'}
                    </p>
                  </div>
                </div>

                {riderDisplayPhone && (
                  <a
                    href={`tel:${riderDisplayPhone}`}
                    className="w-full py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Rider ({riderDisplayPhone})</span>
                  </a>
                )}
              </>
            ) : (
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 space-y-1">
                <p className="font-bold">Assigning Nearest Partner Rider...</p>
                <p className="text-[11px] text-blue-700">
                  Once {storeDisplayName} packs your basket, the nearest delivery partner will accept pickup.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-accent-greenDark" />
              <h4 className="text-xs font-bold text-gray-900">
                Leave a note for delivery
              </h4>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-2">
              <textarea
                value={riderMessage}
                onChange={(e) => setRiderMessage(e.target.value)}
                placeholder="e.g. Leave at security gate..."
                rows={3}
                className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 resize-none font-medium"
              />
              <button
                type="submit"
                disabled={!riderMessage.trim()}
                className="w-full py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save Delivery Note</span>
              </button>

              {messageSent && (
                <p className="text-[11px] text-green-600 font-bold text-center">
                  ✓ Note saved for your delivery partner
                </p>
              )}
            </form>
          </div>

          <div className="bg-blue-50/60 rounded-3xl p-5 border border-blue-100 space-y-2 text-xs">
            <p className="font-bold text-brand-800">Need help with your order?</p>
            <p className="text-gray-600 text-[11px]">
              Our customer support team is available 24/7 to assist you.
            </p>
            <Link to="/support" className="mt-2 text-brand-600 font-bold hover:underline inline-block">
              Contact Support →
            </Link>
          </div>
        </div>
      </div>

      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        order={order}
      />

      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-gray-900">Cancel Your Order</h3>
              <button onClick={() => setIsCancelModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-700" />
              </button>
            </div>

            {cancelError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
                {cancelError}
              </div>
            )}

            <p className="text-xs text-gray-500">
              Please select the reason for cancelling order #{order?.orderNumber || orderId}.
            </p>

            <div className="space-y-2">
              {[
                'Placed order by mistake',
                'Delivery time is too long',
                'Need to change delivery address',
                'Forgot to add essential items',
                'Other reason',
              ].map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                    cancelReason === r ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    checked={cancelReason === r}
                    onChange={() => setCancelReason(r)}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelOrder}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingPage;
