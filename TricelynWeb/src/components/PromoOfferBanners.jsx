import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { groceryService } from '../services/api';

const DEFAULT_CARDS = [
  {
    id: 'kitchen-staples',
    badge: 'FLAT 30% OFF',
    title: 'Kitchen Staples & Pure Ghee',
    subtitle: 'Premium basmati rice, organic dals, pure spices & cold-pressed oils',
    buttonText: 'Order Staples',
    link: '/category/atta-rice-dal',
    bgGradient: 'from-[#7c2d12] via-[#c2410c] to-[#ea580c]',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=700&q=80',
    alt: 'Kitchen staples, rice, pulses, and spices'
  },
  {
    id: 'home-cleaning',
    badge: 'EVERYDAY SAVINGS',
    title: 'Home Care & Disinfectants',
    subtitle: 'Top brand detergents, floor cleaners, kitchen sprays & air fresheners',
    buttonText: 'Shop Cleaners',
    link: '/category/household-cleaning',
    bgGradient: 'from-[#0c4a6e] via-[#0284c7] to-[#0ea5e9]',
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=700&q=80',
    alt: 'Household cleaning supplies and detergents'
  },
  {
    id: 'personal-care',
    badge: 'STARTING @ ₹49',
    title: 'Personal Care & Grooming',
    subtitle: 'Herbal body washes, shampoos, oral hygiene & daily skincare essentials',
    buttonText: 'Explore Range',
    link: '/category/personal-care',
    bgGradient: 'from-[#312e81] via-[#4f46e5] to-[#7c3aed]',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=700&q=80',
    alt: 'Personal care, grooming and skincare products'
  }
];

const PromoOfferBanners = () => {
  const [cards, setCards] = useState(DEFAULT_CARDS);

  // Fetch dynamic offer cards from Master Admin
  useEffect(() => {
    let isMounted = true;
    const fetchOffers = async () => {
      try {
        const res = await groceryService.getBanners();
        if (isMounted && res?.data?.offerBanners && Array.isArray(res.data.offerBanners) && res.data.offerBanners.length > 0) {
          const mapped = res.data.offerBanners.map((c, idx) => ({
            id: c.id || `offer-${idx}`,
            badge: c.badge || c.highlight || 'SPECIAL OFFER',
            title: c.title || 'Special Deal',
            subtitle: c.subtitle || 'Best offers on daily essentials',
            buttonText: c.buttonText || 'Shop Now',
            link: c.link || '/categories',
            bgGradient: c.bgGradient || (idx === 0 ? 'from-[#7c2d12] via-[#c2410c] to-[#ea580c]' : idx === 1 ? 'from-[#0c4a6e] via-[#0284c7] to-[#0ea5e9]' : 'from-[#312e81] via-[#4f46e5] to-[#7c3aed]'),
            image: c.image || DEFAULT_CARDS[idx % DEFAULT_CARDS.length].image,
            alt: c.alt || c.title || 'Offer Card'
          }));
          setCards(mapped);
        }
      } catch (err) {
        console.warn('Using default promo offer cards:', err.message);
      }
    };
    fetchOffers();
    return () => { isMounted = false; };
  }, []);

  if (!cards || cards.length === 0) return null;

  return (
    <section className="w-full">
      {/* 
        Promotional Offer Cards:
        - Mobile (< 768px): Smooth swipeable horizontal snap carousel (w-[82vw])
        - Desktop (>= 768px): 3 Equal side-by-side columns
      */}
      <div className="flex overflow-x-auto pb-2 scrollbar-none snap-x md:grid md:grid-cols-3 gap-3.5 sm:gap-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`w-[82vw] sm:w-[70vw] md:w-auto flex-shrink-0 snap-start relative rounded-2xl md:rounded-3xl p-5 sm:p-6 overflow-hidden flex flex-col justify-between min-h-[165px] sm:min-h-[175px] shadow-xs hover:shadow-md transition-all duration-200 group bg-gradient-to-r ${card.bgGradient}`}
          >
            {/* Ambient Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

            {/* Right Image: Edge-to-edge full height, seamlessly blended */}
            <div className="absolute right-0 top-0 bottom-0 w-[45%] sm:w-[42%] pointer-events-none flex items-center justify-end overflow-hidden">
              <img
                src={card.image}
                alt={card.alt}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                style={{
                  maskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 100%)'
                }}
                loading="lazy"
              />
            </div>

            {/* Left Content Area */}
            <div className="relative z-10 max-w-[62%] sm:max-w-[60%] space-y-1 sm:space-y-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-white/20 text-white border border-white/25 backdrop-blur-2xs">
                <Sparkles className="w-2.5 h-2.5 text-white" />
                <span>{card.badge}</span>
              </span>

              <h3 className="text-base sm:text-lg md:text-xl font-black text-white leading-tight tracking-tight">
                {card.title}
              </h3>

              <p className="text-xs text-white/90 font-medium line-clamp-2 leading-snug">
                {card.subtitle}
              </p>
            </div>

            {/* Action Button */}
            <div className="relative z-10 pt-3">
              <Link
                to={card.link}
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-1.5 sm:py-2 bg-white text-gray-900 hover:bg-gray-100 rounded-full text-xs font-black shadow-xs transition-transform active:scale-95"
              >
                <span>{card.buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PromoOfferBanners;
