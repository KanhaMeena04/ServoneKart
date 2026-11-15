import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Instagram, 
  Facebook, 
  Youtube, 
  Twitter, 
  Linkedin
} from 'lucide-react';
import logoImg from '../assets/webslogo.png';

const Footer = () => {
  return (
    <footer className="bg-[#07162E] text-white pt-8 pb-12 sm:pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Footer Links & Newsletter - Compact, Proportional Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 pb-6 border-b border-slate-800/80">
          
          {/* Brand Info (4 cols) */}
          <div className="md:col-span-5 lg:col-span-4 space-y-2.5">
            <Link to="/" className="inline-block group">
              <img 
                src={logoImg} 
                alt="Tricelyn - Groceries in minutes, from your own supermarket" 
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105" 
              />
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              India's premier quick-commerce grocery delivery platform. Fresh fruits, vegetables, dairy, daily staples & snacks delivered to your doorstep in minutes.
            </p>
          </div>

          {/* Quick Links (2 cols) */}
          <div className="md:col-span-2 lg:col-span-2 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li><Link to="/membership" className="hover:text-blue-400 transition-colors">Tricelyn Premier</Link></li>
              <li><Link to="/membership?tab=rider" className="hover:text-blue-400 transition-colors">Ride with Tricelyn (Rider)</Link></li>
              <li><Link to="/membership?tab=vendor" className="hover:text-blue-400 transition-colors">Sell with Tricelyn (Vendor)</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link to="/categories" className="hover:text-blue-400 transition-colors">All Categories</Link></li>
              <li><Link to="/stores" className="hover:text-blue-400 transition-colors">Nearby Stores</Link></li>
              <li><Link to="/account/orders" className="hover:text-blue-400 transition-colors">My Orders</Link></li>
            </ul>
          </div>

          {/* Customer Service & Policies (2 cols) */}
          <div className="md:col-span-2 lg:col-span-2 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Legal & Policies</h4>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event('open-support-chat'))}
                  className="hover:text-blue-400 transition-colors text-left cursor-pointer"
                >
                  24/7 Live Chat
                </button>
              </li>
              <li><Link to="/policy/refund" className="hover:text-blue-400 transition-colors">Return & Refund</Link></li>
              <li><Link to="/policy/shipping" className="hover:text-blue-400 transition-colors">Delivery Policy</Link></li>
              <li><Link to="/policy/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/policy/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/policy/faq" className="hover:text-blue-400 transition-colors">Help & FAQs</Link></li>
              <li><Link to="/policy/contact" className="hover:text-blue-400 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Socials & Connect (4 cols) */}
          <div className="md:col-span-3 lg:col-span-4 space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Connect With Us</h4>
            <p className="text-xs text-gray-400">Follow Tricelyn for fresh product updates and daily essentials.</p>
            <div className="flex items-center gap-2 text-gray-400 pt-1">
              <a href="#" aria-label="Instagram" className="hover:text-white transition-colors p-2 rounded-xl bg-white/5 hover:bg-white/10"><Instagram className="w-4 h-4" /></a>
              <a href="#" aria-label="Facebook" className="hover:text-white transition-colors p-2 rounded-xl bg-white/5 hover:bg-white/10"><Facebook className="w-4 h-4" /></a>
              <a href="#" aria-label="YouTube" className="hover:text-white transition-colors p-2 rounded-xl bg-white/5 hover:bg-white/10"><Youtube className="w-4 h-4" /></a>
              <a href="#" aria-label="Twitter" className="hover:text-white transition-colors p-2 rounded-xl bg-white/5 hover:bg-white/10"><Twitter className="w-4 h-4" /></a>
              <a href="#" aria-label="LinkedIn" className="hover:text-white transition-colors p-2 rounded-xl bg-white/5 hover:bg-white/10"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2 border-t border-slate-800/60 mt-4">
          <p>© 2026 Tricelyn Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-gray-400 font-medium">
            <span>Fast · Fresh · Everyday</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
