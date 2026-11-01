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
  HeartHandshake 
} from 'lucide-react';

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
    <footer className="bg-[#0b1b36] text-white pt-14 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 4 Value Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-gray-800 text-gray-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">10-15 Min Delivery</p>
              <p className="text-xs text-gray-400">Superfast Indore fulfillment</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">100% Quality Fresh</p>
              <p className="text-xs text-gray-400">Direct from trusted sources</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Free Delivery</p>
              <p className="text-xs text-gray-400">On all orders above ₹199</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Best Prices Everyday</p>
              <p className="text-xs text-gray-400">Cheaper than local marts</p>
            </div>
          </div>
        </div>

        {/* Middle Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12 border-b border-gray-800">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-black tracking-tight text-white">
                TRICELYN
              </span>
              <p className="text-[10px] tracking-widest font-semibold text-blue-400 uppercase">
                Everything You Actually Want
              </p>
            </Link>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Tricelyn is Indore’s premier quick-commerce grocery delivery platform. From fresh fruits, vegetables, and milk to daily household staples and snacks, get everything delivered to your door in 10-15 minutes.
            </p>
            <div className="text-xs text-gray-400">
              <p className="font-semibold text-gray-200">Indore Hubs Served:</p>
              <p className="text-gray-400 mt-1">Vijay Nagar · New Palasia · Chappan Dukan · Rajwada · Bhanwarkuan · Super Corridor</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/" className="hover:text-blue-400 transition">Home</Link></li>
              <li><Link to="/categories" className="hover:text-blue-400 transition">All Categories</Link></li>
              <li><Link to="/stores" className="hover:text-blue-400 transition">Nearby Stores</Link></li>
              <li><Link to="/account/orders" className="hover:text-blue-400 transition">My Orders</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/support" className="hover:text-blue-400 transition">Help & FAQs</Link></li>
              <li><Link to="/support" className="hover:text-blue-400 transition">Contact Support</Link></li>
              <li><Link to="/support" className="hover:text-blue-400 transition">Shipping & Delivery Policy</Link></li>
              <li><Link to="/support" className="hover:text-blue-400 transition">Return & Refund Terms</Link></li>
            </ul>
          </div>

          {/* Newsletter Subscribe */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Get Exclusive Offers</h4>
            <p className="text-xs text-gray-400">Subscribe for secret flash sales and coupon codes.</p>
            
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {subscribed && (
                <p className="text-[11px] text-green-400 font-medium">✓ Thanks for subscribing! Use coupon SAVE25 for ₹25 off.</p>
              )}
            </form>

            <div className="pt-2">
              <p className="text-[11px] font-semibold text-gray-300 mb-2">Connect With Us</p>
              <div className="flex items-center gap-3 text-gray-400">
                <a href="#" className="hover:text-white transition"><Instagram className="w-4 h-4" /></a>
                <a href="#" className="hover:text-white transition"><Facebook className="w-4 h-4" /></a>
                <a href="#" className="hover:text-white transition"><Youtube className="w-4 h-4" /></a>
                <a href="#" className="hover:text-white transition"><Twitter className="w-4 h-4" /></a>
                <a href="#" className="hover:text-white transition"><Linkedin className="w-4 h-4" /></a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 Tricelyn. All rights reserved.</p>
          <p className="font-semibold text-gray-400">Fast. Fresh. Everyday.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

