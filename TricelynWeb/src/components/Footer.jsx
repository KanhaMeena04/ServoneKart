// import React from 'react';
// import { Link } from 'react-router-dom';
// import { 
//   Instagram, 
//   Facebook, 
//   Youtube, 
//   Twitter, 
//   Linkedin
// } from 'lucide-react';
// import logoImg from '../assets/webslogo.png';
// import { categories } from '../data/categories';

// const Footer = () => {
//   return (
//     <footer className="bg-[#00297F] text-white pt-8 pb-12 sm:pb-8 border-t border-slate-800">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

//         {/* Main Footer Links & Newsletter - Compact, Proportional Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 pb-6 border-b border-slate-800/80">
          
//           {/* Brand Info (4 cols) */}
//           <div className="md:col-span-5 lg:col-span-4 space-y-2.5">
//             <Link to="/" className="inline-block group">
//               <img 
//                 src={logoImg} 
//                 alt="Tricelyn - Groceries in minutes, from your own supermarket" 
//                 className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105" 
//               />
//             </Link>
//             <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
//               India's premier quick-commerce grocery delivery platform. Fresh fruits, vegetables, dairy, daily staples & snacks delivered to your doorstep in minutes.
//             </p>
//           </div>

//           {/* Quick Links (2 cols) */}
//           <div className="md:col-span-2 lg:col-span-2 space-y-2">
//             <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Links</h4>
//             <ul className="space-y-1.5 text-xs text-gray-400">
//               <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
//               <li><Link to="/categories" className="hover:text-blue-400 transition-colors">All Categories</Link></li>
//               <li><Link to="/stores" className="hover:text-blue-400 transition-colors">Nearby Stores</Link></li>
//               <li><Link to="/account/orders" className="hover:text-blue-400 transition-colors">My Orders</Link></li>
//               <li><Link to="/membership" className="hover:text-blue-400 transition-colors">Tricelyn Premier</Link></li>
//               <li><Link to="/membership?tab=vendor" className="hover:text-blue-400 transition-colors">Sell with Tricelyn (Vendor)</Link></li>
//               <li><Link to="/membership?tab=rider" className="hover:text-blue-400 transition-colors">Ride with Tricelyn (Rider)</Link></li>
//             </ul>
//           </div>

//           {/* Customer Service & Policies (2 cols) */}
//           <div className="md:col-span-2 lg:col-span-2 space-y-2">
//             <h4 className="text-xs font-bold text-white uppercase tracking-wider">Legal & Policies</h4>
//             <ul className="space-y-1.5 text-xs text-gray-400">
//               <li><Link to="/policy/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
//               <li><Link to="/policy/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
//               <li><Link to="/policy/refund" className="hover:text-blue-400 transition-colors">Return & Refund</Link></li>
//               <li><Link to="/policy/shipping" className="hover:text-blue-400 transition-colors">Delivery Policy</Link></li>
//               <li><Link to="/policy/faq" className="hover:text-blue-400 transition-colors">Help & FAQs</Link></li>
//               <li><Link to="/policy/contact" className="hover:text-blue-400 transition-colors">Contact Support</Link></li>
//               <li>
//                 <button
//                   type="button"
//                   onClick={() => window.dispatchEvent(new Event('open-support-chat'))}
//                   className="hover:text-blue-400 transition-colors text-left cursor-pointer"
//                 >
//                   24/7 Live Chat
//                 </button>
//               </li>
//             </ul>
//           </div>

//           {/* Socials & Connect (4 cols) */}
//           <div className="md:col-span-3 lg:col-span-4 space-y-2.5">
//             <h4 className="text-xs font-bold text-white uppercase tracking-wider">Connect With Us</h4>
//             <p className="text-xs text-gray-400">Follow Tricelyn for fresh product updates and daily essentials.</p>
//             <div className="flex items-center gap-2 text-gray-400 pt-1">
//               <a href="#" aria-label="Instagram" className="hover:text-white transition-colors p-2 rounded-xl bg-white/5 hover:bg-white/10"><Instagram className="w-4 h-4" /></a>
//               <a href="#" aria-label="Facebook" className="hover:text-white transition-colors p-2 rounded-xl bg-white/5 hover:bg-white/10"><Facebook className="w-4 h-4" /></a>
//               <a href="#" aria-label="YouTube" className="hover:text-white transition-colors p-2 rounded-xl bg-white/5 hover:bg-white/10"><Youtube className="w-4 h-4" /></a>
//               <a href="#" aria-label="Twitter" className="hover:text-white transition-colors p-2 rounded-xl bg-white/5 hover:bg-white/10"><Twitter className="w-4 h-4" /></a>
//               <a href="#" aria-label="LinkedIn" className="hover:text-white transition-colors p-2 rounded-xl bg-white/5 hover:bg-white/10"><Linkedin className="w-4 h-4" /></a>
//             </div>
//           </div>
//         </div>

