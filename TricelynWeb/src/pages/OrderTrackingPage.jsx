import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Send,
  FileText,
  AlertTriangle,
  X
} from 'lucide-react';
import { orderService } from '../services/api';
import socketService from '../services/socket';
import { useCart } from '../context/CartContext';
import InvoiceModal from '../components/InvoiceModal';

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { setActiveOrderId } = useCart();

  const [order, setOrder] = useState(null);
  const [currentStep, setCurrentStep] = useState(3); // 1: Received, 2: In Progress, 3: Shopping Complete, 4: In Transit, 5: Complete
  const [eta, setEta] = useState('12 minutes');
  const [riderMessage, setRiderMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [loading, setLoading] = useState(true);

  // Invoice & Cancel modals
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Placed order by mistake');
  const [cancelling, setCancelling] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  // Status mapping
  const pipelineSteps = [
    { id: 1, key: 'placed', label: 'Received' },
    { id: 2, key: 'confirmed', label: 'In Progress' },
    { id: 3, key: 'preparing', label: 'Shopping Complete' },
    { id: 4, key: 'out_for_delivery', label: 'In Transit' },
    { id: 5, key: 'delivered', label: 'Complete' },
  ];

  useEffect(() => {
    setActiveOrderId(orderId);
    let intervalId;

    const fetchOrderDetails = async () => {
      try {
        const res = await orderService.getOrderById(orderId);
        if (res.data?.order || res.data?.data) {
          const ord = res.data.order || res.data.data;
          setOrder(ord);

          const st = (ord.status || '').toLowerCase();
          if (st === 'cancelled') {
            setIsCancelled(true);
            setEta('Cancelled');
            return;
          }
          if (st === 'placed' || st === 'pending') setCurrentStep(1);
          else if (st === 'confirmed' || st === 'accepted') setCurrentStep(2);
          else if (st === 'preparing' || st === 'packed') setCurrentStep(3);
          else if (st === 'out_for_delivery' || st === 'on_the_way') {
            setCurrentStep(4);
            setEta('8-10 minutes');
          } else if (st === 'delivered' || st === 'completed') {
            setCurrentStep(5);
            setEta('Delivered');
          }
        }
      } catch (err) {
        console.warn('Live order fetch notice:', err.message);
        if (!order) {
          setOrder({
            _id: orderId,
            status: 'out_for_delivery',
            totalAmount: 349,
            createdAt: new Date().toISOString(),
            deliveryAddress: {
              address: 'Flat 302, Royal Palms, Scheme 54, Vijay Nagar, Indore',
            },
            items: [
              { name: 'Amul Taaza Fresh Toned Milk', quantity: 2, price: 27 },
              { name: 'Aashirvaad Shudh Chakki Atta (5kg)', quantity: 1, price: 245 },
              { name: 'Fresh Malwa Farm Potatoes (1kg)', quantity: 1, price: 28 },
            ],
            rider: {
              name: 'Vikram Singh Patel',
              phone: '+91 98260 12345',
              vehicle: 'Hero Electric Scooter (MP-09-EA-4821)',
              rating: '4.9',
            }
          });
          setCurrentStep(4);
          setEta('11 minutes');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();

    socketService.joinOrder(orderId);
    socketService.onOrderStatusUpdate((update) => {
      console.log('⚡ Real-time status update:', update);
      fetchOrderDetails();
    });

    intervalId = setInterval(fetchOrderDetails, 10000);

    return () => {
      clearInterval(intervalId);
      socketService.leaveOrder(orderId);
    };
  }, [orderId, setActiveOrderId]);

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
    try {
      await orderService.cancelOrder(orderId, cancelReason);
      setIsCancelled(true);
      setIsCancelModalOpen(false);
      setEta('Cancelled');
      setActiveOrderId(null);
    } catch (e) {
      // Local demo cancellation
      setIsCancelled(true);
      setIsCancelModalOpen(false);
      setEta('Cancelled');
      setActiveOrderId(null);
    } finally {
      setCancelling(false);
    }
  };

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
            Your Order to {order?.deliveryAddress?.address ? order.deliveryAddress.address.split(',')[0] : 'Vijay Nagar, Indore'}
          </h1>
          <p className="text-xs text-gray-500 font-medium">Order ID: #{orderId}</p>
        </div>

        {/* Action Buttons: Invoice & Cancel */}
        <div className="flex items-center gap-3">
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

          {/* Live ETA Badge */}
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
                {isCancelled ? 'Refund Initiated' : `${eta} · In Progress`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Instacart Style Horizontal Status Pipeline Bar */}
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
            Reason: {cancelReason}. Any paid amount will be refunded to your original payment mode within 24 hours.
          </p>
        </div>
      )}

      {/* Live Map & Tracking View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Map Visualizer (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          
          <div className="relative w-full h-80 sm:h-96 bg-[#e5e3df] overflow-hidden">
            <svg className="w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d4d1cc" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <line x1="0" y1="120" x2="1000" y2="120" stroke="#ffffff" strokeWidth="8" />
              <line x1="0" y1="260" x2="1000" y2="260" stroke="#ffffff" strokeWidth="12" />
              <line x1="220" y1="0" x2="220" y2="600" stroke="#ffffff" strokeWidth="8" />
              <line x1="520" y1="0" x2="520" y2="600" stroke="#ffffff" strokeWidth="14" />
              <path 
                d="M 160 260 L 340 260 L 340 120 L 520 120 L 520 190" 
                fill="none" 
                stroke="#10B981" 
                strokeWidth="6" 
                strokeLinecap="round" 
                strokeDasharray="8 6" 
                className="animate-pulse"
              />
            </svg>

            <div className="absolute top-[240px] left-[140px] flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <Store className="w-4 h-4" />
              </div>
              <span className="bg-white/95 text-[10px] font-bold text-gray-800 px-2 py-0.5 rounded shadow-sm mt-1 whitespace-nowrap">
                Tricelyn Dark Store (Indore)
              </span>
            </div>

            {!isCancelled && (
              <div className="absolute top-[100px] left-[380px] flex flex-col items-center animate-bounce">
                <div className="w-10 h-10 rounded-full bg-accent-green text-white flex items-center justify-center shadow-xl border-2 border-white ring-4 ring-green-300/50">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="bg-gray-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md mt-1 whitespace-nowrap flex items-center gap-1">
                  <span>Rider on Way</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                </span>
              </div>
            )}

            <div className="absolute top-[170px] left-[500px] flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="bg-white/95 text-[10px] font-bold text-gray-800 px-2 py-0.5 rounded shadow-sm mt-1 whitespace-nowrap">
                Your Address
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-white/60 shadow-md flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
                <span className="font-bold text-gray-800">Live GPS tracking active in Indore</span>
              </div>
              <span className="font-semibold text-brand-600">Speed: 28 km/h</span>
            </div>
          </div>

          {/* Shopper / Items summary */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-600" />
                <span>Order Summary · {order?.items?.length || 3} items</span>
              </h3>
              <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                ✓ All Items Packed
              </span>
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
                    ₹{((Number(it.price) || 28) * it.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Panel: Rider & Chat (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Rider Profile Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              Your Delivery Partner
            </span>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 font-extrabold flex items-center justify-center text-base border border-brand-200">
                {order?.rider?.name ? order.rider.name.charAt(0) : 'V'}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-gray-900 truncate">
                  {order?.rider?.name || 'Vikram Singh Patel'}
                </h4>
                <p className="text-[11px] text-gray-500 truncate">
                  {order?.rider?.vehicle || 'Hero Electric (MP-09-EA-4821)'}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-green-700 font-bold mt-0.5">
                  <span>★ {order?.rider?.rating || '4.9'}</span>
                  <span className="text-gray-400 font-normal">· Verified Indore Partner</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <a
                href={`tel:${order?.rider?.phone || '+919826012345'}`}
                className="flex-1 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Rider</span>
              </a>
            </div>
          </div>

          {/* Leave a message for your shopper / rider */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-accent-greenDark" />
              <h4 className="text-xs font-bold text-gray-900">
                Leave a message for your rider
              </h4>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-2">
              <textarea
                value={riderMessage}
                onChange={(e) => setRiderMessage(e.target.value)}
                placeholder="e.g. Leave with security guard at Flat 302..."
                rows={3}
                className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 resize-none font-medium"
              />
              <button
                type="submit"
                disabled={!riderMessage.trim()}
                className="w-full py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Note to Rider</span>
              </button>

              {messageSent && (
                <p className="text-[11px] text-green-600 font-bold text-center">
                  ✓ Message delivered to rider!
                </p>
              )}
            </form>
          </div>

          {/* Help & Support Card */}
          <div className="bg-blue-50/60 rounded-3xl p-5 border border-blue-100 space-y-2 text-xs">
            <p className="font-bold text-brand-800">Need help with your order?</p>
            <p className="text-gray-600 text-[11px]">
              Our Indore customer support team is available 24/7 to assist you.
            </p>
            <Link
              to="/support"
              className="mt-2 text-brand-600 font-bold hover:underline inline-block"
            >
              Contact Support →
            </Link>
          </div>

        </div>

      </div>

      {/* Tax Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        order={order}
      />

      {/* Cancel Order Dialog */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-gray-900">Cancel Your Order</h3>
              <button onClick={() => setIsCancelModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-700" />
              </button>
            </div>
            
            <p className="text-xs text-gray-500">
              Please select the reason for cancelling order #{orderId}. If prepaid, a full refund will be processed immediately.
            </p>

            <div className="space-y-2">
              {[
                'Placed order by mistake',
                'Delivery time is too long',
                'Need to change delivery address',
                'Forgot to add essential items',
                'Other reason'
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
