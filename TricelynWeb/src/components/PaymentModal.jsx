import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeft,
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Banknote,
  QrCode,
  Smartphone,
  Building2,
  Wallet,
  Clock,
  ChevronRight,
  ChevronDown,
  Loader2,
  Sparkles,
  Check
} from 'lucide-react';

const NETBANKING_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC', badgeColor: 'bg-blue-900 text-white', icon: '🏦' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI', badgeColor: 'bg-orange-700 text-white', icon: '🏢' },
  { id: 'sbi', name: 'State Bank of India', code: 'SBI', badgeColor: 'bg-cyan-700 text-white', icon: '🏛️' },
  { id: 'axis', name: 'Axis Bank', code: 'AXIS', badgeColor: 'bg-rose-900 text-white', icon: '🔺' },
  { id: 'kotak', name: 'Kotak Bank', code: 'KOTAK', badgeColor: 'bg-red-700 text-white', icon: '🔴' },
  { id: 'pnb', name: 'Punjab National Bank', code: 'PNB', badgeColor: 'bg-amber-800 text-white', icon: '🪙' },
];

const MORE_BANKS = [
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'IndusInd Bank',
  'IDFC FIRST Bank',
  'Yes Bank',
  'Federal Bank',
  'Central Bank of India',
  'Indian Bank',
  'RBL Bank'
];

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  amount, 
  customer, 
  onPaymentSuccess, 
  onSwitchToCod 
}) => {
  // Navigation / active section: 'list', 'qr', 'card', 'upi_id', 'netbanking', 'wallet'
  const [activeTab, setActiveTab] = useState('all');
  const [expandedSection, setExpandedSection] = useState('upi'); // 'upi', 'card', 'netbanking', 'wallet', 'paylater'

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(customer?.name || '');
  const [saveCard, setSaveCard] = useState(true);

  // UPI ID state
  const [upiId, setUpiId] = useState('');

  // Selected Bank / Wallet state
  const [selectedBank, setSelectedBank] = useState('hdfc');
  const [selectedWallet, setSelectedWallet] = useState('phonepe');

  // QR Modal Simulation
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrTimer, setQrTimer] = useState(299); // 5 mins

  // Mock Payment Processing State
  const [processingState, setProcessingState] = useState('idle'); // 'idle' | 'contacting' | 'authorizing' | 'success'
  const [processingMethodName, setProcessingMethodName] = useState('UPI');
  const [mockTxnId, setMockTxnId] = useState('');
  const [error, setError] = useState('');

  // Reset on open/close
  useEffect(() => {
    if (!isOpen) {
      setProcessingState('idle');
      setError('');
      setShowQrModal(false);
      return;
    }
    setQrTimer(299);
  }, [isOpen]);

  // QR countdown timer
  useEffect(() => {
    if (!showQrModal || qrTimer <= 0) return;
    const interval = setInterval(() => {
      setQrTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showQrModal, qrTimer]);

  if (!isOpen) return null;

  // Format Card Number input with spaces (4532 8901 2345 6789)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : raw);
  };

  // Format Expiry input (MM/YY)
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Trigger Mock Payment Flow
  const triggerPaymentExecution = (methodTitle = 'UPI / Online') => {
    setError('');
    setProcessingMethodName(methodTitle);
    setProcessingState('contacting');

    const generatedTxn = `TRIC_PAY_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    setMockTxnId(generatedTxn);

    // Step 1: Contacting Bank (800ms)
    setTimeout(() => {
      setProcessingState('authorizing');

      // Step 2: Authorizing & Verified (1200ms)
      setTimeout(() => {
        setProcessingState('success');

        // Step 3: Complete & callback (900ms)
        setTimeout(() => {
          onPaymentSuccess({
            paymentId: generatedTxn,
            paymentMethod: 'online',
            status: 'paid',
            details: {
              method: methodTitle,
              transactionId: generatedTxn,
              amount: Number(amount)
            }
          });
        }, 900);

      }, 1200);

    }, 800);
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();
    const cleanNum = cardNumber.replace(/\s/g, '');
    if (cleanNum.length < 15) {
      setError('Please enter a valid 16-digit card number.');
      return;
    }
    if (cardExpiry.length < 5) {
      setError('Please enter a valid MM/YY expiry date.');
      return;
    }
    if (cardCvv.length < 3) {
      setError('Please enter a valid 3-digit CVV.');
      return;
    }
    triggerPaymentExecution(`Card (${cleanNum.slice(-4)})`);
  };

  const handleUpiSubmit = (e) => {
    e.preventDefault();
    if (!upiId.trim() || !upiId.includes('@')) {
      setError('Please enter a valid UPI ID (e.g. mobile@upi or name@okaxis)');
      return;
    }
    triggerPaymentExecution(`UPI ID (${upiId.trim()})`);
  };

  const formattedTime = `${Math.floor(qrTimer / 60).toString().padStart(2, '0')}:${(qrTimer % 60).toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]">
        
        {/* ============================================================
            TOP HEADER (Matches Screenshot 3 & 4)
           ============================================================ */}
        <div className="bg-[#07162E] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-blue-900/40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition active:scale-95 cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Payment Options
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% Secure
                </span>
              </div>
              <p className="text-[11px] text-gray-300 font-medium">
                To Pay: <span className="font-extrabold text-emerald-400 text-xs sm:text-sm">₹{Number(amount).toFixed(0)}</span>
                {customer?.locality && ` • Delivering to ${customer.locality}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================
            PAYMENT PROCESSING OVERLAY (When Mock Pay is Clicked)
           ============================================================ */}
        {processingState !== 'idle' ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 my-auto">
            {processingState === 'contacting' && (
              <>
                <div className="relative w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                  <Loader2 className="w-9 h-9 text-[#0145F2] animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-gray-900">Connecting to {processingMethodName}...</h4>
                  <p className="text-xs text-gray-500">Contacting secure bank servers for authorization</p>
                </div>
              </>
            )}

            {processingState === 'authorizing' && (
              <>
                <div className="relative w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                  <ShieldCheck className="w-9 h-9 text-amber-600 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-gray-900">Authorizing Payment of ₹{Number(amount).toFixed(0)}</h4>
                  <p className="text-xs text-gray-500">Verifying secure token and settling transaction...</p>
                  <p className="text-[10px] text-gray-400 font-mono">Ref: {mockTxnId}</p>
                </div>
              </>
            )}

            {processingState === 'success' && (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-emerald-700">Payment Successful!</h4>
                  <p className="text-xs text-gray-600 font-semibold">₹{Number(amount).toFixed(0)} paid via {processingMethodName}</p>
                  <p className="text-[11px] text-gray-400 font-mono mt-1">Txn ID: {mockTxnId}</p>
                  <p className="text-xs text-emerald-600 font-bold pt-1">Redirecting to Live Order Tracking...</p>
                </div>
              </>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 pt-3">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span>256-bit Encrypted Banking Handshake</span>
            </div>
          </div>
        ) : (

          /* ============================================================
              MAIN PAYMENT SELECTION BODY (Matches Screenshot 3 & 4)
             ============================================================ */
          <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
            
            {error && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. UPI | PAY BY UPI SECTION (Matches Screenshot 4) */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
              <div 
                onClick={() => setExpandedSection(expandedSection === 'upi' ? '' : 'upi')}
                className="p-3.5 sm:p-4 bg-gradient-to-r from-blue-50/50 to-white flex items-center justify-between cursor-pointer border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    UPI
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-black text-gray-900">UPI • Instant Pay</h4>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                        Fastest
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium">Google Pay, PhonePe, Paytm, QR Code & UPI ID</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === 'upi' ? 'rotate-180' : ''}`} />
              </div>

              {expandedSection === 'upi' && (
                <div className="p-4 space-y-3.5 bg-gray-50/40">
                  {/* Option 1A: Pay via QR Code (Matches Screenshot 4) */}
                  <div 
                    onClick={() => setShowQrModal(!showQrModal)}
                    className="p-3 bg-white hover:bg-blue-50/50 border border-gray-200 rounded-xl cursor-pointer transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-700 transition">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-900 group-hover:text-blue-700">
                            Pay via QR Code
                          </span>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-emerald-500 text-white rounded">
                            NEW
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400">Scan & pay with any UPI app</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* QR Code Reveal Container */}
                  {showQrModal && (
                    <div className="p-4 bg-white rounded-2xl border-2 border-blue-500 shadow-md text-center space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-100">
                        <span className="font-extrabold text-gray-800">Scan QR to pay ₹{Number(amount).toFixed(0)}</span>
                        <span className="font-bold text-red-500 flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3" />
                          <span>Expires in {formattedTime}</span>
                        </span>
                      </div>

                      {/* Mock Rendered QR Box */}
                      <div className="relative mx-auto w-44 h-44 bg-white p-2.5 rounded-2xl border-2 border-gray-900 flex flex-col items-center justify-center shadow-inner">
                        <div className="w-full h-full bg-radial from-slate-900 via-slate-800 to-black p-2 rounded-xl flex flex-col items-center justify-center text-white">
                          <QrCode className="w-28 h-28 text-white" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">TRICELYN UPI</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-500">Open GPay, PhonePe, Paytm or BHIM on your phone & scan</p>

                      <button
                        type="button"
                        onClick={() => triggerPaymentExecution('QR Code Scanner')}
                        className="w-full py-2.5 bg-[#0c831f] hover:bg-[#0a701a] text-white rounded-xl text-xs font-black transition shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>Simulate Scan & Pay ₹{Number(amount).toFixed(0)}</span>
                      </button>
                    </div>
                  )}

                  {/* Option 1B: Popular UPI Apps (PhonePe, Google Pay, Paytm) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: 'PhonePe', color: 'bg-purple-600', icon: '🟣', sub: 'Instant UPI' },
                      { name: 'Google Pay', color: 'bg-blue-600', icon: '🟢', sub: 'GPay App' },
                      { name: 'Paytm', color: 'bg-cyan-600', icon: '🔷', sub: 'UPI / Wallet' },
                      { name: 'Cred UPI', color: 'bg-slate-900', icon: '⚡', sub: 'Cred App' },
                    ].map((app) => (
                      <button
                        key={app.name}
                        type="button"
                        onClick={() => triggerPaymentExecution(app.name)}
                        className="p-2.5 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-400 rounded-xl transition text-left flex flex-col justify-between cursor-pointer active:scale-95 shadow-2xs"
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-base">{app.icon}</span>
                          <span className="text-[9px] font-extrabold text-blue-600">PAY</span>
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-gray-900">{app.name}</div>
                          <div className="text-[10px] text-gray-400">{app.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Option 1C: Enter UPI ID Form */}
                  <form onSubmit={handleUpiSubmit} className="pt-2 border-t border-gray-200/60 space-y-2">
                    <label className="block text-[11px] font-bold text-gray-700">
                      Or pay via UPI ID
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. 9876543210@upi or name@okhdfcbank"
                        className="flex-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#0145F2] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap cursor-pointer active:scale-95"
                      >
                        Verify & Pay
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* 2. CREDIT & DEBIT CARDS (Matches Screenshot 3 & 4) */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
              <div 
                onClick={() => setExpandedSection(expandedSection === 'card' ? '' : 'card')}
                className="p-3.5 sm:p-4 bg-gradient-to-r from-gray-50/60 to-white flex items-center justify-between cursor-pointer border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-black text-gray-900">Credit & Debit Cards</h4>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                        <span>Visa</span> • <span>Mastercard</span> • <span>RuPay</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium">Add new card for instant payment</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === 'card' ? 'rotate-180' : ''}`} />
              </div>

              {expandedSection === 'card' && (
                <form onSubmit={handleCardSubmit} className="p-4 space-y-3 bg-gray-50/40">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4532 8901 2345 6789"
                        className="w-full pl-3 pr-10 py-2.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 font-mono font-medium tracking-wider"
                      />
                      <CreditCard className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Valid Thru (MM/YY)
                      </label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="12/28"
                        className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 font-mono font-medium text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="•••"
                        className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 font-mono font-medium text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="save-card-check"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="save-card-check" className="text-[11px] text-gray-600 font-medium cursor-pointer">
                      Save this card securely as per RBI guidelines
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#0145F2] hover:bg-blue-700 text-white rounded-xl text-xs font-black transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay ₹{Number(amount).toFixed(0)}</span>
                  </button>
                </form>
              )}
            </div>

            {/* 3. NETBANKING SECTION (Matches Screenshot 3 & 4) */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
              <div 
                onClick={() => setExpandedSection(expandedSection === 'netbanking' ? '' : 'netbanking')}
                className="p-3.5 sm:p-4 bg-gradient-to-r from-gray-50/60 to-white flex items-center justify-between cursor-pointer border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-gray-900">Netbanking</h4>
                    <p className="text-[11px] text-gray-500 font-medium">HDFC, ICICI, SBI, Axis, Kotak & 50+ Banks</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === 'netbanking' ? 'rotate-180' : ''}`} />
              </div>

              {expandedSection === 'netbanking' && (
                <div className="p-4 space-y-3 bg-gray-50/40">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {NETBANKING_BANKS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBank(b.id)}
                        className={`p-2.5 rounded-xl border transition flex flex-col items-center justify-center text-center cursor-pointer ${
                          selectedBank === b.id
                            ? 'bg-blue-50/80 border-[#0145F2] shadow-2xs ring-1 ring-blue-500'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-lg mb-1">{b.icon}</span>
                        <span className="text-[11px] font-black text-gray-800 line-clamp-1">{b.code}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Or select from other banks:
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                    >
                      {MORE_BANKS.map((bank) => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerPaymentExecution(`Netbanking (${selectedBank.toUpperCase()})`)}
                    className="w-full py-3 bg-[#0145F2] hover:bg-blue-700 text-white rounded-xl text-xs font-black transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Pay ₹{Number(amount).toFixed(0)} via Netbanking</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. WALLETS (Matches Screenshot 3 & 4) */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
              <div 
                onClick={() => setExpandedSection(expandedSection === 'wallet' ? '' : 'wallet')}
                className="p-3.5 sm:p-4 bg-gradient-to-r from-gray-50/60 to-white flex items-center justify-between cursor-pointer border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-gray-900">Wallets</h4>
                    <p className="text-[11px] text-gray-500 font-medium">PhonePe, Amazon Pay, Paytm & Mobikwik</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === 'wallet' ? 'rotate-180' : ''}`} />
              </div>

              {expandedSection === 'wallet' && (
                <div className="p-4 space-y-3 bg-gray-50/40">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'phonepe', name: 'PhonePe Wallet', icon: '🟣', bal: 'Link Wallet' },
                      { id: 'amazon', name: 'Amazon Pay Balance', icon: '🟠', bal: 'Link Account' },
                      { id: 'paytm', name: 'Paytm Wallet', icon: '🔷', bal: 'Link Wallet' },
                      { id: 'mobikwik', name: 'Mobikwik Wallet', icon: '🔴', bal: 'Link Wallet' },
                    ].map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setSelectedWallet(w.id)}
                        className={`p-3 rounded-xl border transition flex items-center justify-between text-left cursor-pointer ${
                          selectedWallet === w.id
                            ? 'bg-blue-50/80 border-[#0145F2] shadow-2xs ring-1 ring-blue-500'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{w.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{w.name}</p>
                            <p className="text-[10px] text-gray-400">{w.bal}</p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="wallet-select"
                          checked={selectedWallet === w.id}
                          onChange={() => setSelectedWallet(w.id)}
                          className="text-blue-600"
                        />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerPaymentExecution(`Wallet (${selectedWallet})`)}
                    className="w-full py-3 bg-[#0145F2] hover:bg-blue-700 text-white rounded-xl text-xs font-black transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Pay ₹{Number(amount).toFixed(0)} with Wallet</span>
                  </button>
                </div>
              )}
            </div>

            {/* 5. PAY LATER (LazyPay & Simpl - Screenshot 4) */}
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
              <div 
                onClick={() => setExpandedSection(expandedSection === 'paylater' ? '' : 'paylater')}
                className="p-3.5 sm:p-4 bg-gradient-to-r from-gray-50/60 to-white flex items-center justify-between cursor-pointer border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    ⏳
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-gray-900">Pay Later</h4>
                    <p className="text-[11px] text-gray-500 font-medium">LazyPay, Simpl • 1-Click Pay</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === 'paylater' ? 'rotate-180' : ''}`} />
              </div>

              {expandedSection === 'paylater' && (
                <div className="p-4 space-y-3 bg-gray-50/40">
                  <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">LazyPay by PayU</p>
                      <p className="text-[10px] text-emerald-600 font-bold">✓ Pre-approved for your registered mobile</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => triggerPaymentExecution('LazyPay PayLater')}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition"
                    >
                      Pay ₹{Number(amount).toFixed(0)}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 6. SWITCH TO CASH ON DELIVERY (COD) OPTION */}
            {onSwitchToCod && (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-950">Prefer Cash or UPI at door?</p>
                    <p className="text-[11px] text-emerald-700 font-medium">Pay to delivery partner upon arrival</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onSwitchToCod}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap active:scale-95"
                >
                  Switch to COD
                </button>
              </div>
            )}

          </div>
        )}

        {/* ============================================================
            FOOTER TRUST BADGE
           ============================================================ */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 flex-shrink-0">
          <div className="flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified 256-bit Bank Grade SSL Security</span>
          </div>
          <span className="font-extrabold text-gray-700">Tricelyn Pay</span>
        </div>

      </div>
    </div>
  );
};

export default PaymentModal;