//         {/* Main grocery categories */}
//         <section className="py-6 border-b border-slate-800/80" aria-labelledby="footer-categories-title">
//           <div className="flex items-center gap-3 mb-4">
//             <h4 id="footer-categories-title" className="text-sm font-bold text-white">
//               Categories
//             </h4>
//             <Link
//               to="/categories"
//               className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
//             >
//               See all
//             </Link>
//           </div>
//           <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs text-gray-400">
//             {categories.map((category) => (
//               <li key={category.name}>{category.name}</li>
//             ))}
//           </ul>
//         </section>

//         {/* Bottom Copyright Bar */}
//         <div className="pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2 border-t border-slate-800/60 mt-4">
//           <p>© 2026 Tricelyn Technologies Pvt Ltd. All rights reserved.</p>
//           <div className="flex items-center gap-4 text-gray-400 font-medium">
//             <span>Fast · Fresh · Everyday</span>
//           </div>
//         </div>

//       </div>
//     </footer>
//   );
// };

// export default Footer;





// import React from 'react';
// import { Link } from 'react-router-dom';
// import {
//   Instagram,
//   Facebook,
//   Youtube,
//   Twitter,
//   Linkedin,
// } from 'lucide-react';

// import logoImg from '../assets/webslogo.png';
// import { categories } from '../data/categories';

// const Footer = () => {
//   const footerCategories = categories.slice(0, 7);

//   // Scroll page to top immediately
//   const handleScrollTop = () => {
//     window.scrollTo({
//       top: 0,
//       left: 0,
//       behavior: 'instant',
//     });
//   };

//   return (
//     <footer className="bg-[#00297F] text-white pt-10 pb-8 border-t border-slate-800">

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-8 border-b border-slate-700/60">

         
//    {/* Categories */}
//           <div className="lg:col-span-4 space-y-4">

//             <div className="flex items-center gap-3">

//               <h4 className="text-sm font-bold text-white uppercase tracking-wider">
//                 Categories
//               </h4>

//               <Link
//                 to="/categories"
//                 onClick={handleScrollTop}
//                 className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
//               >
//                 See All →
//               </Link>

//             </div>

//             <ul className="space-y-3 text-sm text-gray-400">

//               {footerCategories.map((category) => (
//                 <li key={category.name}>
//                   <Link
//                     to={`/categories?category=${encodeURIComponent(category.name)}`}
//                     onClick={handleScrollTop}
//                     className="hover:text-blue-400 transition-colors"
//                   >
//                     {category.name}
//                   </Link>
//                 </li>
//               ))}

//             </ul>

//           </div>
//           {/* Quick Links */}
//           <div className="lg:col-span-2 space-y-4">

//             <h4 className="text-sm font-bold text-white uppercase tracking-wider">
//               Quick Links
//             </h4>

//             <ul className="space-y-3 text-sm text-gray-400">

//               <li>
//                 <Link
//                   to="/"
//                   onClick={handleScrollTop}
//                   className="hover:text-blue-400 transition-colors"
//                 >
//                   Home
//                 </Link>
//               </li>

//               <li>
//                 <Link
//                   to="/categories"
//                   onClick={handleScrollTop}
//                   className="hover:text-blue-400 transition-colors"
//                 >
//                   All Categories
//                 </Link>
//               </li>

//               <li>
//                 <Link
//                   to="/stores"
//                   onClick={handleScrollTop}
//                   className="hover:text-blue-400 transition-colors"
//                 >
//                   Nearby Stores
//                 </Link>
//               </li>

//               <li>
//                 <Link
//                   to="/account/orders"
//                   onClick={handleScrollTop}
//                   className="hover:text-blue-400 transition-colors"
//                 >
//                   My Orders
//                 </Link>
//               </li>

//               <li>
//                 <Link
//                   to="/membership"
//                   onClick={handleScrollTop}
//                   className="hover:text-blue-400 transition-colors"
//                 >
//                   Tricelyn Premier
//                 </Link>
//               </li>

//               <li>
//                 <Link
//                   to="/membership?tab=vendor"
//                   onClick={handleScrollTop}
//                   className="hover:text-blue-400 transition-colors"
//                 >
//                   Sell with Tricelyn
//                 </Link>
//               </li>

