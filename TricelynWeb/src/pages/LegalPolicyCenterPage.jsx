import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  RotateCcw, 
  FileText, 
  Lock, 
  Truck, 
  Headphones, 
  HelpCircle, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  ChevronRight
} from 'lucide-react';

const POLICY_TABS = [
  { id: 'refund', label: 'Return & Refund Policy', icon: RotateCcw, shortDesc: 'Instant refunds, returns & replacement policy' },
  { id: 'terms', label: 'Terms of Service', icon: FileText, shortDesc: 'Platform usage, orders & customer agreement' },
  { id: 'privacy', label: 'Privacy Policy', icon: Lock, shortDesc: 'Data protection, cookies & privacy assurance' },
  { id: 'shipping', label: 'Instant Delivery Policy', icon: Truck, shortDesc: '10-15 minute delivery, zones & fee structure' },
  { id: 'faq', label: 'Frequently Asked Questions', icon: HelpCircle, shortDesc: 'Common questions, payments & delivery answers' },
  { id: 'contact', label: 'Customer Grievance & Contact', icon: Headphones, shortDesc: '24/7 Help desk & grievance officer details' },
];

const LegalPolicyCenterPage = () => {
  const { policyType } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(policyType || 'refund');

  useEffect(() => {
    if (policyType && POLICY_TABS.some(t => t.id === policyType)) {
      setActiveTab(policyType);
    }
  }, [policyType]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/policy/${tabId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSupportChat = () => {
    window.dispatchEvent(new Event('open-support-chat'));
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen py-6 sm:py-10 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Link to="/" className="hover:text-[#0055ff] transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-bold">Legal, Policies & Help Center</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#0055ff] font-bold capitalize">{POLICY_TABS.find(t => t.id === activeTab)?.label}</span>
        </div>

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#0055ff] via-blue-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-blue-100">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Trust, Safety & Customer Protection</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Tricelyn Legal & Policy Center
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Transparent, fair, and reliable policies governing our 10-15 minute grocery fulfillment across all cities and partner dark stores.
            </p>
          </div>
          {/* Subtle Glow Circle */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left Sidebar: Policy Tabs */}
          <aside className="lg:col-span-4 bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-xs space-y-1.5 sticky top-24">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider px-3 py-2">
              Browse Policies & Guidelines
            </h3>
            {POLICY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-blue-50 text-[#0055ff] border-l-4 border-[#0055ff] shadow-2xs font-extrabold'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent font-medium'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-[#0055ff] text-white' : 'bg-gray-100 text-gray-600'} shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold leading-tight">{tab.label}</p>
                    <p className="text-[11px] text-gray-500 font-normal truncate mt-0.5">{tab.shortDesc}</p>
                  </div>
                </button>
              );
            })}

            {/* Quick Live Chat Box */}
            <div className="mt-4 pt-4 border-t border-gray-100 px-2 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                <Headphones className="w-4 h-4 text-[#0055ff]" />
                <span>Need Instant Help?</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Our support agents are available 24/7 to resolve refund and order queries in seconds.
              </p>
              <button
                onClick={handleOpenSupportChat}
                className="w-full py-2 bg-[#0055ff] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Start Live Support Chat</span>
              </button>
            </div>
          </aside>

          {/* Right Main Content: Comprehensive Policy Details */}
          <main className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6 text-gray-800">
            {activeTab === 'refund' && <RefundPolicyContent />}
            {activeTab === 'terms' && <TermsOfServiceContent />}
            {activeTab === 'privacy' && <PrivacyPolicyContent />}
            {activeTab === 'shipping' && <ShippingPolicyContent />}
            {activeTab === 'faq' && <FaqContent />}
            {activeTab === 'contact' && <ContactGrievanceContent onOpenChat={handleOpenSupportChat} />}
          </main>

        </div>

      </div>
    </div>
  );
};

/* =======================================================================
   1. RETURN & REFUND POLICY CONTENT
======================================================================= */
const RefundPolicyContent = () => (
  <div className="space-y-6">
    <div className="border-b border-gray-100 pb-4">
      <span className="text-[10px] font-bold text-[#0055ff] bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
        Updated: November 2026
      </span>
      <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
        Return, Refund & Cancellation Policy
      </h2>
      <p className="text-xs text-gray-500 mt-1">
        At Tricelyn, customer satisfaction is our top priority. Here is our straightforward, no-hassle return and refund framework.
      </p>
    </div>

    {/* Quick Summary Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <p className="text-xs font-bold text-emerald-900">Instant Cancellation</p>
        <p className="text-[11px] text-emerald-700">100% refund before partner dark store starts packing.</p>
      </div>
      <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1">
        <RotateCcw className="w-4 h-4 text-[#0055ff]" />
        <p className="text-xs font-bold text-blue-900">Quality Guarantee</p>
        <p className="text-[11px] text-blue-700">Damaged or incorrect fresh items refunded within minutes.</p>
      </div>
      <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl space-y-1">
        <Clock className="w-4 h-4 text-purple-600" />
        <p className="text-xs font-bold text-purple-900">Fast Refund Credits</p>
        <p className="text-[11px] text-purple-700">Wallet: Instant (15 mins) | UPI/Card: 2-4 business days.</p>
      </div>
    </div>

    <section className="space-y-3">
      <h3 className="text-sm font-extrabold text-gray-900">1. Order Cancellation Policy</h3>
      <p className="text-xs text-gray-600 leading-relaxed">
        Customers can cancel an order free of charge immediately through the app or website as long as the partner dark store has not initiated item packing. If the order is cancelled within this window, any online payment will be refunded 100% back to the original source or customer wallet.
      </p>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-extrabold text-gray-900">2. Eligible Reasons for Returns & Refunds</h3>
      <ul className="text-xs text-gray-600 space-y-2 list-disc pl-5">
        <li><strong>Damaged or Expired Items:</strong> If any packaged grocery, dairy product, or fresh produce arrives damaged or past its best-before date.</li>
        <li><strong>Missing Items:</strong> If an item listed in your invoice was not delivered in the sealed package.</li>
        <li><strong>Incorrect Item:</strong> If you received a different brand, variant, weight, or product than ordered.</li>
        <li><strong>Quality Issues with Produce:</strong> Fresh fruits and vegetables found spoiled, bruised, or unsatisfactory upon doorstep inspection.</li>
      </ul>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-extrabold text-gray-900">3. Refund Processing Timelines</h3>
      <div className="overflow-x-auto border border-gray-100 rounded-xl">
        <table className="w-full text-xs text-left">
          <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-100">
            <tr>
              <th className="p-3">Payment Mode</th>
              <th className="p-3">Refund Destination</th>
              <th className="p-3">Expected SLA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-600">
            <tr>
              <td className="p-3 font-semibold text-gray-800">Tricelyn Wallet</td>
              <td className="p-3">In-App Customer Wallet</td>
              <td className="p-3 text-emerald-600 font-bold">Instant (Within 15 minutes)</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-gray-800">UPI (Google Pay, PhonePe, Paytm)</td>
              <td className="p-3">Linked Bank Account via VPA</td>
              <td className="p-3">1 to 2 Business Days</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-gray-800">Credit / Debit Cards</td>
              <td className="p-3">Issuing Bank Account</td>
              <td className="p-3">3 to 5 Working Days</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-gray-800">Cash on Delivery (COD)</td>
              <td className="p-3">Tricelyn Wallet Credit or Direct UPI Transfer</td>
              <td className="p-3">Instant on verified request</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-extrabold text-gray-900">4. How to Request a Return or Refund</h3>
      <p className="text-xs text-gray-600 leading-relaxed">
        Simply go to <strong>My Orders → Select Order → Report Issue</strong>, or open our <strong>24/7 Live Support Chat</strong>. Share a quick photo of the damaged/missing item, and our AI automated dispatch or live agent will process your replacement or refund within 2 minutes.
      </p>
    </section>
  </div>
);

/* =======================================================================
   2. TERMS OF SERVICE CONTENT
======================================================================= */
const TermsOfServiceContent = () => (
  <div className="space-y-6">
    <div className="border-b border-gray-100 pb-4">
      <span className="text-[10px] font-bold text-[#0055ff] bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
        Legal Agreement
      </span>
      <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
        Terms of Service & Conditions
      </h2>
      <p className="text-xs text-gray-500 mt-1">
        Please read these Terms carefully before accessing or using the Tricelyn application, website, and delivery services.
      </p>
    </div>

    <section className="space-y-3">
      <h3 className="text-sm font-extrabold text-gray-900">1. Acceptance of Terms</h3>
      <p className="text-xs text-gray-600 leading-relaxed">
        By downloading, browsing, or placing orders through Tricelyn, you agree to be bound by these Terms of Service, applicable laws, and all supplementary guidelines published across our platform. If you do not agree with any part, please discontinue using the service.
      </p>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-extrabold text-gray-900">2. Hyperlocal Marketplace Model</h3>
      <p className="text-xs text-gray-600 leading-relaxed">
        Tricelyn operates a multi-vendor quick-commerce platform that connects consumers with independent dark stores, authorized supermarkets, distributors, and delivery partners. Products are packed directly by partner fulfillment hubs according to standard FSSAI quality benchmarks.
      </p>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-extrabold text-gray-900">3. Pricing, Weights & Inventory</h3>
      <p className="text-xs text-gray-600 leading-relaxed">
        All prices displayed include applicable taxes (GST). For fresh produce (fruits, vegetables), actual weight delivered may naturally vary slightly (within ±5-10%) due to nature of items. Any significant discrepancy is automatically adjusted and credited back to the customer's wallet.
      </p>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-extrabold text-gray-900">4. User Account & Security</h3>
      <p className="text-xs text-gray-600 leading-relaxed">
        Users must register with an authentic mobile number verified by OTP. You are responsible for maintaining confidentiality of your account access credentials and for all activities that occur under your registered profile.
      </p>
    </section>
  </div>
);

/* =======================================================================
   3. PRIVACY POLICY CONTENT
======================================================================= */
const PrivacyPolicyContent = () => (
  <div className="space-y-6">
    <div className="border-b border-gray-100 pb-4">
      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
        Data Privacy Assurance
      </span>
      <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
        Privacy & Data Protection Policy
      </h2>
      <p className="text-xs text-gray-500 mt-1">
        We respect your privacy and are committed to safeguarding your personal information with enterprise-grade encryption.
      </p>
    </div>

    <section className="space-y-3">
      <h3 className="text-sm font-extrabold text-gray-900">1. Information We Collect</h3>
      <ul className="text-xs text-gray-600 space-y-2 list-disc pl-5">
        <li><strong>Device Location (GPS):</strong> Used strictly to identify nearest partner dark stores and provide real-time 10-15 min doorstep delivery.</li>
        <li><strong>Contact Information:</strong> Phone number, recipient name, and delivery address to fulfill orders and send OTP verifications.</li>
        <li><strong>Order & Transaction Records:</strong> Items purchased, payment confirmation tokens, and delivery status logs for customer support.</li>
      </ul>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-extrabold text-gray-900">2. Financial Data Security</h3>
      <p className="text-xs text-gray-600 leading-relaxed">
        Tricelyn does <strong>not</strong> store your credit card numbers, CVVs, or NetBanking passwords on our servers. All online transactions are handled through RBI-licensed, PCI-DSS compliant payment gateways (Razorpay).
      </p>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-extrabold text-gray-900">3. Non-Disclosure Commitment</h3>
      <p className="text-xs text-gray-600 leading-relaxed">
        We never sell, rent, or trade your personal data with third-party advertisers. Information is only shared with assigned delivery partners and fulfillment hubs strictly necessary to complete your delivery.
      </p>
    </section>
  </div>
);

/* =======================================================================
   4. INSTANT DELIVERY POLICY CONTENT
======================================================================= */
const ShippingPolicyContent = () => (
  <div className="space-y-6">
    <div className="border-b border-gray-100 pb-4">
      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
        Express Fulfillment SLA
      </span>
      <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
        Hyperlocal 10-15 Min Delivery Policy
      </h2>
      <p className="text-xs text-gray-500 mt-1">
        How our instant grocery delivery network operates across serviced zones and dark store hubs.
      </p>
    </div>

    <section className="space-y-3">
      <h3 className="text-sm font-extrabold text-gray-900">1. Express Delivery Standard (10 - 15 Minutes)</h3>
      <p className="text-xs text-gray-600 leading-relaxed">
        Orders placed within our serviceable dark store radius (typically 2-4 km) are packed in under 3 minutes and dispatched immediately via dedicated delivery partners. Estimated time of arrival is calculated dynamically based on live traffic and weather.
      </p>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-extrabold text-gray-900">2. Delivery Charges & Thresholds</h3>
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs space-y-2">
        <div className="flex justify-between font-bold text-gray-800">
          <span>Orders Above ₹199:</span>
          <span className="text-emerald-600">FREE DELIVERY</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Standard Orders Below ₹199:</span>
          <span>₹15 - ₹25 nominal fulfillment fee</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Platform & Handling Fee:</span>
          <span>₹2 - ₹4 per order</span>
        </div>
      </div>
    </section>

    <section className="space-y-3">
      <h3 className="text-sm font-extrabold text-gray-900">3. Adverse Weather & Surge Handling</h3>
      <p className="text-xs text-gray-600 leading-relaxed">
        During severe rainstorms, public restrictions, or extraordinary order surges, delivery times may be temporarily extended up to 25-35 minutes to ensure rider safety. Customers will always see live ETA updates in real-time.
      </p>
    </section>
  </div>
);

/* =======================================================================
   5. FAQS CONTENT
======================================================================= */
const FaqContent = () => {
  const faqs = [
    { q: "How does Tricelyn deliver so fast in 10-15 minutes?", a: "We operate a network of optimized partner dark stores located within 2-3 km of your residential neighborhood, allowing our team to pick, pack, and dispatch items in under 3 minutes." },
    { q: "Is there a minimum order value?", a: "No! There is no mandatory minimum order. However, orders above ₹199 qualify for 100% Free Delivery." },
    { q: "What payment methods are supported?", a: "We support UPI (GPay, PhonePe, Paytm), Credit & Debit Cards, NetBanking, Tricelyn In-App Wallet, and Cash/UPI on Delivery (COD)." },
    { q: "What if an item is damaged or missing?", a: "Simply open your order in the app or website and click 'Report Issue' or start a Live Chat. You can get an instant replacement or 100% refund credited within minutes." },
    { q: "Can I schedule a delivery for later?", a: "Yes! While our default is instant 10-15 minute delivery, you can also select scheduled delivery slots during checkout for your convenience." },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <span className="text-[10px] font-bold text-[#0055ff] bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Help Desk
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
          Frequently Asked Questions
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Quick answers to common questions about orders, payments, delivery, and refunds.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-1.5">
            <h4 className="text-xs font-bold text-gray-900">{faq.q}</h4>
            <p className="text-xs text-gray-600 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =======================================================================
   6. CONTACT & GRIEVANCE OFFICER CONTENT
======================================================================= */
const ContactGrievanceContent = ({ onOpenChat }) => (
  <div className="space-y-6">
    <div className="border-b border-gray-100 pb-4">
      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
        Contact & Redressal
      </span>
      <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
        Customer Support & Grievance Desk
      </h2>
      <p className="text-xs text-gray-500 mt-1">
        We are here to assist you 24/7. Reach out through any of our official support channels below.
      </p>
    </div>

    {/* Contact Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
          <Headphones className="w-4 h-4 text-[#0055ff]" />
          <span>24/7 Live Chat Support</span>
        </div>
        <p className="text-xs text-gray-600">
          Instant assistance for active orders, delivery delays, and refund requests.
        </p>
        <button
          onClick={onOpenChat}
          className="mt-1 px-4 py-1.5 bg-[#0055ff] text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
        >
          Open Chat Now
        </button>
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
          <Mail className="w-4 h-4 text-gray-600" />
          <span>Email Support</span>
        </div>
        <p className="text-xs text-gray-600">
          Send formal inquiries or billing escalation requests:
        </p>
        <a href="mailto:support@tricelyn.com" className="text-xs font-bold text-[#0055ff] hover:underline block">
          support@tricelyn.com
        </a>
      </div>
    </div>

    {/* Grievance Officer Details (Mandatory under Consumer Protection Rules) */}
    <div className="p-5 bg-white border border-gray-200 rounded-xl space-y-3">
      <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
        Grievance Redressal Officer (Consumer Protection Rules)
      </h3>
      <div className="text-xs text-gray-600 space-y-1">
        <p><strong>Officer Name:</strong> Nodal Grievance Officer, Tricelyn Technologies</p>
        <p><strong>Email:</strong> <a href="mailto:grievance@tricelyn.com" className="text-[#0055ff] hover:underline">grievance@tricelyn.com</a></p>
        <p><strong>Working Hours:</strong> Monday to Saturday, 9:00 AM – 6:00 PM IST</p>
        <p><strong>Resolution SLA:</strong> Acknowledgment within 24 hours; resolution within 5 working days.</p>
      </div>
    </div>
  </div>
);

export default LegalPolicyCenterPage;

