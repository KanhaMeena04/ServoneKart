import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Headphones, 
  Phone, 
  Mail, 
  Clock, 
  HelpCircle, 
  ChevronDown, 
  ArrowLeft, 
  ShieldCheck, 
  Send,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';

const SupportPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketOrder, setTicketOrder] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const faqs = [
    {
      q: 'How fast will my grocery order be delivered in Indore?',
      a: 'We fulfill orders from our hyperlocal fulfillment dark stores located in Vijay Nagar, Palasia, Rajwada, and Super Corridor. Most orders reach your doorstep within 10 to 15 minutes.'
    },
    {
      q: 'What is the minimum order value for free delivery?',
      a: 'Orders of ₹199 or above qualify for 100% FREE Delivery across Indore. For orders under ₹199, a nominal delivery charge of ₹25 applies.'
    },
    {
      q: 'What if an item is out of stock or missing in my delivery?',
      a: 'If any item is missing or damaged upon delivery, you can report it instantly through this support portal or live chat. A refund will be credited back to your account or original payment method immediately.'
    },
    {
      q: 'Which payment methods are accepted on Tricelyn?',
      a: 'We accept Cash on Delivery (COD), UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit cards (Visa, MasterCard, RuPay), and all major Net Banking partners.'
    },
    {
      q: 'How can I cancel or modify my grocery order?',
      a: 'Because our packers begin preparing your items within 60 seconds of order placement, cancellations can be made via the Order Tracking screen before the rider departs. For any urgent help, reach our support team immediately.'
    }
  ];

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    setTicketSubmitted(true);
    setTicketSubject('');
    setTicketOrder('');
    setTicketMessage('');
    setTimeout(() => setTicketSubmitted(false), 5000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Tricelyn Customer Support</h1>
        <p className="text-xs text-gray-500 mt-1">We are here to help you 7 days a week, 6:00 AM – 12:00 Midnight in Indore</p>
      </div>

      {/* Top 3 Support Channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900">Helpline Phone Support</h4>
            <p className="text-xs text-gray-500 mt-0.5">Direct phone assistance with our Indore ops team</p>
          </div>
          <a
            href="tel:+919826012345"
            className="inline-block text-xs font-black text-brand-600 hover:underline"
          >
            +91 98260 12345 →
          </a>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-accent-greenDark flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900">Live Support Chat</h4>
            <p className="text-xs text-gray-500 mt-0.5">Chat in real-time with an executive</p>
          </div>
          <button
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            className="inline-block text-xs font-black text-accent-greenDark hover:underline"
          >
            Open Live Chat Widget →
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900">Email Inquiries</h4>
            <p className="text-xs text-gray-500 mt-0.5">Corporate & escalated customer feedback</p>
          </div>
          <a
            href="mailto:support@tricelyn.com"
            className="inline-block text-xs font-black text-purple-600 hover:underline"
          >
            support@tricelyn.com →
          </a>
        </div>
      </div>

      {/* Main Grid: FAQs & Ticket Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* FAQs (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <HelpCircle className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-black text-gray-900">Frequently Asked Questions</h3>
          </div>

          <div className="divide-y divide-gray-100">
            {faqs.map((f, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-3">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex justify-between items-center text-left gap-3 text-xs font-bold text-gray-800 hover:text-brand-600 transition"
                  >
                    <span>{f.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-brand-600' : ''}`} />
                  </button>
                  {isOpen && (
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed pl-1 animate-in fade-in">
                      {f.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Raise a Support Ticket Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-black text-gray-900">Raise a Support Ticket</h3>
            <p className="text-xs text-gray-500 mt-0.5">Directly connected to the Admin resolution desk</p>
          </div>

          {ticketSubmitted ? (
            <div className="p-6 bg-green-50 border border-green-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
              <h4 className="text-sm font-bold text-green-800">Ticket Submitted Successfully!</h4>
              <p className="text-xs text-green-700">
                Ticket #TIC-{Math.floor(1000 + Math.random() * 9000)} has been sent to our customer care team. You will receive an update within 15 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleTicketSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Issue Topic *
                </label>
                <select
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 font-medium"
                >
                  <option value="">Select an issue</option>
                  <option value="missing_item">Missing or wrong item in order</option>
                  <option value="delivery_delay">Delivery delay / Rider unreachable</option>
                  <option value="refund">Payment deducted but order failed / Refund inquiry</option>
                  <option value="quality">Food or Grocery quality issue</option>
                  <option value="other">Other question</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Order ID (Optional)
                </label>
                <input
                  type="text"
                  value={ticketOrder}
                  onChange={(e) => setTicketOrder(e.target.value)}
                  placeholder="e.g. TRIC-924102"
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Describe Your Issue *
                </label>
                <textarea
                  required
                  rows={4}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Please provide details of what happened..."
                  className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 resize-none font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>Submit Ticket to Support</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
            <span>Dedicated customer happiness guarantee</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default SupportPage;