//               <li>
//                 <Link
//                   to="/membership?tab=rider"
//                   onClick={handleScrollTop}
//                   className="hover:text-blue-400 transition-colors"
//                 >
//                   Ride with Tricelyn
//                 </Link>
//               </li>

//             </ul>

//           </div>

//           {/* Legal & Policies */}
//           <div className="lg:col-span-2 space-y-4">

//             <h4 className="text-sm font-bold text-white uppercase tracking-wider">
//               Legal & Policies
//             </h4>

//             <ul className="space-y-3 text-sm text-gray-400">

//               <li>
//                 <Link to="/policy/terms" onClick={handleScrollTop} className="hover:text-blue-400 transition-colors">
//                   Terms of Service
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/policy/privacy" onClick={handleScrollTop} className="hover:text-blue-400 transition-colors">
//                   Privacy Policy
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/policy/refund" onClick={handleScrollTop} className="hover:text-blue-400 transition-colors">
//                   Return & Refund
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/policy/shipping" onClick={handleScrollTop} className="hover:text-blue-400 transition-colors">
//                   Delivery Policy
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/policy/faq" onClick={handleScrollTop} className="hover:text-blue-400 transition-colors">
//                   Help & FAQs
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/policy/contact" onClick={handleScrollTop} className="hover:text-blue-400 transition-colors">
//                   Contact Support
//                 </Link>
//               </li>

//               <li>
//                 <button
//                   type="button"
//                   onClick={() =>
//                     window.dispatchEvent(new Event('open-support-chat'))
//                   }
//                   className="hover:text-blue-400 transition-colors text-left"
//                 >
//                   24/7 Live Chat
//                 </button>
//               </li>

//             </ul>

//           </div>

//            {/* Brand + Connect With Us */}
//           <div className="sm:col-span-2 lg:col-span-4 space-y-5">

//             {/* Logo */}
//             <Link
//               to="/"
//               onClick={handleScrollTop}
//               className="inline-block group"
//             >
//               <img
//                 src={logoImg}
//                 alt="Tricelyn"
//                 className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
//               />
//             </Link>

//             {/* Description */}
//             <p className="text-sm text-gray-400 leading-6 max-w-sm">
//               India's premier quick-commerce grocery delivery platform.
//               Fresh fruits, vegetables, dairy, daily staples & snacks
//               delivered to your doorstep in minutes.
//             </p>

//             {/* Connect With Us */}
//             <div className="space-y-4">

//               <h4 className="text-sm font-bold text-white uppercase tracking-wider">
//                 Connect With Us
//               </h4>

//               <p className="text-sm text-gray-400 leading-6 max-w-sm">
//                 Follow Tricelyn for fresh product updates, exclusive offers
//                 and daily essentials.
//               </p>

//               {/* Social Icons */}
//               <div className="flex items-center gap-3 pt-1">

//                 <a
//                   href="#"
//                   aria-label="Instagram"
//                   className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
//                 >
//                   <Instagram className="w-4 h-4" />
//                 </a>

//                 <a
//                   href="#"
//                   aria-label="Facebook"
//                   className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
//                 >
//                   <Facebook className="w-4 h-4" />
//                 </a>

//                 <a
//                   href="#"
//                   aria-label="YouTube"
//                   className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
//                 >
//                   <Youtube className="w-4 h-4" />
//                 </a>

//                 <a
//                   href="#"
//                   aria-label="Twitter"
//                   className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
//                 >
//                   <Twitter className="w-4 h-4" />
//                 </a>

//                 <a
//                   href="#"
//                   aria-label="LinkedIn"
//                   className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
//                 >
//                   <Linkedin className="w-4 h-4" />
//                 </a>

//               </div>
//             </div>

//           </div>

       

//         </div>

//         {/* Bottom Copyright */}
//         <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">

//           <p className="text-center sm:text-left">
//             © 2026 Tricelyn Technologies Pvt Ltd. All rights reserved.
//           </p>

//           <p className="font-medium">
//             Fast <span className="text-blue-400">·</span> Fresh
//             <span className="text-blue-400"> · </span>
//             Everyday
//           </p>

//         </div>

//       </div>

//     </footer>
//   );
// };

// export default Footer;




// import React from 'react';
// import { Link } from 'react-router-dom';
// import {
//   Instagram,
//   Facebook,
//   Youtube,
//   Twitter,
//   Linkedin,
// } from 'lucide-react';

