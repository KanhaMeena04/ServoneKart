import React from 'react';
import { X, Printer, ShieldCheck, Download, Store, HelpCircle } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';

const InvoiceModal = ({ isOpen, onClose, order }) => {
  const { appSettings } = usePlatform();

  if (!isOpen || !order) return null;

  // Resolve Dynamic Invoice Configuration from order or platform settings
  const invoiceCfg = order.invoiceConfig || appSettings?.invoiceConfig || {};
  const brandName = invoiceCfg.brandName || appSettings?.appName || 'TRICELYN';
  const tagline = invoiceCfg.tagline || 'Groceries in minutes, from your own supermarket';
  const legalEntityName = invoiceCfg.legalEntityName || 'Tricelyn Hyperlocal Commerce Pvt. Ltd.';
  const companyAddress = invoiceCfg.companyAddress || 'Scheme 54, Vijay Nagar, Indore, MP - 452010';
  const gstin = invoiceCfg.gstin || '23AABCT1234F1Z8';
  const fssai = invoiceCfg.fssai || '11422850000123';
  const supportEmail = invoiceCfg.supportEmail || appSettings?.siteEmail || 'care@tricelyn.com';
  const supportPhone = invoiceCfg.supportPhone || appSettings?.siteContact || '+91 731-4099880';
  const accentColor = invoiceCfg.accentColor || '#0145F2';
  const customFooterNote = invoiceCfg.customFooterNote || 'This is a computer-generated invoice and requires no physical signature.';
  const termsAndConditions = invoiceCfg.termsAndConditions || '1. All disputes subject to Indore jurisdiction.\n2. Fresh produce & essentials eligible for instant doorstep inspection & return.\n3. Goods sold under Tricelyn freshness & quality guarantee.';

  // Resolve Store / Vendor Details
  const seller = order.seller || {};
  const storeDisplay = seller.storeName || order.storeName || order.restaurantName || (typeof order.restaurant === 'object' ? order.restaurant?.name : null) || 'Tricelyn Dark Store';
  const storeTradeName = seller.tradeName || seller.legalName || storeDisplay;
  const storeAddress = seller.address || order.restaurantAddress || 'Indore Fulfillment Hub, Scheme 54';
  const storeGstin = seller.gstin || gstin;
  const storeFssai = seller.fssaiNumber || fssai;
  const storeSignatory = seller.authorizedSignatory || invoiceCfg.authorizedSignatoryLabel || 'Authorized Signatory';

  const orderId = order._id || order.id || 'TRIC-000000';
  const orderNumber = order.orderNumber || `#${String(orderId).slice(-8).toUpperCase()}`;
  const invNumber = order.invoiceNumber || `${invoiceCfg.invoicePrefix || 'TRC-INV'}-${String(orderId).slice(-6).toUpperCase()}`;

  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const items = order.items || [];
  const subtotal = items.reduce((sum, it) => sum + (Number(it.price) || 28) * (it.quantity || 1), 0);
  const deliveryFee = order.deliveryFee !== undefined ? Number(order.deliveryFee) : 0;
  const platformFee = Number(order.platformFee ?? appSettings?.platformFeeConfig?.fee ?? 2);
  const packagingFee = Number(order.packagingFee ?? 0);
  const discount = Number(order.discount ?? 0);
  const totalAmount = order.totalAmount !== undefined ? Number(order.totalAmount) : (subtotal + deliveryFee + platformFee + packagingFee - discount);

  // Compute GST split for display
  const taxableTotal = Math.round((subtotal / 1.05) * 100) / 100;
  const totalGst = Math.round((subtotal - taxableTotal) * 100) / 100;
  const cgst = Math.round((totalGst / 2) * 100) / 100;
  const sgst = cgst;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Actions */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider" style={{ color: accentColor }}>
              Official Tax Invoice & Receipt
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              style={{ backgroundColor: accentColor }}
              className="px-3.5 py-1.5 hover:opacity-90 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
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
              <h2 className="text-2xl font-black tracking-tight" style={{ color: accentColor }}>
                {brandName}
              </h2>
              <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">
                {tagline}
              </p>
              <p className="text-[11px] text-gray-500 mt-1 max-w-xs leading-relaxed">
                {legalEntityName}<br />
                {companyAddress}<br />
                GSTIN: {gstin} · FSSAI: {fssai}
              </p>
            </div>

            <div className="text-right">
              <span className="bg-gray-100 text-gray-800 text-[10px] font-black px-2.5 py-1 rounded-md uppercase">
                Original For Recipient
              </span>
              <p className="text-xs font-black text-gray-900 mt-2">Invoice: {invNumber}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Order ID: {orderNumber}</p>
              <p className="text-[11px] text-gray-500">Date: {orderDate}</p>
            </div>
          </div>

          {/* Seller / Store & Delivery Details */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Store className="w-3 h-3 text-gray-400" />
                <span>Sold & Dispatched By:</span>
              </p>
              <p className="text-xs font-black text-gray-900 mt-0.5">
                {storeDisplay}
              </p>
              {storeTradeName !== storeDisplay && (
                <p className="text-[10px] text-gray-500 italic">({storeTradeName})</p>
              )}
              <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                {storeAddress}
              </p>
              <p className="text-[10px] text-gray-500 font-mono mt-1">
                GSTIN: {storeGstin}
              </p>
              <p className="text-[10px] text-gray-500 font-mono">
                FSSAI: {storeFssai}
              </p>
            </div>

            <div className="text-left border-l border-gray-200/80 pl-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Delivery To:</p>
              <p className="text-xs font-bold text-gray-900 mt-0.5">
                {order.customerName || order.user?.name || 'Tricelyn Customer'}
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                {order.deliveryAddress?.addressLine || order.deliveryAddress?.fullAddress || order.deliveryAddress?.address || 'Standard Delivery Address'}
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Phone: {order.customerPhone || order.phone || order.user?.phone || '+91 98260 00000'}
              </p>
              <div className="mt-2 pt-2 border-t border-gray-200/60 text-[10px] text-gray-500">
                <span className="font-semibold text-gray-700">Payment: </span>
                <span className="uppercase font-bold text-emerald-700">{(order.paymentMethod || 'Online').toUpperCase()} · PAID</span>
              </div>
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
                  <th className="py-2 text-right">Taxable</th>
                  <th className="py-2 text-right">GST (5%)</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {items.map((it, idx) => {
                  const p = Number(it.price || it.unitPrice) || 28;
                  const qty = it.quantity || 1;
                  const lineTotal = Number(it.total ?? (p * qty));
                  const itemTaxable = Math.round((lineTotal / 1.05) * 100) / 100;
                  const itemGst = Math.round((lineTotal - itemTaxable) * 100) / 100;

                  return (
                    <tr key={idx} className="py-2">
                      <td className="py-2 text-gray-400 font-mono">{idx + 1}</td>
                      <td className="py-2 font-bold text-gray-900">
                        {it.name || it.productName || it.product?.name || 'Grocery Item'}
                        {it.unit && <span className="text-[10px] font-normal text-gray-500 ml-1.5">({it.unit})</span>}
                      </td>
                      <td className="py-2 text-center text-gray-700 font-bold">{qty}</td>
                      <td className="py-2 text-right text-gray-700">₹{p.toFixed(2)}</td>
                      <td className="py-2 text-right text-gray-600">₹{itemTaxable.toFixed(2)}</td>
                      <td className="py-2 text-right text-gray-500">₹{itemGst.toFixed(2)}</td>
                      <td className="py-2 text-right font-black text-gray-900">₹{lineTotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Calculation & Signatory */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-t border-gray-200 pt-3">
            <div className="text-[10px] text-gray-500 space-y-1 max-w-xs">
              <p className="font-bold text-gray-700 uppercase tracking-wide">Tax Summary:</p>
              <p>Total Taxable Value: ₹{taxableTotal.toFixed(2)}</p>
              <p>CGST (2.5%): ₹{cgst.toFixed(2)} | SGST (2.5%): ₹{sgst.toFixed(2)}</p>
              <div className="pt-3">
                <p className="font-bold text-gray-700">{storeSignatory}</p>
                <p className="text-[9px] text-gray-400">Digitally Verified & Dispatched</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-gray-700 w-full sm:w-64 ml-auto">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>

              {packagingFee > 0 && (
                <div className="flex justify-between">
                  <span>Packaging & Safety:</span>
                  <span className="font-semibold text-gray-900">₹{packagingFee.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span className="font-semibold text-gray-900">
                  {deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${deliveryFee.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Platform Handling:</span>
                <span className="font-semibold text-gray-900">₹{platformFee.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount:</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-sm text-gray-900">
                <span>Grand Total:</span>
                <span className="text-base" style={{ color: accentColor }}>₹{Number(totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          {termsAndConditions && (
            <div className="border-t border-gray-100 pt-3 text-[9px] text-gray-400 leading-relaxed whitespace-pre-line">
              <span className="font-bold text-gray-600 uppercase">Terms & Conditions: </span>
              {termsAndConditions}
            </div>
          )}

          {/* Footer note */}
          <div className="border-t border-gray-100 pt-3 text-center text-[10px] text-gray-400 space-y-1">
            <p>{customFooterNote}</p>
            <p className="font-semibold text-gray-600">
              For order support or queries: {supportEmail} · Helpline: {supportPhone}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default InvoiceModal;
