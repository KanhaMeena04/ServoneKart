import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';

const HeroBannerSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // 4 Original Tricelyn Quick-Commerce Slides
  const slides = [
    {
      id: 'slide-farm-fresh',
      tag: 'TRICELYN FRESH · 10-15 MINS',
      title: 'Farm Fresh Fruits & Vegetables',
      subtitle: 'Crisp seasonal greens, organic veggies & juicy fruits delivered straight from local Indore mandis',
      buttonText: 'Order Fresh',
      link: '/category/fruits-vegetables',
      bgGradient: 'from-[#064e3b] via-[#047857] to-[#10b981]',
      buttonClass: 'bg-white text-[#064e3b] hover:bg-emerald-50',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200&q=80',
      alt: 'Fresh organic vegetables, fruits and greens'
    },
    {
      id: 'slide-dairy-breakfast',
      tag: 'DAILY ESSENTIALS · SUPERFAST',
      title: 'Fresh Milk, Breads & Farm Eggs',
      subtitle: 'Pure dairy pouches, artisan whole-wheat breads, farm fresh eggs & butter at morning speed',
      buttonText: 'Shop Breakfast',
      link: '/category/dairy-bread-eggs',
      bgGradient: 'from-[#002b80] via-[#0055ff] to-[#38bdf8]',
      buttonClass: 'bg-white text-[#0055ff] hover:bg-blue-50',
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=1200&q=80',
      alt: 'Fresh dairy, breads and breakfast essentials'
    },
    {
      id: 'slide-summer-coolers',
      tag: 'ICY COLD · INSTANT REFRESH',
      title: 'Chilled Drinks, Ice Creams & Juices',
      subtitle: 'Beat the heat with iced sodas, cold-pressed fruit juices, coconut water & gourmet ice creams',
      buttonText: 'Explore Coolers',
      link: '/category/cold-drinks-juices',
      bgGradient: 'from-[#9a3412] via-[#ea580c] to-[#f97316]',
      buttonClass: 'bg-white text-[#ea580c] hover:bg-orange-50',
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=1200&q=80',
      alt: 'Chilled tropical juices and cold drinks'
    },
    {
      id: 'slide-snacks-munchies',
      tag: 'MIDNIGHT CRAVINGS · 10 MINS',
      title: 'Snacks, Munchies & Chocolates',
      subtitle: 'Crunchy Indore namkeen, imported chocolate bars, potato chips & cookies for instant cravings',
      buttonText: 'Grab Snacks',
      link: '/category/snacks-munchies',
      bgGradient: 'from-[#3b0764] via-[#7c3aed] to-[#a855f7]',
      buttonClass: 'bg-white text-[#7c3aed] hover:bg-purple-50',
      image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1200&q=80',
      alt: 'Assorted chips, cookies and chocolates'
    }
  ];

  // Auto-play timer: slides advance every 4.5 seconds, pauses on mouse hover
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
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group select-none"
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
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`w-full flex-shrink-0 relative overflow-hidden flex items-center h-[190px] sm:h-[220px] md:h-[250px] lg:h-[270px] bg-gradient-to-r ${slide.bgGradient}`}
          >
            {/* Ambient Lighting Accents */}
            <div className="absolute -top-12 -right-12 w-72 h-72 bg-white/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 left-1/3 w-64 h-64 bg-black/10 rounded-full blur-xl pointer-events-none" />

            {/* Right Image: Edge-to-edge full bleed, smoothly blended into background */}
            <div className="absolute right-0 top-0 bottom-0 w-3/5 sm:w-1/2 lg:w-7/12 pointer-events-none flex items-center justify-end overflow-hidden">
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover object-center sm:object-right transition-transform duration-700 ease-out group-hover:scale-105"
                style={{
                  maskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 25%, black 100%)'
                }}
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
              {/* Mobile contrast overlay */}
              <div className="sm:hidden absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent" />
            </div>

            {/* Left Content Area */}
            <div className="relative z-10 w-full sm:w-3/5 lg:w-1/2 p-5 sm:p-7 md:p-10 space-y-2 sm:space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                <Sparkles className="w-3 h-3 text-white" />
                <span>{slide.tag}</span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[34px] font-black text-white tracking-tight leading-[1.15] drop-shadow-xs">
                {slide.title}
              </h2>

              <p className="text-xs sm:text-sm md:text-base text-white/90 font-medium leading-relaxed max-w-md line-clamp-2 sm:line-clamp-none">
                {slide.subtitle}
              </p>

              <div className="pt-1 sm:pt-2">
                <Link
                  to={slide.link}
                  className={`inline-flex items-center gap-2 px-6 sm:px-7 py-2 sm:py-2.5 rounded-full font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 ${slide.buttonClass}`}
                >
                  <span>{slide.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
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