// import logoImg from '../assets/webslogo.png';
// import { categories } from '../data/categories';

// const Footer = () => {
//   const footerCategories = categories.slice(0, 7);

//   const handleScrollTop = () => {
//     window.scrollTo({
//       top: 0,
//       left: 0,
//       behavior: 'instant',
//     });
//   };

//   const headingClass =
//     'text-sm font-bold text-white uppercase tracking-wider';

//   const linkClass =
//     'text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200 leading-6';

//   const socialClass =
//     'w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200';

//   return (
//     <footer className="bg-[#00297F] text-white pt-10 sm:pt-12 pb-6 sm:pb-8 border-t border-slate-800">

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

//         {/* Main Footer Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-9 lg:gap-x-8 lg:gap-y-10 pb-9 sm:pb-10 border-b border-slate-700/60">

//           {/* Categories */}
//           <div className="min-w-0 lg:col-span-4">

//             <div className="flex items-center gap-3 mb-5">

//               <h4 className={headingClass}>
//                 Categories
//               </h4>

//               <Link
//                 to="/categories"
//                 onClick={handleScrollTop}
//                 className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap"
//               >
//                 See All →
//               </Link>

//             </div>

//             <ul className="flex flex-col gap-3">

//               {footerCategories.map((category) => (
//                 <li key={category.name}>
//                   <Link
//                     to={`/categories?category=${encodeURIComponent(category.name)}`}
//                     onClick={handleScrollTop}
//                     className={linkClass}
//                   >
//                     {category.name}
//                   </Link>
//                 </li>
//               ))}

//             </ul>

//           </div>

//           {/* Quick Links */}
//           <div className="min-w-0 lg:col-span-2">

//             <h4 className={`${headingClass} mb-5`}>
//               Quick Links
//             </h4>

//             <ul className="flex flex-col gap-3">

//               <li>
//                 <Link to="/" onClick={handleScrollTop} className={linkClass}>
//                   Home
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/categories" onClick={handleScrollTop} className={linkClass}>
//                   All Categories
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/stores" onClick={handleScrollTop} className={linkClass}>
//                   Nearby Stores
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/account/orders" onClick={handleScrollTop} className={linkClass}>
//                   My Orders
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/membership" onClick={handleScrollTop} className={linkClass}>
//                   Tricelyn Premier
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/membership?tab=vendor" onClick={handleScrollTop} className={linkClass}>
//                   Sell with Tricelyn
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/membership?tab=rider" onClick={handleScrollTop} className={linkClass}>
//                   Ride with Tricelyn
//                 </Link>
//               </li>

//             </ul>

//           </div>

//           {/* Legal & Policies */}
//           <div className="min-w-0 lg:col-span-2">

//             <h4 className={`${headingClass} mb-5`}>
//               Legal & Policies
//             </h4>

//             <ul className="flex flex-col gap-3">

//               <li>
//                 <Link to="/policy/terms" onClick={handleScrollTop} className={linkClass}>
//                   Terms of Service
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/policy/privacy" onClick={handleScrollTop} className={linkClass}>
//                   Privacy Policy
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/policy/refund" onClick={handleScrollTop} className={linkClass}>
//                   Return & Refund
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/policy/shipping" onClick={handleScrollTop} className={linkClass}>
//                   Delivery Policy
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/policy/faq" onClick={handleScrollTop} className={linkClass}>
//                   Help & FAQs
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/policy/contact" onClick={handleScrollTop} className={linkClass}>
//                   Contact Support
//                 </Link>
//               </li>

//               <li>
//                 <button
//                   type="button"
//                   onClick={() =>
//                     window.dispatchEvent(new Event('open-support-chat'))
//                   }
//                   className={`${linkClass} text-left`}
//                 >
//                   24/7 Live Chat
//                 </button>
//               </li>

//             </ul>

//           </div>

//           {/* Brand + Connect With Us */}
//           <div className="min-w-0 sm:col-span-2 lg:col-span-4 space-y-5">

//             {/* Logo */}
//             <Link
//               to="/"
//               onClick={handleScrollTop}
//               className="inline-block group"
//             >
//               <img
//                 src={logoImg}
//                 alt="Tricelyn"
//                 className="h-10 sm:h-11 w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
//               />
//             </Link>

//             {/* Description */}
//             <p className="text-sm text-gray-400 leading-7 max-w-sm">
//               India's premier quick-commerce grocery delivery platform.
//               Fresh fruits, vegetables, dairy, daily staples & snacks
//               delivered to your doorstep in minutes.
//             </p>

