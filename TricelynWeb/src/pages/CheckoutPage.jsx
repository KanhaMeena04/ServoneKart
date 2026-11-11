import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  CreditCard, 
  Banknote, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  AlertCircle,
  Lock,
  HeartHandshake,
  Store,
  Layers
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { usePlatform } from '../context/PlatformContext';
import { groceryService, orderService } from '../services/api';
import PaymentModal from '../components/PaymentModal';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { 
    items, 
    storeGroups,
    storeCount,
    isMultiStore,
    itemCount, 
    subtotal, 
    deliveryFee, 
    platformFee, 
    riderTip, 
    setRiderTip, 
    setActiveOrderId,
    coupon, 
    couponDiscount, 
    grandTotal, 
    clearCart 
  } = useCart();
  const { user, isAuthenticated, setIsAuthModalOpen } = useAuth();
  const { selectedLocation } = useLocation();
  const { platformMode, isCodEnabled } = usePlatform();

  // Address state
  const [addressType, setAddressType] = useState('Home');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [receiverPhone, setReceiverPhone] = useState(user?.phone || user?.mobile || '');
  const [receiverName, setReceiverName] = useState(user?.name || '');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState(isCodEnabled ? 'cod' : 'online');
  const [instructions, setInstructions] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (items.length === 0) {
      navigate('/');
    }
  }, [items, navigate]);

  useEffect(() => {
    if (!receiverPhone && (user?.phone || user?.mobile)) {
      setReceiverPhone(user?.phone || user?.mobile);
    }
    if (!receiverName && user?.name) {
      setReceiverName(user.name);
    }
  }, [user, receiverPhone, receiverName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!houseNo.trim() || !street.trim()) {
      setError('Please provide complete flat/house number and street/sector details.');
      return;
    }

    if (paymentMethod === 'online') {
      setIsPaymentModalOpen(true);
    } else {
      executeOrderPlacement({ paymentMethod: 'cod', paymentId: null });
    }
  };

  const executeOrderPlacement = async (paymentDetails = { paymentMethod: 'cod' }) => {
    setLoading(true);
    setError('');

    const hubCity = selectedLocation?.city || 'Indore';
    const hubName = selectedLocation?.name || 'Vijay Nagar';
    const fullAddress = `${houseNo.trim()}, ${street.trim()}${landmark.trim() ? ', Near ' + landmark.trim() : ''}, ${hubName}, ${hubCity}`;
    const coords = [
      Number(selectedLocation?.lng) || 75.8937,
      Number(selectedLocation?.lat) || 22.7533,
    ];

    const primaryStore = storeGroups[0] || {};
    const mappedItems = items.map((i) => {
      const prod = i.product || {};
      const storeObj = prod.restaurant && typeof prod.restaurant === 'object' ? prod.restaurant : null;
      return {
        productId: prod._id || prod.id,
        _id: prod._id || prod.id,
        sku: prod.sku,
        name: prod.name,
        image: prod.image,
        quantity: i.quantity,
        price: Number(prod.price) || 0,
        weight: prod.weight || prod.unit,
        unit: prod.unit || prod.weight,
        storeId: prod.storeId || storeObj?._id || (typeof prod.restaurant === 'string' ? prod.restaurant : undefined),
        storeName: prod.storeName || storeObj?.name || prod.vendorName,
      };
    });

    const payload = {
      storeId: primaryStore.storeId !== 'tricelyn_dark_store' ? primaryStore.storeId : undefined,
      storeName: primaryStore.storeName,
      vertical: platformMode === 'food' ? 'food' : 'grocery',
      items: mappedItems,
      deliveryAddress: {
        addressLine: fullAddress,
        fullAddress,
        name: receiverName || user?.name || 'Customer',
        phone: receiverPhone || user?.phone || user?.mobile || '',
        label: addressType,
        city: hubCity,
        coordinates: coords,
      },
      paymentMethod: paymentDetails.paymentMethod === 'online' ? 'online' : 'cod',
      paymentStatus: paymentDetails.paymentMethod === 'online' ? 'paid' : 'pending',
      transactionId: paymentDetails.paymentId || undefined,
      couponCode: coupon?.code || undefined,
      discount: couponDiscount || 0,
      tip: riderTip || 0,
      deliveryFee,
      platformFee,
      subtotal,
      totalAmount: grandTotal,
      deliveryNotes: instructions.trim() || undefined,
      idempotencyKey: `web-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    try {
      const response =
        platformMode === 'food'
          ? await orderService.placeOrder(payload)
          : await groceryService.placeGroceryOrder(payload);

      const orders = response.data?.orders && Array.isArray(response.data.orders)
        ? response.data.orders
        : [response.data?.order || response.data?.data].filter(Boolean);

      const primaryOrder = orders[0];
      const orderId = primaryOrder?._id;

      if (!orderId) {
        throw new Error('Server did not return a confirmed order ID.');
      }

      setActiveOrderId(orderId);
      clearCart();
      setIsPaymentModalOpen(false);
      navigate(`/order-success/${orderId}`, {
        state: {
          orders,
          splitCount: response.data?.splitCount || orders.length,
          fulfilmentGroup: response.data?.fulfilmentGroup || primaryOrder?.fulfilmentGroup,
          paymentMethod: payload.paymentMethod,
        },
      });
    } catch (err) {
      setIsPaymentModalOpen(false);
      if (err.response?.status === 401) {
        setError('Please sign in or verify your mobile number to confirm your order.');
        setIsAuthModalOpen(true);
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            'Could not place your order. Please verify stock availability and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </Link>
        <h1 className="text-2xl font-black text-gray-900 mt-2">Checkout & Confirm Order</h1>
        <p className="text-xs text-gray-500">
          Delivering in {selectedLocation?.eta || '10-15 minutes'} to {selectedLocation?.name || 'your selected hub'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isMultiStore && (
        <div className="mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-900 flex items-start gap-2.5">
          <Layers className="w-4 h-4 text-[#0055ff] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-[#0055ff]">
              Multi-Vendor Smart Split ({storeCount} Partner Stores)
            </p>
            <p className="text-[11px] text-blue-800/80 mt-0.5">
              Your items span {storeCount} verified dark stores. Each store receives its dedicated order and pickup OTP for parallel quick dispatch.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Delivery Address Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">1. Delivery Address</h3>
                  <p className="text-[11px] text-gray-500">
                    Selected Hub: {selectedLocation?.locality || selectedLocation?.name || 'Vijay Nagar, Indore'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {['Home', 'Work', 'Other'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAddressType(type)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      addressType === type
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Flat / House / Building No. *
                </label>
                <input
                  type="text"
                  required
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  placeholder="e.g. Flat 402, Royal Residency"
                  className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Street / Locality / Sector *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Scheme 54, Near Velocity"
                  className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Receiver Name
                </label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Receiver Phone Number
                </label>
                <input
                  type="tel"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Nearby Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite Sayaji Hotel"
                  className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Delivery Instructions for Rider
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Leave at door, avoid ringing bell, call on arrival"
                className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* 2. Delivery Partner Tip */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">Tip Your Delivery Partner</h3>
                <p className="text-[11px] text-gray-500">100% of tips go directly to your rider</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {[
                { label: 'No Tip', value: 0 },
                { label: '₹10', value: 10 },
                { label: '₹20', value: 20 },
                { label: '₹30', value: 30 },
                { label: '₹50', value: 50 },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setRiderTip(t.value)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
                    riderTip === t.value
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
              <div className="w-8 h-8 rounded-full bg-green-50 text-accent-greenDark flex items-center justify-center font-bold">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">3. Select Payment Method</h3>
                <p className="text-[11px] text-gray-500">Secure payment powered by Tricelyn Pay</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isCodEnabled && (
                <label
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                    paymentMethod === 'cod'
                      ? 'border-brand-600 bg-brand-50/40'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-brand-600" />
                      <span className="text-xs font-bold text-gray-900">Cash on Delivery (COD)</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">Pay via cash or UPI to rider upon arrival</p>
                  </div>
                </label>
              )}

              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                  paymentMethod === 'online'
                    ? 'border-brand-600 bg-brand-50/40'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-accent-greenDark" />
                    <span className="text-xs font-bold text-gray-900">Online Payment / Razorpay</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">UPI, Cards, NetBanking & Wallets</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & CTA */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-3">
              Order Summary ({itemCount} items · {storeCount} {storeCount === 1 ? 'Store' : 'Stores'})
            </h3>

            {/* Store-grouped items */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {storeGroups.map((grp) => (
                <div key={grp.storeId} className="space-y-1.5">
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase text-[#0055ff]">
                    <Store className="w-3 h-3" />
                    <span className="truncate">{grp.storeName}</span>
                  </div>
                  {grp.items.map((item) => (
                    <div key={item.product._id || item.product.id} className="flex justify-between items-center text-xs pl-2">
                      <div className="truncate max-w-[180px]">
                        <span className="font-semibold text-gray-800">{item.product.name}</span>
                        <span className="text-gray-400 ml-1">× {item.quantity}</span>
                      </div>
                      <span className="font-bold text-gray-900">
                        ₹{((Number(item.product.price) || 0) * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Bill Details */}
            <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Coupon Discount ({coupon?.code})</span>
                  <span>-₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span className="font-semibold text-gray-900">
                  {deliveryFee === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Platform Fee</span>
                <span className="font-semibold text-gray-900">₹{platformFee}</span>
              </div>

              {riderTip > 0 && (
                <div className="flex justify-between text-pink-600 font-semibold">
                  <span>Delivery Partner Tip</span>
                  <span>₹{riderTip}</span>
                </div>
              )}

              <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-black text-gray-900">
                <span>To Pay</span>
                <span className="text-base text-brand-600">₹{grandTotal.toFixed(0)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-accent-green hover:bg-accent-greenDark active:scale-95 text-white rounded-2xl text-sm font-black shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Placing Your Order...</span>
              ) : paymentMethod === 'online' ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay Now (₹{grandTotal.toFixed(0)})</span>
                </>
              ) : (
                <>
                  <span>Confirm & Place Order (₹{grandTotal.toFixed(0)})</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Real-time stock reservation & instant vendor dispatch</span>
            </div>
          </div>
        </div>
      </form>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={grandTotal}
        customer={{ name: receiverName, phone: receiverPhone }}
        onSwitchToCod={() => {
          setPaymentMethod('cod');
          setIsPaymentModalOpen(false);
          executeOrderPlacement({ paymentMethod: 'cod', paymentId: null });
        }}
        onPaymentSuccess={(details) =>
          executeOrderPlacement({ paymentMethod: 'online', paymentId: details.paymentId })
        }
      />
    </div>
  );
};

export default CheckoutPage;
