const express = require('express');
const router = express.Router();
let Razorpay;
try {
  Razorpay = require('razorpay');
} catch (e) {
  Razorpay = null;
}
const crypto = require('crypto');

const isPlaceholderKey = (val = '') => {
  const s = String(val || '').trim();
  return !s || s.includes('placeholder') || s.includes('your_razorpay');
};

const getRazorpayConfig = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || '';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || '';
  const isSandbox = !Razorpay || isPlaceholderKey(key_id) || isPlaceholderKey(key_secret);
  return { key_id, key_secret, isSandbox };
};

router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = `rcpt_${Date.now()}` } = req.body;
    const numAmount = Number(amount || 0);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    const amountInPaise = Math.round(numAmount * 100);
    const { key_id, key_secret, isSandbox } = getRazorpayConfig();

    if (!isSandbox) {
      try {
        const razorpay = new Razorpay({ key_id, key_secret });
        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency,
          receipt,
          payment_capture: 1,
        });
        return res.status(200).json({
          success: true,
          isSandbox: false,
          keyId: key_id,
          id: order.id,
          amount: numAmount,
          amountPaise: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          order,
        });
      } catch (rzpErr) {
        console.error('Razorpay live order creation failed:', rzpErr.message);
        return res.status(502).json({
          success: false,
          message: rzpErr.message || 'Unable to initialize Razorpay order',
        });
      }
    }

    // Explicit test sandbox mode when merchant keys are not yet configured in .env
    const sandboxOrderId = `order_sandbox_${crypto.randomBytes(6).toString('hex')}`;
    return res.status(200).json({
      success: true,
      isSandbox: true,
      keyId: null,
      id: sandboxOrderId,
      amount: numAmount,
      amountPaise: amountInPaise,
      currency,
      receipt,
      message: 'Razorpay is running in test sandbox mode (merchant API keys not configured).',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isSandboxConfirm } = req.body;
    if (!razorpay_payment_id) {
      return res.status(400).json({ success: false, message: 'Payment ID is required' });
    }

    const { key_secret, isSandbox } = getRazorpayConfig();

    if (!isSandbox) {
      if (!razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Razorpay order ID and cryptographic signature are required for verification',
        });
      }
      const hmac = crypto.createHmac('sha256', key_secret);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const generatedSignature = hmac.digest('hex');
      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Payment signature verification failed',
        });
      }
    } else if (!isSandboxConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Live gateway keys are missing. Explicitly confirm test sandbox payment or use Cash on Delivery.',
      });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      isSandbox,
      message: isSandbox ? 'Test sandbox payment confirmed' : 'Payment verified successfully',
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
