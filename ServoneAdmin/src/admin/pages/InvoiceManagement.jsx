import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogContent,
  CircularProgress,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  ReceiptLong,
  Print,
  Close,
  Search,
  CheckCircle,
  LocalShipping,
  Store
} from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/utils';

export default function InvoiceManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/orders?limit=25`);
        if (res.data?.orders || Array.isArray(res.data)) {
          setOrders(res.data?.orders || res.data);
        } else {
          // Default mock orders for Indore dark stores
          setOrders([
            {
              _id: 'ord_indore_9021',
              createdAt: new Date().toISOString(),
              customerName: 'Rahul Sharma',
              customerPhone: '+91 98260 45123',
              address: 'Flat 402, Shalimar Palms, Pipliyahana, Indore',
              itemsCount: 4,
              totalAmount: 284,
              paymentMethod: 'UPI (PhonePe)',
              paymentStatus: 'PAID',
              orderStatus: 'Delivered',
              storeName: 'Tricelyn Express Mart (Vijay Nagar Hub)'
            },
            {
              _id: 'ord_indore_9022',
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              customerName: 'Priya Verma',
              customerPhone: '+91 94250 89110',
              address: '12-B, Old Palasia Main Road, Indore',
              itemsCount: 2,
              totalAmount: 145,
              paymentMethod: 'UPI (Google Pay)',
              paymentStatus: 'PAID',
              orderStatus: 'Delivered',
              storeName: 'Fresh Farm Hub (Palasia Superstore)'
            },
            {
              _id: 'ord_indore_9023',
              createdAt: new Date(Date.now() - 7200000).toISOString(),
              customerName: 'Amit Patel',
              customerPhone: '+91 98930 77123',
              address: 'Row House 45, Treasure Fantasy, CAT Road, Indore',
              itemsCount: 6,
              totalAmount: 512,
              paymentMethod: 'Cash on Delivery',
              paymentStatus: 'PAID',
              orderStatus: 'Delivered',
              storeName: 'Apna Super Kirana (Saket Nagar)'
            }
          ]);
        }
      } catch (err) {
        console.warn('Orders fallback:', err.message);
        setOrders([
          {
            _id: 'ord_indore_9021',
            createdAt: new Date().toISOString(),
            customerName: 'Rahul Sharma',
            customerPhone: '+91 98260 45123',
            address: 'Flat 402, Shalimar Palms, Pipliyahana, Indore',
            itemsCount: 4,
            totalAmount: 284,
            paymentMethod: 'UPI (PhonePe)',
            paymentStatus: 'PAID',
            orderStatus: 'Delivered',
            storeName: 'Tricelyn Express Mart (Vijay Nagar Hub)'
          },
          {
            _id: 'ord_indore_9022',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            customerName: 'Priya Verma',
            customerPhone: '+91 94250 89110',
            address: '12-B, Old Palasia Main Road, Indore',
            itemsCount: 2,
            totalAmount: 145,
            paymentMethod: 'UPI (Google Pay)',
            paymentStatus: 'PAID',
            orderStatus: 'Delivered',
            storeName: 'Fresh Farm Hub (Palasia Superstore)'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const openInvoice = async (orderId) => {
    setInvoiceLoading(true);
    setModalOpen(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/grocery/orders/${orderId}/invoice`);
      if (res.data?.invoice) {
        setSelectedInvoice(res.data.invoice);
      }
    } catch (err) {
      console.error('Invoice error:', err);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filtered = orders.filter(o => {
    const s = search.toLowerCase();
    const id = (o._id || o.id || '').toLowerCase();
    const name = (o.customerName || o.user?.name || '').toLowerCase();
    return id.includes(s) || name.includes(s);
  });

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ReceiptLong className="text-[#0055ff]" />
            Billing & GST Tax Invoices
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            View, audit, and print itemized GST invoices with CGST/SGST tax split, platform fees, and dark store seller details.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <TextField
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID or Customer..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="text-gray-400 text-sm" />
                </InputAdornment>
              ),
              className: 'rounded-xl text-xs bg-white'
            }}
          />
        </div>
      </div>

      {/* Orders List Table */}
      <TableContainer component={Paper} className="shadow-xs rounded-2xl overflow-hidden border border-gray-100 bg-white">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <CircularProgress size={32} sx={{ color: '#0055ff' }} />
          </div>
        ) : (
          <Table sx={{ minWidth: 650 }}>
            <TableHead className="bg-gray-100/70">
              <TableRow>
                <TableCell className="font-bold text-xs">Order ID & Date</TableCell>
                <TableCell className="font-bold text-xs">Customer</TableCell>
                <TableCell className="font-bold text-xs">Fulfillment Dark Store</TableCell>
                <TableCell className="font-bold text-xs">Payment Method</TableCell>
                <TableCell className="font-bold text-xs">Bill Amount</TableCell>
                <TableCell className="font-bold text-xs">Status</TableCell>
                <TableCell className="font-bold text-xs text-right">Tax Invoice</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.map((ord) => {
                const id = ord._id || ord.id;
                const date = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today';
                const custName = ord.customerName || ord.user?.name || ord.deliveryAddress?.name || 'Customer';
                const total = ord.totalAmount || ord.total || 0;

                return (
                  <TableRow key={id} hover>
                    <TableCell>
                      <div className="font-mono font-bold text-xs text-blue-700">
                        #{id.slice(-8).toUpperCase()}
                      </div>
                      <div className="text-[10px] text-gray-400">{date}</div>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-xs text-gray-900">{custName}</div>
                      <div className="text-[10px] text-gray-500 truncate max-w-xs">{ord.address || 'Indore'}</div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-gray-700 font-medium">
                        <Store className="text-gray-400 text-xs" />
                        <span>{ord.storeName || 'Tricelyn Indore Hub'}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={ord.paymentMethod || 'Online'}
                        size="small"
                        className="bg-gray-100 text-gray-700 font-bold text-[10px]"
                      />
                    </TableCell>

                    <TableCell>
                      <div className="font-black text-sm text-gray-900">
                        ₹{total}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={<CheckCircle style={{ fontSize: 12 }} />}
                        label={ord.orderStatus || 'Delivered'}
                        size="small"
                        className="bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200"
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => openInvoice(id)}
                        startIcon={<Print />}
                        sx={{ backgroundColor: '#0055ff', '&:hover': { backgroundColor: '#0047d4' } }}
                        className="capitalize rounded-xl text-xs py-1 px-3 shadow-2xs font-bold"
                      >
                        Print Tax Invoice
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Tax Invoice Printable Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ className: 'rounded-2xl p-0 overflow-hidden' }}
      >
        <div className="p-4 bg-gray-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <ReceiptLong className="text-blue-400" />
            <span className="font-bold text-sm">Official Tax Invoice Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="contained"
              onClick={handlePrint}
              startIcon={<Print />}
              sx={{ backgroundColor: '#0055ff' }}
              className="capitalize text-xs rounded-xl font-bold"
            >
              Print / Save PDF
            </Button>
            <IconButton onClick={() => setModalOpen(false)} size="small" className="text-white hover:bg-white/10">
              <Close />
            </IconButton>
          </div>
        </div>

        <DialogContent className="p-6 sm:p-8 bg-white print:p-0">
          {invoiceLoading || !selectedInvoice ? (
            <div className="p-12 text-center text-gray-500">
              <CircularProgress size={32} sx={{ color: '#0055ff' }} />
              <p className="text-xs font-bold mt-2">Generating Tax Invoice...</p>
            </div>
          ) : (
            <div className="space-y-6 text-gray-900 print:text-black" id="printable-invoice">
              
              {/* Invoice Header */}
              <div className="flex items-start justify-between border-b pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black italic tracking-tighter text-[#0055ff]">TRICELYN</span>
                    <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">TAX INVOICE</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Original for Recipient · 100% Verified GST Invoice</p>
                </div>

                <div className="text-right text-xs space-y-0.5 font-medium">
                  <div><span className="text-gray-500">Invoice No:</span> <strong className="font-mono">{selectedInvoice.invoiceNumber}</strong></div>
                  <div><span className="text-gray-500">Invoice Date:</span> <strong>{selectedInvoice.invoiceDate} {selectedInvoice.invoiceTime}</strong></div>
                  <div><span className="text-gray-500">Order ID:</span> <strong className="font-mono">#{selectedInvoice.orderId?.slice(-8).toUpperCase()}</strong></div>
                  <div><span className="text-gray-500">Payment Status:</span> <strong className="text-emerald-600 font-bold">{selectedInvoice.paymentStatus}</strong></div>
                </div>
              </div>

              {/* Seller & Buyer Grid */}
              <div className="grid grid-cols-2 gap-6 text-xs border-b pb-6">
                <div className="space-y-1 bg-gray-50 p-3 rounded-xl">
                  <div className="font-black text-gray-900 uppercase tracking-wide text-[10px]">Sold & Dispatched By:</div>
                  <div className="font-bold text-gray-900">{selectedInvoice.seller.storeName}</div>
                  <div className="text-gray-600 leading-tight">{selectedInvoice.seller.address}</div>
                  <div className="font-mono text-gray-800 pt-1">
                    <strong>GSTIN:</strong> {selectedInvoice.seller.gstin} | <strong>FSSAI:</strong> {selectedInvoice.seller.fssaiNumber}
                  </div>
                </div>

                <div className="space-y-1 bg-gray-50 p-3 rounded-xl">
                  <div className="font-black text-gray-900 uppercase tracking-wide text-[10px]">Billed & Delivered To:</div>
                  <div className="font-bold text-gray-900">{selectedInvoice.customer.name}</div>
                  <div className="text-gray-600 leading-tight">{selectedInvoice.customer.deliveryAddress}</div>
                  <div className="text-gray-800 pt-1">
                    <strong>Phone:</strong> {selectedInvoice.customer.phone} | <strong>State:</strong> {selectedInvoice.customer.state}
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div>
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b bg-gray-100 text-[11px] font-bold text-gray-700">
                      <th className="py-2 px-2">#</th>
                      <th className="py-2 px-2">Item Description</th>
                      <th className="py-2 px-2">Unit</th>
                      <th className="py-2 px-2 text-center">Qty</th>
                      <th className="py-2 px-2 text-right">Rate</th>
                      <th className="py-2 px-2 text-right">Taxable</th>
                      <th className="py-2 px-2 text-right">CGST (2.5%)</th>
                      <th className="py-2 px-2 text-right">SGST (2.5%)</th>
                      <th className="py-2 px-2 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items?.map((it) => (
                      <tr key={it.srNo} className="border-b border-gray-100">
                        <td className="py-2 px-2 text-gray-500 font-mono">{it.srNo}</td>
                        <td className="py-2 px-2 font-bold text-gray-900">{it.name}</td>
                        <td className="py-2 px-2 text-gray-500">{it.unit}</td>
                        <td className="py-2 px-2 text-center font-bold">{it.quantity}</td>
                        <td className="py-2 px-2 text-right">₹{it.unitPrice}</td>
                        <td className="py-2 px-2 text-right">₹{it.taxableValue}</td>
                        <td className="py-2 px-2 text-right text-gray-600">₹{it.cgstAmount}</td>
                        <td className="py-2 px-2 text-right text-gray-600">₹{it.sgstAmount}</td>
                        <td className="py-2 px-2 text-right font-black">₹{it.totalAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Billing Summary Box */}
              <div className="flex justify-end pt-2">
                <div className="w-full sm:w-72 space-y-1.5 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items Subtotal:</span>
                    <strong className="text-gray-900">₹{selectedInvoice.billingSummary.itemsSubtotal}</strong>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Handling / Packaging:</span>
                    <span>₹{selectedInvoice.billingSummary.packagingFee}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charge (10-15m):</span>
                    <span>{selectedInvoice.billingSummary.deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${selectedInvoice.billingSummary.deliveryFee}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Platform Fee:</span>
                    <span>₹{selectedInvoice.billingSummary.platformFee}</span>
                  </div>
                  {selectedInvoice.billingSummary.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Promo Discount:</span>
                      <span>-₹{selectedInvoice.billingSummary.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2 text-sm font-black text-gray-900">
                    <span>Grand Total:</span>
                    <span className="text-[#0055ff]">₹{selectedInvoice.billingSummary.grandTotal}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 text-right">
                    Includes ₹{(selectedInvoice.billingSummary.cgstTotal + selectedInvoice.billingSummary.sgstTotal).toFixed(2)} Total GST (CGST + SGST)
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="border-t pt-4 text-[10px] text-gray-400 text-center leading-relaxed">
                This is a computer-generated invoice and requires no physical signature. Thank you for shopping with Tricelyn Quick Commerce Indore! For support, write to <strong>care@tricelyn.com</strong> or call <strong>+91 731-4099880</strong>.
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
