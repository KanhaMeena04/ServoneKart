import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Instagram, 
  Facebook, 
  Youtube, 
  Twitter, 
  Linkedin, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Clock, 
  HeartHandshake,
  Headphones 
} from 'lucide-react';
import logoImg from '../assets/logo.png';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#03132e] text-white pt-8 pb-12 sm:pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 4 Value Badges - Compact & Streamlined */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 sm:py-3.5 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-gray-300">
            
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white tracking-tight truncate">10-15 Min Delivery</p>
                <p className="text-[11px] text-gray-400 truncate">Superfast Indore fulfillment</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white tracking-tight truncate">100% Quality Fresh</p>
                <p className="text-[11px] text-gray-400 truncate">Direct from trusted sources</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white tracking-tight truncate">Free Delivery</p>
                <p className="text-[11px] text-gray-400 truncate">On all orders above ₹199</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white tracking-tight truncate">Best Prices Everyday</p>
                <p className="text-[11px] text-gray-400 truncate">Cheaper than local marts</p>
              </div>
            </div>

          </div>
        </div>

        {/* Main Footer Links & Newsletter - Compact, Proportional Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 pb-6 border-b border-slate-800/80">
          
          {/* Brand Info (4 cols) */}
          <div className="md:col-span-5 lg:col-span-4 space-y-2.5">
            <Link to="/" className="inline-block group">
              <div className="bg-[#03132e] hover:bg-white/5 px-2.5 py-1 rounded-xl border border-white/30 inline-flex items-center shadow-xs transition">
                <img 
                  src={logoImg} 
                  alt="Tricelyn - Everything You Actually Want" 
                  className="h-7 sm:h-8 w-auto object-contain" 
                />
              </div>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Indore's premier quick-commerce grocery delivery platform. Fresh fruits, vegetables, milk, daily staples & snacks delivered to your doorstep in 10-15 minutes.
            </p>
            <div className="pt-1 text-[11px] text-gray-400">
              <span className="font-semibold text-gray-300">Indore Hubs: </span>
              <span className="text-gray-400">Vijay Nagar · New Palasia · Chappan Dukan · Rajwada · Bhanwarkuan · Super Corridor</span>
            </div>
          </div>

          {/* Quick Links (2 cols) */}
          <div className="md:col-span-2 lg:col-span-2 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link to="/categories" className="hover:text-blue-400 transition-colors">All Categories</Link></li>
              <li><Link to="/stores" className="hover:text-blue-400 transition-colors">Nearby Stores</Link></li>
              <li><Link to="/account/orders" className="hover:text-blue-400 transition-colors">My Orders</Link></li>
            </ul>
          </div>

          {/* Customer Service (2 cols) */}
          <div className="md:col-span-2 lg:col-span-2 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>
                <button
                  onClick={() => window.dispatchEvent(new Event('open-support-chat'))}
                  className="flex items-center gap-1.5 text-blue-400 hover:text-white transition-colors text-xs font-bold group cursor-pointer text-left"
                >
                  <Headphones className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>24/7 Live Support Chat</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </button>
              </li>
              <li><Link to="/support" className="hover:text-blue-400 transition-colors">Help & FAQs</Link></li>
              <li><Link to="/support" className="hover:text-blue-400 transition-colors">Contact Support</Link></li>
              <li><Link to="/support" className="hover:text-blue-400 transition-colors">Shipping Policy</Link></li>
              <li><Link to="/support" className="hover:text-blue-400 transition-colors">Return & Refund</Link></li>
            </ul>
          </div>

          {/* Newsletter Subscribe & Socials (4 cols) */}
          <div className="md:col-span-3 lg:col-span-4 space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Get Exclusive Offers</h4>
            <p className="text-xs text-gray-400">Subscribe for secret flash sales and coupon codes.</p>
            
            <form onSubmit={handleSubscribe} className="space-y-1.5">
              <div className="relative max-w-sm">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  className="w-full px-3 py-2 text-xs bg-black/30 border border-slate-700/80 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 pr-10"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-1 top-1 bottom-1 px-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-bold transition flex items-center justify-center cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {subscribed && (
                <p className="text-[11px] text-green-400 font-medium">✓ Thanks for subscribing! Use code SAVE25 for ₹25 off.</p>
              )}
            </form>

            <div className="pt-1.5 flex items-center gap-3">
              <span className="text-[11px] font-semibold text-gray-300">Connect:</span>
              <div className="flex items-center gap-2.5 text-gray-400">
                <a href="#" aria-label="Instagram" className="hover:text-white transition-colors p-1 rounded hover:bg-white/5"><Instagram className="w-3.5 h-3.5" /></a>
                <a href="#" aria-label="Facebook" className="hover:text-white transition-colors p-1 rounded hover:bg-white/5"><Facebook className="w-3.5 h-3.5" /></a>
                <a href="#" aria-label="YouTube" className="hover:text-white transition-colors p-1 rounded hover:bg-white/5"><Youtube className="w-3.5 h-3.5" /></a>
                <a href="#" aria-label="Twitter" className="hover:text-white transition-colors p-1 rounded hover:bg-white/5"><Twitter className="w-3.5 h-3.5" /></a>
                <a href="#" aria-label="LinkedIn" className="hover:text-white transition-colors p-1 rounded hover:bg-white/5"><Linkedin className="w-3.5 h-3.5" /></a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar - Generous Padding, Never Clipped */}
        <div className="pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2 border-t border-slate-800/60 mt-4">
          <p>© 2026 Tricelyn Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-gray-400 font-medium">
            <span>Fast · Fresh · Everyday</span>
            <span>Made with ❤️ for Indore</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
