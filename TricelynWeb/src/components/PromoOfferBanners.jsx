import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import bannerProduce from '../assets/Fresh Groceries, Delivered Fast.png';
import bannerDairy from '../assets/banner_dairy_eggs.png';
import bannerStaples from '../assets/banner_kitchen_staples.png';
import bannerSnacks from '../assets/banner_snacks_drinks.png';
import bannerCleaning from '../assets/banner_cleaning_care.png';

const BANNER_SLIDES = [
  {
    id: 'slide-fresh-groceries',
    title: 'Fresh Groceries, Delivered Fast',
    subtitle: 'Delivery in minutes • Farm Fresh Daily',
    image: bannerProduce,
    link: '/category/fruits-vegetables',
    alt: 'Fresh Groceries, Delivered Fast - Shop fruits, vegetables and daily essentials on Tricelyn',
  },
  {
    id: 'slide-dairy-eggs',
    title: 'Pure Dairy & Farm Fresh Eggs',
    subtitle: 'Delivery in minutes • Fresh Daily Morning Speed',
    image: bannerDairy,
    link: '/category/dairy-bread-eggs',
    alt: 'Pure Dairy and Farm Fresh Eggs - Milk, butter, bread and eggs delivered in minutes',
  },
  {
    id: 'slide-kitchen-staples',
    title: 'Kitchen Staples & Pure Ghee',
    subtitle: 'Delivery in minutes • Premium Rice, Atta & Oils',
    image: bannerStaples,
    link: '/category/atta-rice-dal',
    alt: 'Kitchen Staples and Pure Ghee - Premium basmati rice, organic dals and cooking oils',
  },
  {
    id: 'slide-snacks-drinks',
    title: 'Snacks, Munchies & Cold Drinks',
    subtitle: 'Delivery in minutes • Instant Midnight Cravings',
    image: bannerSnacks,
    link: '/category/snacks-munchies',
    alt: 'Snacks, Munchies and Cold Drinks - Chips, chocolates, ice creams and beverages',
  },
  {
    id: 'slide-home-cleaning',
    title: 'Home Cleaning & Personal Care',
    subtitle: 'Delivery in minutes • Everyday Savings On Essentials',
    image: bannerCleaning,
    link: '/category/cleaning-essentials',
    alt: 'Home Cleaning and Personal Care - Detergents, disinfectants and personal grooming',
  },
];

const PromoOfferBanners = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto-scroll effect: changes slide every 4 seconds when not paused
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = (e) => {
    if (e) e.preventDefault();
    setCurrentIndex((prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % BANNER_SLIDES.length);
  };

  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTimeout(() => setIsPaused(false), 2000);
  };

  return (
    <section className="w-full px-3 sm:px-4 lg:px-0">
      <div
        className="relative w-full max-w-[1600px] mx-auto overflow-hidden rounded-xl sm:rounded-2xl bg-[#07162E] shadow-sm group select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Carousel Slides Container */}
        <div
          className="flex transition-transform duration-700 ease-in-out w-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {BANNER_SLIDES.map((slide, idx) => (
            <div key={slide.id || idx} className="min-w-full flex-shrink-0">
              <Link
                to={slide.link}
                aria-label={slide.title}
                className="block w-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500"
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="block w-full h-auto object-contain transition-transform duration-500 ease-out group-hover:scale-[1.01]"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  fetchPriority={idx === 0 ? 'high' : 'auto'}
                  decoding="async"
                />
              </Link>
            </div>
          ))}
        </div>

        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Banner"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md active:scale-95 z-20 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Banner"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md active:scale-95 z-20 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Indicators Dots */}
        <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-20">
          {BANNER_SLIDES.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => setCurrentIndex(dotIdx)}
              aria-label={`Go to slide ${dotIdx + 1}`}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === dotIdx
                  ? 'w-6 sm:w-8 bg-white shadow-sm'
                  : 'w-2 sm:w-2.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export const GroceryHeroBanner = PromoOfferBanners;
export default PromoOfferBanners;
