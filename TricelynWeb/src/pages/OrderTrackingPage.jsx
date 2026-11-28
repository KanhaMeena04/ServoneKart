import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
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
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  X,
  FileText,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Sparkles
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
  const location = useLocation();
  const stateData = location.state || {};
  const { setActiveOrderId } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Placed order by mistake');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [riderCoords, setRiderCoords] = useState(null);

  // Poll & fetch order telemetry
  const fetchOrderDetails = useCallback(async () => {
    try {
      // Try trackOrder or getOrderById
      let res;
      try {
        res = await orderService.trackOrder(orderId);
      } catch (_) {
        res = await orderService.getOrderById(orderId);
      }

      const ord = res.data?.order || res.data?.data || res.data;
      if (ord) {
        setOrder(ord);
        setFetchError('');
        if (ord.rider?.location?.coordinates) {
          setRiderCoords(ord.rider.location.coordinates);
        } else if (ord.driver?.lat && ord.driver?.lng) {
          setRiderCoords([ord.driver.lng, ord.driver.lat]);
        }
      }
    } catch (err) {
      if (!order) {
        setFetchError(
          err.response?.data?.message ||
            err.message ||
            'Unable to fetch real-time tracking details right now.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [orderId, order]);

  useEffect(() => {
    setActiveOrderId(orderId);
    fetchOrderDetails();

    socketService.joinOrder(orderId);
    socketService.onOrderStatusUpdate((update) => {
      fetchOrderDetails();
    });
    socketService.onRiderLocationUpdate((loc) => {
      if (loc?.coordinates) {
        setRiderCoords(loc.coordinates);
      }
    });

    const intervalId = setInterval(fetchOrderDetails, 6000);

    return () => {
      clearInterval(intervalId);
      socketService.leaveOrder(orderId);
    };
  }, [orderId, setActiveOrderId, fetchOrderDetails]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    setCancelError('');
    try {
      await orderService.cancelOrder(orderId, cancelReason);
      setIsCancelModalOpen(false);
      fetchOrderDetails();
      setActiveOrderId(null);
    } catch (e) {
      setCancelError(
        e.response?.data?.message || 'Unable to cancel this order now. Cancellation window may have expired.'
      );
    } finally {
      setCancelling(false);
    }
  };

  // Derive status details
  const status = (order?.status || 'placed').toLowerCase();
  const isCancelled = status === 'cancelled';
  const isDelivered = status === 'delivered' || status === 'completed';

  // Compute Active Step: 1 = Accepted, 2 = Packed, 3 = Rider Picked Up, 4 = Delivered
  const currentStep = useMemo(() => {
    if (isCancelled) return -1;
    if (status === 'delivered' || status === 'completed') return 4;
    if (['picked_up', 'out_for_delivery', 'on_the_way', 'delivery_arrived'].includes(status)) return 3;
    if (['preparing', 'packed', 'ready', 'ready_for_pickup'].includes(status)) return 2;
    if (['accepted', 'confirmed'].includes(status)) return 1;
    return 0; // placed / pending
  }, [status, isCancelled]);

  // Status Title matching Reference Screenshot 1
  const statusHeaderTitle = useMemo(() => {
    if (isCancelled) return 'Order Cancelled';
    if (isDelivered) return 'Delivered';
    if (currentStep === 3) return 'On the way';
    if (currentStep === 2) return 'Packing your order';
    if (currentStep === 1) return 'Store Accepted';
    return 'Order Placed';
  }, [currentStep, isCancelled, isDelivered]);

  // ETA calculation
  const etaMinutes = useMemo(() => {
    if (isDelivered) return 'Delivered';
    if (isCancelled) return 'Cancelled';
    if (currentStep === 3) return 'About 6-10 min';
    if (currentStep === 2) return 'About 11 min';
    if (currentStep === 1) return 'About 12-14 min';
    return 'About 15 min';
  }, [currentStep, isDelivered, isCancelled]);

  const storeName =
    extractName(order?.restaurant?.name) ||
    order?.storeName ||
    order?.restaurantName ||
    'Tricelyn Super Market';

  const itemCount =
    order?.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) ||
    order?.items?.length ||
    1;

  const deliveryCode =
    order?.deliveryOtp ||
    order?.deliveryCode ||
    (order?._id ? order._id.toString().slice(-4).toUpperCase() : '8412');

  const riderObj = order?.rider && typeof order.rider === 'object' ? order.rider : null;
  const riderName =
    riderObj?.name ||
    riderObj?.user?.name ||
    order?.riderName ||
    order?.driverName ||
    null;
  const riderPhone =
    riderObj?.phone ||
    riderObj?.user?.mobile ||
    order?.riderPhone ||
    order?.driverPhone ||
    null;

  if (loading && !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-28 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#0145F2]/20 border-t-[#0145F2] rounded-full animate-spin mx-auto" />
        <h2 className="text-base font-black text-gray-800">Connecting to Live Store & Rider Telemetry...</h2>
        <p className="text-xs text-gray-500 font-medium">Tracking order #{orderId.slice(-6)}</p>
      </div>
    );
  }

  if (fetchError && !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-black text-gray-900">Order Telemetry Synchronizing</h2>
          <p className="text-xs text-gray-600 font-medium">{fetchError}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setLoading(true);
                fetchOrderDetails();
              }}
              className="px-5 py-2.5 bg-[#0145F2] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <Link
              to="/account/orders"
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
            >
              My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0145F2] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Groceries</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* <button
              onClick={() => setIsInvoiceOpen(true)}
              className="px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-bold text-gray-700 transition flex items-center gap-1 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-[#0145F2]" />
              <span>Invoice</span>
            </button> */}
            {!isCancelled && !isDelivered && currentStep <= 1 && (
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-bold text-red-600 transition"
              >
                Cancel
              </button> 
            )}
          </div>
        </div>

        {/* ============================================================
            TOP HEADER ROW (Matches Screenshot 1 Exactly)
            "On the way" + "Sodhi's Super Market · 5 items" + "[ About 11 min ]"
           ============================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {statusHeaderTitle}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
              {storeName} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>

          <div className="self-start sm:self-auto">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-[#0145F2] text-white text-xs sm:text-sm font-black shadow-sm">
              {etaMinutes}
            </span>
          </div>
        </div>

        {/* ============================================================
            MAIN 2-COLUMN GRID (Matches Screenshot 1 Exactly)
           ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ==================== LEFT COLUMN (col-span-7) ==================== */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. Live Map / Route Telemetry Card (Matches Screenshot 1) */}
            <div className="bg-[#EBF1FA] rounded-3xl border border-blue-100 overflow-hidden relative shadow-xs">
              <div className="p-4 sm:p-5 min-h-[260px] sm:min-h-[300px] flex flex-col justify-between relative">
                
                {/* Map Header Overlay */}
                <div className="flex items-center justify-between z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-bold text-gray-800 shadow-2xs border border-white">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Live GPS Telemetry</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Express Corridor (In minutes)
                  </span>
                </div>

                {/* Visual Route Canvas */}
                <div className="my-auto py-8 relative flex items-center justify-between px-6 sm:px-12">
                  {/* Dashed Route Track */}
                  <div className="absolute left-12 right-12 top-1/2 -translate-y-1/2 h-1 border-t-2 border-dashed border-[#0145F2]/40 z-0" />

                  {/* Origin: Partner Supermarket */}
                  <div className="flex flex-col items-center gap-1.5 z-10 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#0145F2] text-[#0145F2] flex items-center justify-center shadow-md">
                      <Store className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-black text-gray-900 truncate max-w-[100px]">
                      {storeName}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Store
                    </span>
                  </div>

                  {/* Moving Delivery Rider Bike */}
                  <div className={`flex flex-col items-center gap-1 z-10 transition-all duration-700 ${
                    currentStep >= 3 ? 'scale-110' : 'opacity-85'
                  }`}>
                    <div className="w-12 h-12 rounded-2xl bg-[#0145F2] text-white flex items-center justify-center shadow-lg shadow-[#0145F2]/30 animate-bounce">
                      <Truck className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-black text-[#0145F2]">
                      {riderName ? riderName.split(' ')[0] : 'Rider'}
                    </span>
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                      {currentStep >= 3 ? 'On the way' : 'En route'}
                    </span>
                  </div>

                  {/* Destination: Customer Home */}
                  <div className="flex flex-col items-center gap-1.5 z-10 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white border-2 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-md">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-black text-gray-900 truncate max-w-[100px]">
                      Your Doorstep
                    </span>
                    <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      Delivery
                    </span>
                  </div>
                </div>

                {/* Map Bottom Status Bar */}
                <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-3 border border-white flex items-center justify-between text-xs z-10 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0145F2] flex-shrink-0" />
                    <span className="font-semibold text-gray-700 truncate max-w-[280px] sm:max-w-md">
                      {order?.deliveryAddress?.addressLine || order?.deliveryAddress?.fullAddress || 'Vijay Nagar, Indore'}
                    </span>
                  </div>
                  <span className="font-black text-[#0145F2] flex-shrink-0">
                    {order?.deliveryFee === 0 ? 'FREE EXPRESS' : 'EXPRESS'}
                  </span>
                </div>

              </div>
            </div>

            {/* 2. Order status Stepper Card (Matches Screenshot 1 Exactly) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-5">
              <h3 className="text-base font-black text-gray-900 tracking-tight">
                Order status
              </h3>

              <div className="space-y-6 relative pl-1">
                
                {/* Stepper Item 1: Accepted */}
                <div className="flex items-start gap-4 relative">
                  {/* Connecting Line */}
                  <div className={`absolute left-3 top-6 bottom-0 w-0.5 -mb-6 ${
                    currentStep >= 2 ? 'bg-[#0145F2]' : 'bg-gray-200'
                  }`} />
                  
                  {/* Step Dot */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                    currentStep >= 1 ? 'bg-[#0145F2] text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {currentStep >= 1 ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-white" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-400" />
                    )}
                  </div>
                  
                  <div className="pt-0.5">
                    <h4 className={`text-sm font-black ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                      Accepted
                    </h4>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {currentStep >= 1 ? 'The store accepted in 18 sec' : 'Waiting for store confirmation'}
                    </p>
                  </div>
                </div>

                {/* Stepper Item 2: Packed */}
                <div className="flex items-start gap-4 relative">
                  {/* Connecting Line */}
                  <div className={`absolute left-3 top-6 bottom-0 w-0.5 -mb-6 ${
                    currentStep >= 3 ? 'bg-[#0145F2]' : 'bg-gray-200'
                  }`} />

                  {/* Step Dot */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                    currentStep >= 2 ? 'bg-[#0145F2] text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {currentStep >= 2 ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-white" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-400" />
                    )}
                  </div>

                  <div className="pt-0.5">
                    <h4 className={`text-sm font-black ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                      Packed
                    </h4>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {currentStep >= 2 ? 'Photo of your packed bag on the right' : 'Store is picking fresh groceries'}
                    </p>
                  </div>
                </div>

                {/* Stepper Item 3: Rider picked up */}
                <div className="flex items-start gap-4 relative">
                  {/* Connecting Line */}
                  <div className={`absolute left-3 top-6 bottom-0 w-0.5 -mb-6 ${
                    currentStep >= 4 ? 'bg-[#0145F2]' : 'bg-gray-200'
                  }`} />

                  {/* Step Dot */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                    currentStep >= 3 ? 'bg-[#0145F2] text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {currentStep >= 3 ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-white" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-400" />
                    )}
                  </div>

                  <div className="pt-0.5">
                    <h4 className={`text-sm font-black ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>
                      Rider picked up
                    </h4>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {currentStep >= 3 ? 'Rider is 1.1 km away' : 'Rider arriving at store for pickup'}
                    </p>
                  </div>
                </div>

                {/* Stepper Item 4: Delivered */}
                <div className="flex items-start gap-4 relative">
                  {/* Step Dot */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                    currentStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {currentStep >= 4 ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-400" />
                    )}
                  </div>

                  <div className="pt-0.5">
                    <h4 className={`text-sm font-black ${currentStep >= 4 ? 'text-emerald-700' : 'text-gray-400'}`}>
                      Delivered
                    </h4>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {currentStep >= 4 ? 'Delivered safely to your doorstep' : 'Arriving soon'}
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ==================== RIGHT COLUMN (col-span-5) ==================== */}
          <div className="lg:col-span-5 space-y-5">

            {/* Card 1: Photo of your packed bag (Matches Screenshot 1 Exactly) */}
            <div className="bg-[#EBF1FA] rounded-3xl p-6 border border-blue-100 shadow-xs flex flex-col items-center justify-center text-center min-h-[160px] relative overflow-hidden">
              {order?.packedBagImage ? (
                <div className="w-full space-y-2">
                  <span className="text-xs font-bold text-gray-600">Photo of your packed bag</span>
                  <img
                    src={order.packedBagImage}
                    alt="Packed bag"
                    className="w-full h-36 object-cover rounded-2xl border border-white shadow-xs"
                  />
                  <div className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Sealed &amp; Verified</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-white text-[#0145F2] mx-auto flex items-center justify-center shadow-xs">
                    <Package className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 block">Photo of your packed bag</span>
                  <p className="text-[11px] text-gray-500 font-medium max-w-xs">
                    {currentStep >= 2
                      ? 'Bag packed and sealed with tamper-proof Tricelyn tape.'
                      : 'Store will upload photo once items are packed.'}
                  </p>
                </div>
              )}
            </div>

            {/* Card 2: Your delivery partner (Matches Screenshot 1 Exactly) */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-gray-500">Your delivery partner</h4>
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0145F2] flex items-center justify-center font-black flex-shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-black text-gray-900 truncate">
                      {riderName || 'Assigning partner...'}
                    </div>
                    <p className="text-[11px] text-gray-500 truncate">
                      {riderObj?.vehicle ? `${riderObj.vehicle} • Verified Partner` : 'Hyperlocal Delivery Fleet'}
                    </p>
                  </div>
                </div>

                {riderPhone ? (
                  <a
                    href={`tel:${riderPhone}`}
                    className="px-5 py-2 border-2 border-[#0145F2] text-[#0145F2] hover:bg-[#0145F2] hover:text-white rounded-xl text-xs font-black transition flex-shrink-0"
                  >
                    Call
                  </a>
                ) : (
                  <button
                    disabled
                    className="px-5 py-2 border border-gray-200 text-gray-400 rounded-xl text-xs font-bold flex-shrink-0 cursor-not-allowed"
                  >
                    Call
                  </button>
                )}
              </div>
            </div>

            {/* Card 3: Delivery code (Matches Screenshot 1 Exactly) */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-gray-500">Delivery code</h4>
              <div className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-gray-900 py-2">
                [ {deliveryCode.split('').join('  ')} ]
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Share it with the rider at the door.
              </p>
            </div>

            {/* Need help with this order? link */}
            <div className="pt-2 text-left">
              <button
                onClick={() => setIsHelpOpen(true)}
                className="text-xs font-bold text-[#0145F2] hover:underline cursor-pointer"
              >
                Need help with this order?
              </button>
            </div>

            {/* Order Items Summary Accordion */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span>Items in this shipment ({itemCount})</span>
                <span className="font-black text-gray-900">₹{Number(order?.totalAmount || 0).toFixed(0)}</span>
              </div>
              <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto pr-1">
                {(order?.items || []).map((it, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <span className="text-gray-700 font-medium truncate max-w-[200px]">
                      {it.name || it.product?.name || 'Item'} × {it.quantity || 1}
                    </span>
                    <span className="font-bold text-gray-900">
                      ₹{((Number(it.price || it.product?.price || 0)) * (it.quantity || 1)).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Tax Invoice Modal */}
      {order && (
        <InvoiceModal
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
          order={order}
        />
      )}

      {/* Need Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#0145F2]" />
                <span>Need Help with Order?</span>
              </h3>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <a
                href="https://wa.me/919847192735?text=Hello%20Tricelyn%20Support,%20I%20need%20help%20with%20order"
                target="_blank"
                rel="noreferrer"
                className="w-full p-3 rounded-2xl bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 flex items-center justify-between transition"
              >
                <span>Chat on WhatsApp Support</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="tel:9847192735"
                className="w-full p-3 rounded-2xl bg-blue-50 text-blue-800 font-bold hover:bg-blue-100 flex items-center justify-between transition"
              >
                <span>Call Customer Helpline</span>
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>

            <button
              onClick={() => setIsHelpOpen(false)}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900">Cancel Order</h3>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {cancelError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
                {cancelError}
              </div>
            )}

            <div className="space-y-2 text-xs">
              <label className="block text-gray-600 font-bold">Select Cancellation Reason:</label>
              {[
                'Placed order by mistake',
                'Need to change delivery address',
                'Forgot to add items',
                'Taking too long',
                'Other reason'
              ].map((r) => (
                <label key={r} className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
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

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                Back
              </button>
              <button
                disabled={cancelling}
                onClick={handleCancelOrder}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderTrackingPage;
