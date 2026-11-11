import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Banknote,
  Loader2
} from 'lucide-react';
import { paymentService } from '../services/api';

const PaymentModal = ({ isOpen, onClose, amount, customer, onPaymentSuccess, onSwitchToCod }) => {
  const [initializing, setInitializing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [gatewayOrder, setGatewayOrder] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setGatewayOrder(null);
      setError('');
      return;
    }

    let active = true;
    const initGatewayOrder = async () => {
      setInitializing(true);
      setError('');
      try {
        const res = await paymentService.createOrder({
          amount: Number(amount),
          currency: 'INR',
          receipt: `tricelyn_${Date.now()}`,
        });
        if (!active) return;
        setGatewayOrder(res.data);
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || 'Unable to reach payment gateway.');
      } finally {
        if (active) setInitializing(false);
      }
    };

    initGatewayOrder();
    return () => {
      active = false;
    };
  }, [isOpen, amount]);

  if (!isOpen) return null;

  const handleLaunchLiveRazorpay = () => {
    if (!gatewayOrder || gatewayOrder.isSandbox) return;
    if (typeof window === 'undefined' || typeof window.Razorpay !== 'function') {
      setError('Razorpay SDK script is not loaded in index.html. Please switch to Cash on Delivery.');
      return;
    }

    setProcessing(true);
    setError('');

    const rzp = new window.Razorpay({
      key: gatewayOrder.keyId,
      amount: gatewayOrder.amountPaise,
      currency: gatewayOrder.currency || 'INR',
      name: 'Tricelyn Quick Grocery',
      description: 'Multi-Vendor Grocery Order',
      order_id: gatewayOrder.id,
      prefill: {
        name: customer?.name || '',
        contact: customer?.phone || '',
      },
      handler: async (resp) => {
        try {
          const verifyRes = await paymentService.verifyPayment({
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
          });
          setProcessing(false);
          onPaymentSuccess({
            paymentId: verifyRes.data?.paymentId || resp.razorpay_payment_id,
            status: 'paid',
          });
        } catch (vErr) {
          setProcessing(false);
          setError(vErr.response?.data?.message || 'Payment verification failed.');
        }
      },
      modal: {
        ondismiss: () => setProcessing(false),
      },
    });
    rzp.open();
  };

  const handleSandboxVerify = async () => {
    if (!gatewayOrder) return;
    setProcessing(true);
    setError('');
    try {
      const testPaymentId = `pay_sandbox_${Date.now()}`;
      const res = await paymentService.verifyPayment({
        razorpay_order_id: gatewayOrder.id,
        razorpay_payment_id: testPaymentId,
        isSandboxConfirm: true,
      });
      setProcessing(false);
      onPaymentSuccess({
        paymentId: res.data?.paymentId || testPaymentId,
        status: 'paid',
      });
    } catch (err) {
      setProcessing(false);
      setError(err.response?.data?.message || 'Sandbox payment confirmation failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="bg-brand-600 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-blue-200 text-xs font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Tricelyn Pay Checkout</span>
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

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {initializing ? (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              <p className="text-xs font-bold text-gray-600">Connecting to Razorpay order server...</p>
            </div>
          ) : gatewayOrder && !gatewayOrder.isSandbox ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-xs text-green-900 space-y-1">
                <p className="font-black">Live Razorpay Gateway Ready</p>
                <p className="text-[11px] text-green-700">Order Ref: {gatewayOrder.id}</p>
              </div>

              <button
                onClick={handleLaunchLiveRazorpay}
                disabled={processing}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                <span>{processing ? 'Waiting for Payment...' : `Open Secure Razorpay (₹${Number(amount).toFixed(0)})`}</span>
              </button>
            </div>
          ) : gatewayOrder && gatewayOrder.isSandbox ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-black text-amber-800">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Gateway Sandbox Test Mode</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800/90">
                  Live Razorpay API merchant keys are not configured on the backend environment. No real money is debited here.
                </p>
                <p className="text-[10px] font-mono text-amber-700">Ref: {gatewayOrder.id}</p>
              </div>

              {onSwitchToCod && (
                <button
                  onClick={onSwitchToCod}
                  disabled={processing}
                  className="w-full py-3.5 bg-accent-green hover:bg-accent-greenDark text-white rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Banknote className="w-4 h-4" />
                  <span>Place Order via Cash on Delivery (Recommended)</span>
                </button>
              )}

              <button
                onClick={handleSandboxVerify}
                disabled={processing}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                <span>{processing ? 'Confirming Test Payment...' : 'Confirm Test Sandbox Order'}</span>
              </button>
            </div>
          ) : (
            onSwitchToCod && (
              <button
                onClick={onSwitchToCod}
                className="w-full py-3.5 bg-accent-green hover:bg-accent-greenDark text-white rounded-2xl text-xs font-black transition flex items-center justify-center gap-2"
              >
                <Banknote className="w-4 h-4" />
                <span>Switch to Cash on Delivery</span>
              </button>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-400">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span>Backend Verified Order Settlement</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
