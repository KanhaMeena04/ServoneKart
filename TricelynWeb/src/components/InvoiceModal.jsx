import React from 'react';
import { X, Printer, ShieldCheck, Download } from 'lucide-react';

const InvoiceModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const orderId = order._id || order.id || 'TRIC-000000';
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const items = order.items || [];
  const subtotal = items.reduce((sum, it) => sum + (Number(it.price) || 28) * (it.quantity || 1), 0);
  const deliveryFee = order.deliveryFee !== undefined ? order.deliveryFee : 0;
  const platformFee = 2;
  const totalAmount = order.totalAmount || (subtotal + deliveryFee + platformFee);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Actions */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-brand-600">
              Tax Invoice & Receipt
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Content */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 text-xs text-gray-800 bg-white" id="printable-invoice">
          
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-5">
            <div>
              <h2 className="text-2xl font-black text-brand-600 tracking-tight">TRICELYN</h2>
              <p className="text-[10px] uppercase font-bold text-gray-400">Everything You Actually Want</p>
              <p className="text-[11px] text-gray-500 mt-1 max-w-xs">
                Tricelyn Hyperlocal Commerce Pvt. Ltd.<br />
                Scheme 54, Vijay Nagar, Indore, MP - 452010<br />
                GSTIN: 23AABCT1234F1Z8 · FSSAI: 11422850000123
              </p>
            </div>

            <div className="text-right">
              <span className="bg-gray-100 text-gray-800 text-[10px] font-black px-2.5 py-1 rounded-md uppercase">
                Original For Recipient
              </span>
              <p className="text-xs font-black text-gray-900 mt-2">Invoice: INV-{orderId}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Order ID: #{orderId}</p>
              <p className="text-[11px] text-gray-500">Date: {orderDate}</p>
            </div>
          </div>

          {/* Customer & Delivery Details */}
          <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Delivery To:</p>
              <p className="text-xs font-bold text-gray-900 mt-0.5">
                {order.customerName || 'Tricelyn Customer'}
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                {order.deliveryAddress?.address || 'Scheme 54, Vijay Nagar, Indore, Madhya Pradesh'}
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Phone: {order.phone || '+91 98260 00000'}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment Details:</p>
              <p className="text-xs font-bold text-gray-900 mt-0.5">
                Method: {(order.paymentMethod || 'COD').toUpperCase()}
              </p>
              <p className="text-[11px] text-green-700 font-bold mt-0.5">Status: PAID / CONFIRMED</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Fulfillment Hub: Vijay Nagar, Indore</p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-black uppercase text-gray-400">
                  <th className="py-2">#</th>
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {items.map((it, idx) => {
                  const p = Number(it.price) || 28;
                  const qty = it.quantity || 1;
                  return (
                    <tr key={idx} className="py-2">
                      <td className="py-2 text-gray-400">{idx + 1}</td>
                      <td className="py-2 font-bold text-gray-900">{it.name || it.product?.name || 'Item'}</td>
                      <td className="py-2 text-center text-gray-700">{qty}</td>
                      <td className="py-2 text-right text-gray-700">₹{p.toFixed(2)}</td>
                      <td className="py-2 text-right font-bold text-gray-900">₹{(p * qty).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Calculation */}
          <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs text-gray-700 max-w-xs ml-auto">
            <div className="flex justify-between">
              <span>Items Total:</span>
              <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span className="font-semibold text-gray-900">
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Platform Handling:</span>
              <span className="font-semibold text-gray-900">₹{platformFee.toFixed(2)}</span>
            </div>

            <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-sm text-gray-900">
              <span>Grand Total:</span>
              <span className="text-base text-brand-600">₹{Number(totalAmount).toFixed(2)}</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="border-t border-gray-100 pt-4 text-center text-[10px] text-gray-400 space-y-1">
            <p>This is a computer generated invoice and does not require a physical signature.</p>
            <p className="font-semibold text-gray-600">Thank you for ordering with Tricelyn Quick Commerce Indore!</p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default InvoiceModal;