//             {/* Connect With Us */}
//             <div className="space-y-3">

//               <h4 className={headingClass}>
//                 Connect With Us
//               </h4>

//               <p className="text-sm text-gray-400 leading-6 max-w-sm">
//                 Follow Tricelyn for fresh product updates, exclusive offers
//                 and daily essentials.
//               </p>

//               {/* Social Icons */}
//               <div className="flex flex-wrap items-center gap-3 pt-1">

//                 <a
//                   href="#"
//                   aria-label="Instagram"
//                   className={socialClass}
//                 >
//                   <Instagram size={17} />
//                 </a>

//                 <a
//                   href="#"
//                   aria-label="Facebook"
//                   className={socialClass}
//                 >
//                   <Facebook size={17} />
//                 </a>

//                 <a
//                   href="#"
//                   aria-label="YouTube"
//                   className={socialClass}
//                 >
//                   <Youtube size={17} />
//                 </a>

//                 <a
//                   href="#"
//                   aria-label="Twitter"
//                   className={socialClass}
//                 >
//                   <Twitter size={17} />
//                 </a>

//                 <a
//                   href="#"
//                   aria-label="LinkedIn"
//                   className={socialClass}
//                 >
//                   <Linkedin size={17} />
//                 </a>

//               </div>

//             </div>

//           </div>

//         </div>

//         {/* Bottom Copyright */}
//         <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-gray-400">

//           <p className="text-center sm:text-left leading-5">
//             © 2026 Tricelyn Technologies Pvt Ltd. All rights reserved.
//           </p>

//           <p className="font-medium whitespace-nowrap">
//             Fast
//             <span className="text-blue-400 mx-1.5">·</span>
//             Fresh
//             <span className="text-blue-400 mx-1.5">·</span>
//             Everyday
//           </p>

//         </div>

//       </div>

//     </footer>
//   );
// };

// export default Footer;





// import React from 'react';
// import { Link } from 'react-router-dom';
// import {
//   Instagram,
//   Facebook,
//   Youtube,
//   Twitter,
//   Linkedin,
// } from 'lucide-react';

// import logoImg from '../assets/webslogo.png';
// import { CATEGORIES } from '../data/groceryCatalog';

// const Footer = () => {
//   const footerCategories = [...CATEGORIES].sort(
//     (a, b) => (a.position || 0) - (b.position || 0)
//   );

//   const handleScrollTop = () => {
//     window.scrollTo({
//       top: 0,
//       left: 0,
//       behavior: 'instant',
//     });
//   };

//   const headingClass =
//     'text-sm font-bold text-white';

//   const linkClass =
//     'text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200 leading-6';

//   const socialClass =
//     'w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200';

//   return (
//     <footer className="bg-[#00297F] text-white pt-10 sm:pt-12 pb-6 sm:pb-8 border-t border-slate-800">

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

//         {/* CATEGORY SECTION */}
//         <div className="pb-9 sm:pb-10 border-b border-slate-700/60">

//           <h4 className="text-base sm:text-lg font-bold text-white mb-6">
//             Categories
//           </h4>

//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-3">

//             {footerCategories.map((category) => (
//               <Link
//                 key={category.id || category.slug}
//                 to={`/categories?category=${encodeURIComponent(category.slug)}`}
//                 onClick={handleScrollTop}
//                 className="text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200 leading-6"
//               >
//                 {category.name}
//               </Link>
//             ))}

//           </div>

//         </div>

//         {/* MAIN FOOTER GRID */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-9 lg:gap-y-10 py-9 sm:py-10 border-b border-slate-700/60">


//   {/* BRAND + CONNECT WITH US */}
//           <div className="min-w-0 sm:col-span-2 lg:col-span-6 space-y-5">

//             {/* LOGO */}
//             <Link
//               to="/"
//               onClick={handleScrollTop}
//               className="inline-block group"
//             >
//               <img
//                 src={logoImg}
//                 alt="Tricelyn"
//                 className="h-10 sm:h-11 w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
//               />
//             </Link>

//             {/* DESCRIPTION */}
//             <p className="text-sm text-gray-400 leading-7 max-w-sm">
//               India's premier quick-commerce grocery delivery platform.
//               Fresh fruits, vegetables, dairy, daily staples & snacks
//               delivered to your doorstep in minutes.
//             </p>

//             {/* CONNECT WITH US */}
//             <div className="space-y-3">

//               <h4 className={headingClass}>
//                 Connect With Us
//               </h4>

