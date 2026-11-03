import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import bannerDailyEssentials from '../assets/banner_daily_essentials.png';
import bannerFarmFreshItems from '../assets/banner_farm_fresh_items.png';

const HeroBannerSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slides = [
    {
      id: 'slide-daily-essentials',
      tag: 'FARM FRESH · 10-15 MINS',
      title: 'Stock up on daily essentials',
      subtitle: 'Get farm-fresh goodness & a range of exotic fruits, vegetables, eggs & more',
      buttonText: 'Shop Now',
      link: '/category/fruits-vegetables',
      theme: 'green',
      bgGradient: 'from-[#116932] via-[#15803d] to-[#1e9b4b]',
      buttonClass: 'bg-white text-[#116932] hover:bg-gray-50',
      desktopImage: bannerDailyEssentials,
      mobileSideImage: bannerFarmFreshItems,
      sideImageAlt: 'Farm fresh fruits, vegetables, milk, and eggs'
    },
    {
      id: 'slide-superfast-grocery',
      tag: 'SUPERFAST INDORE · TRICELYN',
      title: 'Groceries Delivered in 10-15 Mins',
      subtitle: 'Fresh milk, breads, daily pantry staples & household essentials delivered right to your doorstep',
      buttonText: 'Order Now',
      link: '/categories',
      theme: 'blue',
      bgGradient: 'from-[#0038a8] via-[#0055ff] to-[#0284c7]',
      buttonClass: 'bg-white text-[#0055ff] hover:bg-blue-50',
      sideImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&q=80',
      sideImageAlt: 'Tricelyn fresh groceries and essentials'
    },
    {
      id: 'slide-summer-coolers',
      tag: 'ICY COLD · REFRESHMENTS',
      title: 'Chilled Drinks, Ice Creams & Juices',
      subtitle: 'Beat the heat with iced sodas, cold-pressed juices, coconut water & gourmet ice creams',
      buttonText: 'Explore Coolers',
      link: '/category/cold-drinks-juices',
      theme: 'orange',
      bgGradient: 'from-[#9a3412] via-[#ea580c] to-[#f97316]',
      buttonClass: 'bg-white text-[#ea580c] hover:bg-orange-50',
      sideImage: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1000&q=80',
      sideImageAlt: 'Chilled juices, sodas and ice creams'
    },
    {
      id: 'slide-snacks-munchies',
      tag: 'INSTANT CRAVINGS · SWEETS',
      title: 'Snacks, Munchies & Chocolates',
      subtitle: 'Crunchy namkeen, imported chocolates, potato chips & cookies for every craving',
      buttonText: 'Grab Snacks',
      link: '/category/snacks-munchies',
      theme: 'purple',
      bgGradient: 'from-[#4c1d95] via-[#7c3aed] to-[#9333ea]',
      buttonClass: 'bg-white text-[#7c3aed] hover:bg-purple-50',
      sideImage: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1000&q=80',
      sideImageAlt: 'Chips, cookies and chocolates'
    }
  ];

  // Auto-play timer (slides every 4.5 seconds, pauses on mouse hover)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Touch Swipe Handlers for mobile phones
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  return (
    <div
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Track */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, idx) => {
          // Slide 1 has the exact cropped reference image for desktop
          if (slide.desktopImage) {
            return (
              <div
                key={slide.id}
                className="w-full flex-shrink-0 relative overflow-hidden flex items-center h-[185px] sm:h-[210px] md:h-[235px] lg:h-[250px]"
              >
                {/* Desktop view: 100% pixel-perfect image from reference screenshot */}
                <div className="hidden sm:block w-full h-full">
                  <Link to={slide.link} className="block w-full h-full">
                    <img
                      src={slide.desktopImage}
                      alt={slide.title}
                      className="w-full h-full object-cover rounded-2xl sm:rounded-3xl"
                    />
                  </Link>
                </div>

                {/* Mobile view (< 640px): Rich responsive layout so typography remains large and clear */}
                <div className={`sm:hidden w-full h-full min-h-[175px] bg-gradient-to-r ${slide.bgGradient} p-5 flex flex-col justify-between relative overflow-hidden`}>
                  {/* Subtle blur background element */}
                  <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-xl pointer-events-none" />

                  {/* Right side farm fresh image filling the right side */}
                  <div className="absolute right-0 top-0 bottom-0 w-7/12 pointer-events-none flex items-center justify-end overflow-hidden">
                    <img
                      src={slide.mobileSideImage}
                      alt={slide.sideImageAlt}
                      className="w-full h-full object-cover object-left"
                      style={{
                        maskImage: 'linear-gradient(to right, transparent 0%, black 30%, black 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%, black 100%)'
                      }}
                    />
                  </div>

                  {/* Left Content */}
                  <div className="relative z-10 max-w-[65%] space-y-2">
                    <h2 className="text-xl font-black text-white tracking-tight leading-tight">
                      {slide.title}
                    </h2>
                    <p className="text-[11px] text-white/90 font-medium line-clamp-2 leading-snug">
                      {slide.subtitle}
                    </p>
                  </div>

                  <div className="relative z-10 pt-2">
                    <Link
                      to={slide.link}
                      className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl font-black text-xs shadow-md active:scale-95 transition-all ${slide.buttonClass}`}
                    >
                      <span>{slide.buttonText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          }

          // Slides 2, 3, 4: Full-bleed high-impact responsive quick-commerce banners
          return (
            <div
              key={slide.id}
              className={`w-full flex-shrink-0 relative overflow-hidden flex items-center h-[185px] sm:h-[210px] md:h-[235px] lg:h-[250px] bg-gradient-to-r ${slide.bgGradient}`}
            >
              {/* Background ambient lighting */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 left-1/3 w-60 h-60 bg-black/10 rounded-full blur-xl pointer-events-none" />

              {/* Right Image: Stretches top-to-bottom edge-to-edge, smoothly masked into background */}
              <div className="absolute right-0 top-0 bottom-0 w-3/5 sm:w-1/2 lg:w-7/12 pointer-events-none flex items-center justify-end overflow-hidden">
                <img
                  src={slide.sideImage}
                  alt={slide.sideImageAlt}
                  className="w-full h-full object-cover object-center sm:object-right transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{
                    maskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 100%)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 100%)'
                  }}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
                {/* Mobile contrast overlay */}
                <div className="sm:hidden absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
              </div>

              {/* Left Content Area */}
              <div className="relative z-10 w-full sm:w-3/5 lg:w-1/2 p-5 sm:p-7 md:p-9 space-y-2 sm:space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                  <Sparkles className="w-3 h-3 text-white" />
                  <span>{slide.tag}</span>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[34px] font-black text-white tracking-tight leading-tight drop-shadow-xs">
                  {slide.title}
                </h2>

                <p className="text-xs sm:text-sm md:text-base text-white/90 font-medium leading-relaxed max-w-md line-clamp-2 sm:line-clamp-none">
                  {slide.subtitle}
                </p>

                <div className="pt-1 sm:pt-2">
                  <Link
                    to={slide.link}
                    className={`inline-flex items-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 ${slide.buttonClass}`}
                  >
                    <span>{slide.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrow: Previous (Desktop hover) */}
      <button
        onClick={prevSlide}
        aria-label="Previous Banner"
        className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/25 hover:bg-black/50 text-white backdrop-blur-md items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md active:scale-90 z-20"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Navigation Arrow: Next (Desktop hover) */}
      <button
        onClick={nextSlide}
        aria-label="Next Banner"
        className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/25 hover:bg-black/50 text-white backdrop-blur-md items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md active:scale-90 z-20"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicator Dots (Bottom Center) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-full">
        {slides.map((_, dotIdx) => (
          <button
            key={dotIdx}
            onClick={() => setCurrentSlide(dotIdx)}
            aria-label={`Go to slide ${dotIdx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              currentSlide === dotIdx
                ? 'w-6 h-2 bg-white'
                : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBannerSlider;
