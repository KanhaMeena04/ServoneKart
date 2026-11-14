import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Crown,
  Check,
  Bike,
  Store,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  Banknote,
  Percent,
  CheckCircle2,
  X,
  CreditCard,
  Wallet,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { membershipService } from '../services/api';

export default function MembershipPlansPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, setIsAuthModalOpen, updateUserData } = useAuth();

  // Tab State: 'premier' (Customer) | 'rider' (Delivery Partner) | 'vendor' (Supermarket Merchant)
  const activeTabParam = searchParams.get('tab') || 'premier';
  const [activeTab, setActiveTab] = useState(activeTabParam);

  // Sync state with URL params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['premier', 'rider', 'vendor'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Live Plans from Backend
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // User's active subscription
  const [mySubscription, setMySubscription] = useState(null);

  // Interactive Subscribe Modal State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [planToSubscribe, setPlanToSubscribe] = useState(null);
  const [subscribing, setSubscribing] = useState(false);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Online');

  // Application Forms State
  const [riderForm, setRiderForm] = useState({
    fullName: '',
    mobile: '',
    vehicleType: '',
    area: '',
  });
  const [riderPlanChoice, setRiderPlanChoice] = useState('free'); // 'free' | 'pro'
  const [riderSubmitting, setRiderSubmitting] = useState(false);
  const [riderSubmitted, setRiderSubmitted] = useState(false);

  const [vendorForm, setVendorForm] = useState({
    storeName: '',
    ownerName: '',
    mobile: '',
    area: '',
    liveItems: '',
  });
  const [vendorPlanChoice, setVendorPlanChoice] = useState('free'); // 'free' | 'starter' | 'pro'
  const [vendorSubmitting, setVendorSubmitting] = useState(false);
  const [vendorSubmitted, setVendorSubmitted] = useState(false);

  // Payment method state
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [lastTxnId, setLastTxnId] = useState('');

  const applyFormRef = useRef(null);

  // Fetch plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const audience = activeTab === 'premier' ? 'user' : activeTab === 'rider' ? 'rider' : 'vendor';
        const res = await membershipService.getPlans(audience);
        if (res.data?.success && res.data?.data) {
          setPlans(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedPlan(res.data.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load membership plans:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [activeTab]);

  // Fetch active subscription if logged in
  useEffect(() => {
    const fetchMySub = async () => {
      if (!isAuthenticated) return;
      try {
        const audience = activeTab === 'premier' ? 'user' : activeTab === 'rider' ? 'rider' : 'vendor';
        const res = await membershipService.getMySubscription(audience);
        if (res.data?.hasActiveSubscription) {
          setMySubscription(res.data.subscription);
        } else {
          setMySubscription(null);
        }
      } catch (err) {
        console.error('Error checking active subscription:', err);
      }
    };
    fetchMySub();
  }, [activeTab, isAuthenticated]);

  // Handle plan purchase click
  const handleChoosePlan = (plan) => {
    if (!isAuthenticated && !plan.isApplication) {
      setIsAuthModalOpen(true);
      return;
    }
    setPlanToSubscribe(plan);
    setSubscriptionSuccess(false);
    setIsCheckoutModalOpen(true);
  };

  // Execute Subscription / Application Payment
  const handleConfirmSubscribe = async () => {
    if (!planToSubscribe) return;
    try {
      setSubscribing(true);
      const generatedTxn = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setLastTxnId(generatedTxn);

      if (planToSubscribe.isApplication) {
        // Application payment flow
        await membershipService.submitEnquiry({
          ...planToSubscribe.applicantData,
          planName: planToSubscribe.name,
          planPrice: planToSubscribe.price,
          paymentMethod,
          transactionId: generatedTxn,
          isPaid: true,
        });

        if (planToSubscribe.targetAudience === 'rider') setRiderSubmitted(true);
        if (planToSubscribe.targetAudience === 'vendor') setVendorSubmitted(true);
        setSubscriptionSuccess(true);
      } else {
        // Direct plan subscription flow
        const res = await membershipService.subscribePlan({
          planId: planToSubscribe._id,
          targetAudience: planToSubscribe.targetAudience,
          paymentMethod,
          transactionId: generatedTxn,
          userName: user?.name || 'Customer',
          userPhone: user?.phone || user?.mobile || '',
        });

        if (res.data?.success) {
          setSubscriptionSuccess(true);
          setMySubscription(res.data.data);

          // Update local auth context with new membership badge
          if (updateUserData && res.data.badge) {
            updateUserData({
              membershipBadge: res.data.badge.text,
              isPremier: true,
            });
          }
        }
      }
    } catch (err) {
      console.error('Subscription error:', err);
      alert(err.response?.data?.message || 'Failed to activate. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  // Handle Rider Lead Submission
  const handleRiderSubmit = async (e) => {
    e.preventDefault();
    if (!riderForm.mobile.trim()) {
      alert('Please enter your mobile number');
      return;
    }

    if (riderPlanChoice === 'pro') {
      const proPlan = plans.find((p) => p.price > 0 && p.targetAudience === 'rider') || {
        _id: 'rider-pro-day',
        name: 'Pro Day Pass (Rider Partner)',
        price: 99,
        billingCycle: 'day',
        targetAudience: 'rider',
        badge: 'PRO RIDER',
      };
      handleChoosePlan({
        ...proPlan,
        isApplication: true,
        applicantData: { ...riderForm, type: 'rider' },
      });
      return;
    }

    try {
      setRiderSubmitting(true);
      await membershipService.submitEnquiry({
        type: 'rider',
        ...riderForm,
        planName: 'Base (Free)',
        planPrice: 0,
        paymentStatus: 'free',
      });
      setRiderSubmitted(true);
    } catch (err) {
      console.error('Rider enquiry error:', err);
      alert('Failed to submit application. Please try again.');
    } finally {
      setRiderSubmitting(false);
    }
  };

  // Handle Supermarket Merchant Lead Submission
  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    if (!vendorForm.mobile.trim() || !vendorForm.storeName.trim()) {
      alert('Please enter your store name and mobile number');
      return;
    }

    if (vendorPlanChoice !== 'free') {
      const isPro = vendorPlanChoice === 'pro';
      const vendorPlan = {
        _id: isPro ? 'vendor-pro-3000' : 'vendor-starter-3000',
        name: isPro ? 'Supermarket Pro (3,000+ items)' : 'Supermarket Starter (< 3,000 items)',
        price: isPro ? 25000 : 10000,
        billingCycle: 'one-time',
        targetAudience: 'vendor',
        badge: isPro ? 'SUPERMARKET PARTNER' : 'VERIFIED MERCHANT',
      };
      handleChoosePlan({
        ...vendorPlan,
        isApplication: true,
        applicantData: { ...vendorForm, type: 'vendor' },
      });
      return;
    }

    try {
      setVendorSubmitting(true);
      await membershipService.submitEnquiry({
        type: 'vendor',
        ...vendorForm,
        planName: 'Base Listing (Free)',
        planPrice: 0,
        paymentStatus: 'free',
      });
      setVendorSubmitted(true);
    } catch (err) {
      console.error('Vendor enquiry error:', err);
      alert('Failed to submit application. Please try again.');
    } finally {
      setVendorSubmitting(false);
    }
  };

  const scrollToApply = () => {
    applyFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20">
      {/* ================= PERSONA SWITCHER TABS ================= */}
      <div className="bg-white border-b border-slate-200 sticky top-16 md:top-20 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-8 overflow-x-auto py-3 no-scrollbar">
            <button
              onClick={() => handleTabChange('premier')}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex-shrink-0 ${
                activeTab === 'premier'
                  ? 'bg-[#0B3EDB] text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>Tricelyn Premier</span>
              {mySubscription && activeTab === 'premier' && (
                <span className="bg-white text-[#0B3EDB] text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase">
                  Active
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabChange('rider')}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex-shrink-0 ${
                activeTab === 'rider'
                  ? 'bg-[#0B3EDB] text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>Ride with Tricelyn</span>
            </button>

            <button
              onClick={() => handleTabChange('vendor')}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex-shrink-0 ${
                activeTab === 'vendor'
                  ? 'bg-[#0B3EDB] text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Sell with Tricelyn</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">

        {/* ============================================================== */}
        {/* =================== TAB 1: TRICELYN PREMIER ================== */}
        {/* ============================================================== */}
        {activeTab === 'premier' && (
          <div className="animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Tricelyn Premier
              </h1>
              <p className="text-sm sm:text-base text-slate-500 mt-1 font-medium">
                Real perks, no free-delivery tricks.
              </p>
            </div>

            {/* If multiple plans exist, show period selector pills */}
            {plans.length > 1 && (
              <div className="flex items-center gap-2 mb-6">
                {plans.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => setSelectedPlan(p)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                      selectedPlan?._id === p._id
                        ? 'bg-[#0B3EDB] text-white border-[#0B3EDB] shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {p.name} · ₹{p.price}/{p.billingCycle}
                  </button>
                ))}
              </div>
            )}

            {/* Layout matching Reference Screenshot 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">

              {/* LEFT COLUMN: Main Premier Card */}
              {selectedPlan && (
                <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border-2 border-blue-500/30 shadow-xl shadow-blue-500/5 relative overflow-hidden">
                  {/* Premier Tag Chip */}
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#0B3EDB] text-white mb-4">
                    {selectedPlan.tag || 'PREMIER'}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline justify-between mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900">
                        ₹{selectedPlan.price}
                      </span>
                      <span className="text-sm sm:text-base text-slate-500 font-semibold">
                        / {selectedPlan.billingCycle}
                      </span>
                    </div>
                    {selectedPlan.originalPrice > selectedPlan.price && (
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        SAVE ₹{selectedPlan.originalPrice - selectedPlan.price}
                      </span>
                    )}
                  </div>

                  {/* Perks Checklist (Bullet Points with Blue Dots) */}
                  <div className="space-y-3.5 mb-8">
                    {(selectedPlan.features || []).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#0B3EDB] mt-1.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action CTA Button */}
                  {mySubscription ? (
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#0B3EDB]" />
                        <div>
                          <p className="text-xs font-black text-slate-900">Premier Membership Active</p>
                          <p className="text-[11px] text-slate-500">
                            Valid until {new Date(mySubscription.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-[#0B3EDB] bg-white px-2.5 py-1 rounded-full border border-blue-200">
                        VIP Active
                      </span>
                    </div>
                  ) : selectedPlan.price === 0 ? (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs font-bold text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Base Free Tier Active by Default — You can order freely anytime without subscription!</span>
                      </div>
                      <button
                        onClick={() => {
                          const paidPlan = plans.find((p) => p.price > 0) || plans[1];
                          if (paidPlan) setSelectedPlan(paidPlan);
                        }}
                        className="w-full py-3 rounded-2xl bg-white border border-[#0B3EDB] text-[#0B3EDB] hover:bg-blue-50 font-black text-xs transition"
                      >
                        Upgrade to Premier (₹99/mo)
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleChoosePlan(selectedPlan)}
                      className="w-full py-3.5 px-6 rounded-2xl bg-[#0B3EDB] hover:bg-[#0A2B6B] active:scale-[0.99] text-white font-black text-sm transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                    >
                      <span>Choose Premier (Pay ₹{selectedPlan.price} & Activate)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {/* Disclaimer Note */}
                  <p className="text-[11px] text-slate-400 text-center mt-4">
                    Sample price. Priority is capped so other customers are never left waiting.
                  </p>
                </div>
              )}

              {/* RIGHT COLUMN: 2 Benefit Highlight Cards */}
              <div className="lg:col-span-6 space-y-6">

                {/* Card 1: Cash on delivery */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs hover:border-blue-300 transition">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Banknote className="w-5 h-5 text-[#0B3EDB]" />
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      Cash on delivery
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    Available to Premier members. Other customers can pay online or by UPI at the door.
                  </p>
                </div>

                {/* Card 2: Priority is fair */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs hover:border-blue-300 transition">
                  <div className="flex items-center gap-2.5 mb-2">
                    <ShieldCheck className="w-5 h-5 text-[#0B3EDB]" />
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      Priority is fair
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    Priority applies when riders are short, and non-members never wait beyond a set limit.
                  </p>
                </div>

                {/* Card 3: Quality Guarantee */}
                <div className="bg-gradient-to-br from-[#07162E] to-[#0A2B6B] rounded-3xl p-6 sm:p-7 text-white shadow-md">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Instant Freshness Guarantee
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
                    Not satisfied with produce freshness? One-tap instant refund or re-delivery straight from your order details screen. No friction.
                  </p>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* =================== TAB 2: RIDE WITH TRICELYN ================ */}
        {/* ============================================================== */}
        {activeTab === 'rider' && (
          <div className="animate-in fade-in duration-300 space-y-6 sm:space-y-8">

            {/* Dark Navy Hero Banner matching Screenshot 2 */}
            <div className="bg-[#07162E] rounded-3xl p-7 sm:p-10 text-white shadow-xl relative overflow-hidden">
              <div className="max-w-2xl relative z-10">
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
                  Ride with Tricelyn.
                </h1>
                <p className="text-xs sm:text-base text-blue-100/90 leading-relaxed mb-6 font-medium">
                  Short rides near your station, clear pay shown for every delivery, and a weekly payout to your bank account.
                </p>
                <button
                  onClick={scrollToApply}
                  className="px-6 py-3 rounded-full bg-white text-[#07162E] hover:bg-blue-50 font-black text-xs sm:text-sm transition shadow-md active:scale-95"
                >
                  Apply to ride
                </button>
              </div>

              {/* Decorative Glow */}
              <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#0B3EDB]/20 blur-3xl pointer-events-none" />
            </div>

            {/* 2 Plan Cards: BASE and PRO DAY PASS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* BASE Plan Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    BASE
                  </span>
                  <div className="text-3xl font-black text-slate-900 mt-1 mb-1">
                    Free
                  </div>
                  <p className="text-xs text-slate-500 mb-6">
                    ₹9 cut per order, payout shown after delivery
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#0B3EDB] flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-slate-700 font-medium">
                        Weekly milestone bonuses
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#0B3EDB] flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-slate-700 font-medium">
                        Station with water and charging
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={scrollToApply}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                >
                  Start on Base Free
                </button>
              </div>

              {/* PRO, DAY PASS Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-blue-500 shadow-lg shadow-blue-500/5 flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-[#0B3EDB] uppercase tracking-wider">
                      PRO, DAY PASS
                    </span>
                    <span className="bg-[#0B3EDB] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      High Earner
                    </span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">
                    ₹99 a day
                  </div>
                  <p className="text-xs text-slate-500 mb-6">
                    Plus ₹4 to ₹9 per order, set by basket size
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#0B3EDB] flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-slate-700 font-medium">
                        See your payout before you accept
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#0B3EDB] flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-slate-700 font-medium">
                        Priority on new orders
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#0B3EDB] flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-slate-700 font-medium">
                        Higher weekly bonus slabs
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const proPlan = plans.find((p) => p.price > 0) || plans[0];
                    if (proPlan) handleChoosePlan(proPlan);
                    else scrollToApply();
                  }}
                  className="w-full py-3 rounded-xl bg-[#0B3EDB] hover:bg-[#0A2B6B] text-white text-xs font-black transition shadow-md shadow-blue-500/20"
                >
                  Activate Pro Day Pass
                </button>
              </div>

            </div>

            {/* Bottom 2 Cards: What you need & Apply Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start" ref={applyFormRef}>

              {/* What you need Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
                <h3 className="text-lg font-black text-slate-900 mb-5">
                  What you need
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#0B3EDB] flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-slate-700 font-medium">
                      ID proof and driving licence
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#0B3EDB] flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-slate-700 font-medium">
                      Vehicle registration and a helmet
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#0B3EDB] flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-slate-700 font-medium">
                      Bank account for payouts
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#0B3EDB] flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-slate-700 font-medium">
                      Wallet balance for cash orders, if you take them
                    </span>
                  </div>
                </div>
              </div>

              {/* Apply Form Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
                <h3 className="text-lg font-black text-slate-900 mb-4">
                  Apply
                </h3>

                {riderSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                    <h4 className="text-sm font-black text-emerald-900">Application Submitted!</h4>
                    <p className="text-xs text-emerald-700 mt-1">
                      Our fleet onboarding manager will call you within 2 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleRiderSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Full name
                        </label>
                        <input
                          type="text"
                          required
                          value={riderForm.fullName}
                          onChange={(e) => setRiderForm({ ...riderForm, fullName: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Mobile number
                        </label>
                        <input
                          type="tel"
                          required
                          value={riderForm.mobile}
                          onChange={(e) => setRiderForm({ ...riderForm, mobile: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Vehicle type
                        </label>
                        <input
                          type="text"
                          placeholder="Bike / Scooter / EV"
                          value={riderForm.vehicleType}
                          onChange={(e) => setRiderForm({ ...riderForm, vehicleType: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Area
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Vijay Nagar"
                          value={riderForm.area}
                          onChange={(e) => setRiderForm({ ...riderForm, area: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                      </div>
                    </div>

                    {/* Plan Selection for Rider */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                        Choose Starting Rider Plan:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRiderPlanChoice('free')}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                            riderPlanChoice === 'free'
                              ? 'border-[#0B3EDB] bg-blue-50/70 text-[#0B3EDB] shadow-xs'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>Base Free</span>
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full">₹0</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-normal mt-0.5">Start delivering with zero fee</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRiderPlanChoice('pro')}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                            riderPlanChoice === 'pro'
                              ? 'border-[#0B3EDB] bg-blue-50/70 text-[#0B3EDB] shadow-xs'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>Pro Day Pass</span>
                            <span className="text-[10px] bg-[#0B3EDB] text-white px-1.5 py-0.2 rounded-full">₹99</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-normal mt-0.5">+₹4 to ₹9 bonus on all orders</p>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={riderSubmitting}
                      className="w-full py-3 rounded-full bg-[#0B3EDB] hover:bg-[#0A2B6B] text-white font-black text-xs transition shadow-md shadow-blue-500/20 active:scale-95 mt-2"
                    >
                      {riderSubmitting
                        ? 'Processing...'
                        : riderPlanChoice === 'pro'
                        ? 'Apply & Pay ₹99 (Pro Rider)'
                        : 'Apply to ride (Base Free)'}
                    </button>
                  </form>
                )}
              </div>

            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Sample prices. Pro pays off on busy days with many orders.
            </p>
          </div>
        )}

        {/* ============================================================== */}
        {/* =================== TAB 3: SELL WITH TRICELYN =============== */}
        {/* ============================================================== */}
        {activeTab === 'vendor' && (
          <div className="animate-in fade-in duration-300 space-y-6 sm:space-y-8">

            {/* Dark Navy Hero Banner matching Screenshot 3 */}
            <div className="bg-[#07162E] rounded-3xl p-7 sm:p-10 text-white shadow-xl relative overflow-hidden">
              <div className="max-w-2xl relative z-10">
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
                  Sell from your own supermarket on Tricelyn.
                </h1>
                <p className="text-xs sm:text-base text-blue-100/90 leading-relaxed mb-6 font-medium">
                  Reach customers nearby, keep your name and rating in front of them, and let us handle the app, riders and payments.
                </p>
                <button
                  onClick={scrollToApply}
                  className="px-6 py-3 rounded-full bg-white text-[#07162E] hover:bg-blue-50 font-black text-xs sm:text-sm transition shadow-md active:scale-95"
                >
                  Apply to join
                </button>
              </div>

              {/* Decorative Glow */}
              <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#0B3EDB]/20 blur-3xl pointer-events-none" />
            </div>

            {/* 3 Value Cards matching Screenshot 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs">
                <h3 className="text-base font-black text-slate-900 mb-2">
                  Your name shows
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Customers pick your store and see your rating, ETA and full catalogue.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs">
                <h3 className="text-base font-black text-slate-900 mb-2">
                  Lower commission
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Published rates by category, with a launch offer for your first 60 days.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs">
                <h3 className="text-base font-black text-slate-900 mb-2">
                  No fleet needed
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  We assign riders, collect payments and settle to your bank account.
                </p>
              </div>

            </div>

            {/* Pricing (proposed) & What we need from your store */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

              {/* Pricing (proposed) Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
                <h3 className="text-lg font-black text-slate-900 mb-6">
                  Pricing (proposed)
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs sm:text-sm text-slate-700 font-medium">
                      Onboarding, 3,000+ live items
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      ₹25,000
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs sm:text-sm text-slate-700 font-medium">
                      Onboarding, under 3,000 items
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      ₹10,000
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs sm:text-sm text-slate-700 font-medium">
                      Commission, supermarkets
                    </span>
                    <span className="text-sm font-black text-[#0B3EDB]">
                      5 to 8%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-slate-700 font-medium">
                      Settlement
                    </span>
                    <span className="text-xs font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      [daily or weekly]
                    </span>
                  </div>
                </div>
              </div>

              {/* What we need from your store */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
                <h3 className="text-lg font-black text-slate-900 mb-5">
                  What we need from your store
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#0B3EDB] mt-1.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-slate-700 font-medium">
                      GST, shop licence, FSSAI and a bank account
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#0B3EDB] mt-1.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-slate-700 font-medium">
                      A catalogue with barcodes, prices and shelf codes
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#0B3EDB] mt-1.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-slate-700 font-medium">
                      A person to accept in 30 seconds and pack in about 2:30
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#0B3EDB] mt-1.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-slate-700 font-medium">
                      Stock marked in or out so customers never get surprises
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Apply Form matching Screenshot 3 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs" ref={applyFormRef}>
              <h3 className="text-lg font-black text-slate-900 mb-4">
                Apply
              </h3>

              {vendorSubmitted ? (
                <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                  <h4 className="text-base font-black text-emerald-900">Partner Application Received!</h4>
                  <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
                    Thank you. Our supermarket merchant onboarding team will visit your store or call within 24 hours to begin catalogue digitisation.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleVendorSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Store name
                      </label>
                      <input
                        type="text"
                        required
                        value={vendorForm.storeName}
                        onChange={(e) => setVendorForm({ ...vendorForm, storeName: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Owner name
                      </label>
                      <input
                        type="text"
                        required
                        value={vendorForm.ownerName}
                        onChange={(e) => setVendorForm({ ...vendorForm, ownerName: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Mobile number
                      </label>
                      <input
                        type="tel"
                        required
                        value={vendorForm.mobile}
                        onChange={(e) => setVendorForm({ ...vendorForm, mobile: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Area and sector
                      </label>
                      <input
                        type="text"
                        value={vendorForm.area}
                        onChange={(e) => setVendorForm({ ...vendorForm, area: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Live items (approx.)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1500 items, or 4000+ items"
                      value={vendorForm.liveItems}
                      onChange={(e) => setVendorForm({ ...vendorForm, liveItems: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>

                  {/* Onboarding Tier Selection for Vendor */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                      Select Supermarket Onboarding Tier:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setVendorPlanChoice('free')}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                          vendorPlanChoice === 'free'
                            ? 'border-[#0B3EDB] bg-blue-50/70 text-[#0B3EDB] shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>Base Free</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full">₹0</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-normal mt-0.5">Free basic listing</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVendorPlanChoice('starter')}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                          vendorPlanChoice === 'starter'
                            ? 'border-[#0B3EDB] bg-blue-50/70 text-[#0B3EDB] shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>Starter</span>
                          <span className="text-[10px] bg-[#0A2B6B] text-white px-1.5 py-0.2 rounded-full">₹10K</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-normal mt-0.5">&lt; 3,000 live items</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVendorPlanChoice('pro')}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                          vendorPlanChoice === 'pro'
                            ? 'border-[#0B3EDB] bg-blue-50/70 text-[#0B3EDB] shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>Supermarket Pro</span>
                          <span className="text-[10px] bg-[#0B3EDB] text-white px-1.5 py-0.2 rounded-full">₹25K</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-normal mt-0.5">3,000+ items & 5% cut</p>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={vendorSubmitting}
                    className="w-full py-3.5 rounded-full bg-[#0B3EDB] hover:bg-[#0A2B6B] text-white font-black text-xs sm:text-sm transition shadow-md shadow-blue-500/20 active:scale-95 mt-2"
                  >
                    {vendorSubmitting
                      ? 'Processing...'
                      : vendorPlanChoice === 'starter'
                      ? 'Apply & Pay ₹10,000 Onboarding Fee'
                      : vendorPlanChoice === 'pro'
                      ? 'Apply & Pay ₹25,000 Pro Onboarding Fee'
                      : 'Apply to join (Base Free Listing)'}
                  </button>
                </form>
              )}
            </div>

          </div>
        )}

      </div>

      {/* ================= CHECKOUT / ACTIVATION MODAL ================= */}
      {isCheckoutModalOpen && planToSubscribe && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto no-scrollbar">
            <button
              onClick={() => setIsCheckoutModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {subscriptionSuccess ? (
              <div className="text-center py-6 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-200 shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1">
                  Payment Successful!
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  {planToSubscribe.isApplication
                    ? `Your application with ${planToSubscribe.name} has been received and verified.`
                    : `Welcome to ${planToSubscribe.name}! Your VIP benefits are now live.`}
                </p>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6 text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Plan:</span>
                    <span className="font-bold text-slate-800">{planToSubscribe.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Paid:</span>
                    <span className="font-bold text-emerald-600">₹{planToSubscribe.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Mode:</span>
                    <span className="font-semibold text-slate-700">{paymentMethod}</span>
                  </div>
                  {lastTxnId && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Transaction Ref:</span>
                      <span className="font-mono text-[11px] text-slate-600">{lastTxnId}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Membership Badge:</span>
                    <span className="font-black text-[#0B3EDB] bg-blue-50 px-2 py-0.5 rounded-full">
                      {planToSubscribe.badge || 'PREMIER'} ✦
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="w-full py-3.5 rounded-full bg-[#0B3EDB] hover:bg-[#0A2B6B] text-white font-bold text-xs sm:text-sm shadow-md transition"
                >
                  Continue & Explore
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-[#0B3EDB]" />
                  <h3 className="text-lg font-black text-slate-900">
                    Complete Payment & Activate
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mb-5">
                  Secure checkout powered by Tricelyn Payments Gateway.
                </p>

                {/* Plan Summary Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 mb-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">
                        {planToSubscribe.name}
                      </span>
                      <span className="text-[10px] bg-[#0B3EDB] text-white font-black px-2 py-0.5 rounded-full uppercase">
                        {planToSubscribe.badge || 'VIP'}
                      </span>
                    </div>
                    <span className="text-lg font-black text-[#0B3EDB]">
                      ₹{planToSubscribe.price}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>Target: {planToSubscribe.targetAudience?.toUpperCase() || 'USER'}</span>
                    <span>Billing: {planToSubscribe.billingCycle}</span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="mb-5 space-y-2.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Select Payment Method:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                        paymentMethod === 'UPI'
                          ? 'border-[#0B3EDB] bg-blue-50 text-[#0B3EDB] shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Zap className="w-4 h-4 text-emerald-600" />
                      <span>UPI / QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Card')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                        paymentMethod === 'Card'
                          ? 'border-[#0B3EDB] bg-blue-50 text-[#0B3EDB] shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span>Debit/Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('NetBanking')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                        paymentMethod === 'NetBanking'
                          ? 'border-[#0B3EDB] bg-blue-50 text-[#0B3EDB] shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-amber-600" />
                      <span>Net Banking</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('TestPay')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                        paymentMethod === 'TestPay'
                          ? 'border-[#0B3EDB] bg-blue-50 text-[#0B3EDB] shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>Instant Test</span>
                    </button>
                  </div>
                </div>

                {/* Sub-form based on selected payment method */}
                {paymentMethod === 'UPI' && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mb-5 space-y-3">
                    <p className="text-[11px] font-bold text-slate-700">Choose UPI App:</p>
                    <div className="grid grid-cols-4 gap-2 text-[11px]">
                      {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                        <div
                          key={app}
                          className="p-2 bg-white rounded-xl border border-slate-200 text-center font-bold text-slate-700 hover:border-blue-400 cursor-pointer shadow-xs"
                        >
                          {app}
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Enter UPI ID</label>
                      <input
                        type="text"
                        placeholder="yourname@okhdfcbank"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'Card' && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mb-5 space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="4532 •••• •••• 8892"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          placeholder="08/28"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="•••"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'NetBanking' && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mb-5 space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Select Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 font-bold"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {paymentMethod === 'TestPay' && (
                  <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 mb-5 text-[11px] text-purple-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Instant demo pay mode: Authorizes and activates immediately without real money deduction.</span>
                  </div>
                )}

                {/* Cost Breakdown */}
                <div className="border-t border-slate-100 pt-3 mb-5 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Plan Subtotal:</span>
                    <span>₹{planToSubscribe.price}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Taxes & GST (18% included):</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 text-sm pt-1 border-t border-slate-100">
                    <span>Total Amount:</span>
                    <span className="text-[#0B3EDB]">₹{planToSubscribe.price}</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={handleConfirmSubscribe}
                  disabled={subscribing}
                  className="w-full py-3.5 rounded-full bg-[#0B3EDB] hover:bg-[#0A2B6B] text-white font-black text-sm transition shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  {subscribing ? (
                    <span>Processing Payment...</span>
                  ) : (
                    <>
                      <span>Pay ₹{planToSubscribe.price} & Activate</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