//               <p className="text-sm text-gray-400 leading-6 max-w-sm">
//                 Follow Tricelyn for fresh product updates, exclusive offers
//                 and daily essentials.
//               </p>

//               {/* SOCIAL ICONS */}
//               <div className="flex flex-wrap items-center gap-3 pt-1">

//                 <a
//                   href="#"
//                   aria-label="Instagram"
//                   className={socialClass}
//                 >
//                   <Instagram size={17} />
//                 </a>

//                 <a
//                   href="#"
//                   aria-label="Facebook"
//                   className={socialClass}
//                 >
//                   <Facebook size={17} />
//                 </a>

//                 <a
//                   href="#"
//                   aria-label="YouTube"
//                   className={socialClass}
//                 >
//                   <Youtube size={17} />
//                 </a>

//                 <a
//                   href="#"
//                   aria-label="Twitter"
//                   className={socialClass}
//                 >
//                   <Twitter size={17} />
//                 </a>

//                 <a
//                   href="#"
//                   aria-label="LinkedIn"
//                   className={socialClass}
//                 >
//                   <Linkedin size={17} />
//                 </a>

//               </div>

//             </div>

//           </div>
//           {/* QUICK LINKS */}
//           <div className="min-w-0 lg:col-span-3">

//             <h4 className={`${headingClass} mb-5`}>
//               Quick Links
//             </h4>

//             <ul className="flex flex-col gap-3">

//               <li>
//                 <Link to="/" onClick={handleScrollTop} className={linkClass}>
//                   Home
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/categories" onClick={handleScrollTop} className={linkClass}>
//                   All Categories
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/stores" onClick={handleScrollTop} className={linkClass}>
//                   Nearby Stores
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/account/orders" onClick={handleScrollTop} className={linkClass}>
//                   My Orders
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/membership" onClick={handleScrollTop} className={linkClass}>
//                   Tricelyn Premier
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/membership?tab=vendor" onClick={handleScrollTop} className={linkClass}>
//                   Sell with Tricelyn
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/membership?tab=rider" onClick={handleScrollTop} className={linkClass}>
//                   Ride with Tricelyn
//                 </Link>
//               </li>

//             </ul>

//           </div>

//           {/* LEGAL & POLICIES */}
//           <div className="min-w-0 lg:col-span-3">

//             <h4 className={`${headingClass} mb-5`}>
//               Legal & Policies
//             </h4>

//             <ul className="flex flex-col gap-3">

//               <li>
//                 <Link to="/policy/terms" onClick={handleScrollTop} className={linkClass}>
//                   Terms of Service
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/policy/privacy" onClick={handleScrollTop} className={linkClass}>
//                   Privacy Policy
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/policy/refund" onClick={handleScrollTop} className={linkClass}>
//                   Return & Refund
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/policy/shipping" onClick={handleScrollTop} className={linkClass}>
//                   Delivery Policy
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/policy/faq" onClick={handleScrollTop} className={linkClass}>
//                   Help & FAQs
//                 </Link>
//               </li>

//               <li>
//                 <Link to="/policy/contact" onClick={handleScrollTop} className={linkClass}>
//                   Contact Support
//                 </Link>
//               </li>

//               <li>
//                 <button
//                   type="button"
//                   onClick={() =>
//                     window.dispatchEvent(new Event('open-support-chat'))
//                   }
//                   className={`${linkClass} text-left`}
//                 >
//                   24/7 Live Chat
//                 </button>
//               </li>

//             </ul>

//           </div>

        

//         </div>

//         {/* BOTTOM COPYRIGHT */}
//         <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-gray-400">

//           <p className="text-center sm:text-left leading-5">
//             © 2026 Tricelyn Technologies Pvt Ltd. All rights reserved.
//           </p>

//           <p className="font-medium whitespace-nowrap">
//             Fast
//             <span className="text-blue-400 mx-1.5">·</span>
//             Fresh
//             <span className="text-blue-400 mx-1.5">·</span>
//             Everyday
//           </p>

//         </div>

//       </div>

//     </footer>
//   );
// };

// export default Footer;



import React from 'react';
import { Link } from 'react-router-dom';

import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
} from 'lucide-react';

import logoImg from '../assets/webslogo.png';

import { CATEGORIES } from '../data/groceryCatalog';

import {
  trendingSearches,
  popularSearches,
  footerCategories,
  footerCities,
} from '../data/footerSeoData';


