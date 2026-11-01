import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Smartphone, 
  Building2, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Lock
} from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, amount, onPaymentSuccess, orderInfo }) => {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'qr' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 min timer

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const handleProcessPayment = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onPaymentSuccess({
        paymentId: 'PAY_' + Date.now(),
        method: activeTab,
        status: 'success',
      });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-brand-600 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-blue-200 text-xs font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>100% Secure Payment</span>
            </div>
            <h3 className="text-xl font-black text-white mt-0.5">
              Pay ₹{Number(amount).toFixed(0)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selectors */}
        <div className="grid grid-cols-4 border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-600">
          <button
            onClick={() => setActiveTab('upi')}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition ${
              activeTab === 'upi'
                ? 'border-brand-600 text-brand-600 bg-white'
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>UPI Apps</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition ${
              activeTab === 'qr'
                ? 'border-brand-600 text-brand-600 bg-white'
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR</span>
          </button>

          <button
            onClick={() => setActiveTab('card')}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition ${
              activeTab === 'card'
                ? 'border-brand-600 text-brand-600 bg-white'
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Cards</span>
          </button>

          <button
            onClick={() => setActiveTab('netbanking')}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition ${
              activeTab === 'netbanking'
                ? 'border-brand-600 text-brand-600 bg-white'
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>NetBanking</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: UPI APPS */}
          {activeTab === 'upi' && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Select your preferred UPI App
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Google Pay', logo: '🌐' },
                  { name: 'PhonePe', logo: '🟣' },
                  { name: 'Paytm UPI', logo: '🔷' },
                  { name: 'BHIM UPI', logo: '🇮🇳' },
                ].map((app) => (
                  <button
                    key={app.name}
                    onClick={handleProcessPayment}
                    className="p-3.5 rounded-2xl border border-gray-200 hover:border-brand-500 hover:bg-brand-50/50 flex items-center gap-3 transition text-left group"
                  >
                    <span className="text-2xl">{app.logo}</span>
                    <span className="text-xs font-bold text-gray-900 group-hover:text-brand-600">
                      {app.name}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Or enter UPI ID / VPA
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. mobile@okaxis, user@okhdfcbank"
                    className="flex-1 px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 font-semibold"
                  />
                  <button
                    onClick={handleProcessPayment}
                    className="px-4 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition"
                  >
                    Verify & Pay
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCAN QR CODE */}
          {activeTab === 'qr' && (
            <div className="text-center space-y-4 py-2">
              <div className="inline-block p-4 bg-white border-2 border-brand-500 rounded-3xl shadow-sm relative">
                {/* Simulated Dynamic UPI QR SVG */}
                <div className="w-48 h-48 bg-gray-50 flex flex-col items-center justify-center p-2 rounded-2xl border border-gray-200 relative overflow-hidden">
                  <QrCode className="w-40 h-40 text-gray-900" />
                  <div className="absolute inset-0 bg-brand-600/5 flex items-center justify-center pointer-events-none">
                    <span className="bg-brand-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow">
                      TRICELYN UPI
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-800">
                  Scan QR using Any UPI App (PhonePe, GPay, Paytm)
                </p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Expires in {timerStr}</span>
                </div>
              </div>

              <button
                onClick={handleProcessPayment}
                className="w-full py-3 bg-accent-green hover:bg-accent-greenDark text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Simulate Completed Payment</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 3: CARDS */}
          {activeTab === 'card' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                  placeholder="4532 •••• •••• 8901"
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 font-semibold tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Valid Thru (MM/YY)
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="12/28"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    placeholder="•••"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 font-semibold"
                  />
                </div>
              </div>

              <button
                onClick={handleProcessPayment}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 mt-4"
              >
                <span>Pay ₹{Number(amount).toFixed(0)} Securely</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 4: NET BANKING */}
          {activeTab === 'netbanking' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Select Bank
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBank(b)}
                    className={`p-3 rounded-xl border text-xs font-bold transition text-left ${
                      selectedBank === b
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              <button
                onClick={handleProcessPayment}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 mt-4"
              >
                <span>Proceed to {selectedBank}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

        {/* Processing Overlay */}
        {processing && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3 z-30">
            <div className="w-14 h-14 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
            <h4 className="text-base font-black text-gray-900">Processing Payment...</h4>
            <p className="text-xs text-gray-500">
              Please do not refresh or close this window while we securely confirm your order.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-400">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span>256-Bit Encrypted Payment Gateway · PCI-DSS Compliant</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