const Footer = () => {

  const categories = [...CATEGORIES].sort(
    (a, b) => (a.position || 0) - (b.position || 0)
  );

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  };

  const headingClass =
    'text-sm font-bold text-white';

  const linkClass =
    'text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200 leading-6';

  const socialClass =
    'w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200';


  // SEO LINKS COMPONENT

  const renderSeoLinks = (title, items, route = '/search') => {

    return (
      <div className="mb-5 last:mb-0">

        <h5 className="text-sm font-semibold text-gray-300 mb-2">
          {title}
        </h5>

        <div className="flex flex-wrap items-center gap-x-1 gap-y-1">

          {items.map((item, index) => (

            <React.Fragment key={`${title}-${item}`}>

              <Link
                to={`${route}?q=${encodeURIComponent(item)}`}
                onClick={handleScrollTop}
                className="text-xs sm:text-[13px] text-gray-400 hover:text-blue-400 transition-colors duration-200 leading-6"
              >
                {item}
              </Link>

              {index !== items.length - 1 && (
                <span className="text-gray-600 text-xs">
                  |
                </span>
              )}

            </React.Fragment>

          ))}

        </div>

      </div>
    );
  };


  // CITIES COMPONENT

  const renderCities = () => (

    <div className="flex flex-wrap items-center gap-x-2 gap-y-2">

      {footerCities.map((city, index) => (

        <React.Fragment key={city}>

          <Link
            to={`/stores?city=${encodeURIComponent(city)}`}
            onClick={handleScrollTop}
            className="text-xs sm:text-[13px] text-gray-400 hover:text-blue-400 transition-colors duration-200"
          >
            {city}
          </Link>

          {index !== footerCities.length - 1 && (
            <span className="text-gray-600 text-xs">
              |
            </span>
          )}

        </React.Fragment>

      ))}

    </div>

  );


  return (

    <footer className="bg-[#00297F] text-white pt-10 sm:pt-12 pb-6 sm:pb-8 border-t border-[#0145F2]/30">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


 {/* SEO SEARCH SECTION */}

       
{/* SEO SEARCH SECTION */}

<div className="py-7 sm:py-9 border-b border-slate-700/60 space-y-6 sm:space-y-7">

  {/* TRENDING SEARCHES */}

  <section>

    <h3 className="text-base sm:text-lg font-bold text-white mb-3">
      Trending Searches
    </h3>

    <div className="space-y-1">

      {renderSeoLinks('Categories', trendingSearches.categories)}

      {renderSeoLinks('Products', trendingSearches.products)}

      {renderSeoLinks('Brands', trendingSearches.brands)}

    </div>

  </section>


  {/* POPULAR SEARCHES */}

  <section>

    <h3 className="text-base sm:text-lg font-bold text-white mb-3">
      Popular Searches
    </h3>

    <div className="space-y-3">

      {renderSeoLinks('Trending', popularSearches.trending)}

      {renderSeoLinks('Events', popularSearches.events)}

      {renderSeoLinks('Brands', popularSearches.brands)}

      {renderSeoLinks('Categories', popularSearches.categories)}

      {renderSeoLinks('Shop', popularSearches.shops)}

    </div>

  </section>


  {/* CITIES */}

  <section>

    <h3 className="text-base sm:text-lg font-bold text-white mb-3">
      Cities
    </h3>

    {renderCities()}

  </section>

</div>


        {/* EXISTING CATEGORY SECTION */}

        <div className="pb-9 sm:pb-10 border-b border-slate-700/60">

          <h4 className="text-base sm:text-lg font-bold text-white mb-6">
            Categories
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-3">

            {categories.map((category) => (

              <Link
                key={category.id || category.slug}
                to={`/categories?category=${encodeURIComponent(category.slug)}`}
                onClick={handleScrollTop}
                className="text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200 leading-6"
              >
                {category.name}
              </Link>

            ))}

          </div>

        </div>


        {/* MAIN FOOTER GRID */}

       

<div className="grid grid-cols-2 lg:grid-cols-12 gap-x-5 sm:gap-x-8 gap-y-9 lg:gap-y-10 py-9 sm:py-10 border-b border-slate-700/60">

  {/* QUICK LINKS */}

  <div className="min-w-0 lg:col-span-3 order-1 lg:order-2">

    <h4 className={`${headingClass} mb-5`}>
      Quick Links
    </h4>

    <ul className="flex flex-col gap-3">

      <li>
        <Link to="/" onClick={handleScrollTop} className={linkClass}>
          Home
        </Link>
      </li>

      <li>
        <Link to="/categories" onClick={handleScrollTop} className={linkClass}>
          All Categories
        </Link>
      </li>

      <li>
        <Link to="/stores" onClick={handleScrollTop} className={linkClass}>
          Nearby Stores
        </Link>
      </li>

      <li>
        <Link to="/account/orders" onClick={handleScrollTop} className={linkClass}>
          My Orders
        </Link>
      </li>

      <li>
        <Link to="/membership" onClick={handleScrollTop} className={linkClass}>
          Tricelyn Premier
        </Link>
      </li>

      <li>
        <Link to="/membership?tab=vendor" onClick={handleScrollTop} className={linkClass}>
          Sell with Tricelyn
        </Link>
      </li>

      <li>
        <Link to="/membership?tab=rider" onClick={handleScrollTop} className={linkClass}>
          Ride with Tricelyn
        </Link>
      </li>

    </ul>

  </div>


  {/* LEGAL & POLICIES */}

  <div className="min-w-0 lg:col-span-3 order-2 lg:order-3">

    <h4 className={`${headingClass} mb-5`}>
      Legal & Policies
    </h4>

    <ul className="flex flex-col gap-3">

      <li>
        <Link to="/policy/terms" onClick={handleScrollTop} className={linkClass}>
          Terms of Service
        </Link>
      </li>

      <li>
        <Link to="/policy/privacy" onClick={handleScrollTop} className={linkClass}>
          Privacy Policy
        </Link>
      </li>

      <li>
        <Link to="/policy/refund" onClick={handleScrollTop} className={linkClass}>
          Return & Refund
        </Link>
      </li>

      <li>
        <Link to="/policy/shipping" onClick={handleScrollTop} className={linkClass}>
          Delivery Policy
        </Link>
      </li>

      <li>
        <Link to="/policy/faq" onClick={handleScrollTop} className={linkClass}>
          Help & FAQs
        </Link>
      </li>

      <li>
        <Link to="/policy/contact" onClick={handleScrollTop} className={linkClass}>
          Contact Support
        </Link>
      </li>

      <li>
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new Event('open-support-chat'))
          }
          className={`${linkClass} text-left`}
        >
          24/7 Live Chat
        </button>
      </li>

    </ul>

  </div>


  {/* BRAND + CONNECT WITH US - FULL WIDTH ON MOBILE/TABLET */}

  <div className="min-w-0 col-span-2 lg:col-span-6 order-3 lg:order-1 space-y-5">

    {/* LOGO */}

    <Link
      to="/"
      onClick={handleScrollTop}
      className="inline-block group"
    >
      <img
        src={logoImg}
        alt="Tricelyn"
        className="h-10 sm:h-11 w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
      />
    </Link>


    {/* BRAND DESCRIPTION */}

    <p className="text-sm text-gray-400 leading-7 max-w-sm">
      India's premier quick-commerce grocery delivery platform.
      Fresh fruits, vegetables, dairy, daily staples & snacks
      delivered to your doorstep in minutes.
    </p>


    {/* CONNECT WITH US */}

    <div className="space-y-3">

      <h4 className={headingClass}>
        Connect With Us
      </h4>

      <p className="text-sm text-gray-400 leading-6 max-w-sm">
        Follow Tricelyn for fresh product updates, exclusive offers
        and daily essentials.
      </p>


      {/* SOCIAL ICONS */}

      <div className="flex flex-wrap items-center gap-3 pt-1">

        <a
          href="#"
          aria-label="Instagram"
          className={socialClass}
        >
          <Instagram size={17} />
        </a>

        <a
          href="#"
          aria-label="Facebook"
          className={socialClass}
        >
          <Facebook size={17} />
        </a>

        <a
          href="#"
          aria-label="YouTube"
          className={socialClass}
        >
          <Youtube size={17} />
        </a>

        <a
          href="#"
          aria-label="Twitter"
          className={socialClass}
        >
          <Twitter size={17} />
        </a>

        <a
          href="#"
          aria-label="LinkedIn"
          className={socialClass}
        >
          <Linkedin size={17} />
        </a>

      </div>

    </div>

  </div>

</div>




       


        {/* BOTTOM COPYRIGHT */}

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-gray-400">

          <p className="text-center sm:text-left leading-5">
            © 2026 Tricelyn Technologies Pvt Ltd. All rights reserved.
          </p>

          <p className="font-medium whitespace-nowrap">

            Fast

            <span className="text-blue-400 mx-1.5">
              ·
            </span>

            Fresh

            <span className="text-blue-400 mx-1.5">
              ·
            </span>

            Everyday

          </p>

        </div>


      </div>

    </footer>

  );

};

export default Footer;
