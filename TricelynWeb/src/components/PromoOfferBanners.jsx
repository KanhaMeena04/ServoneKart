import React from 'react';
import { Link } from 'react-router-dom';
import offerPharmacy from '../assets/offer_pharmacy.png';
import offerPetcare from '../assets/offer_petcare.png';
import offerBabycare from '../assets/offer_babycare.png';

const PromoOfferBanners = () => {
  const cards = [
    {
      id: 'pharmacy',
      title: 'Pharmacy at your doorstep!',
      subtitle: 'Cough syrups, pain relief sprays & more',
      image: offerPharmacy,
      link: '/category/household-cleaning',
      alt: 'Pharmacy at your doorstep! Cough syrups, pain relief sprays & more - Order Now'
    },
    {
      id: 'pet-care',
      title: 'Pet care supplies at your door',
      subtitle: 'Food, treats, toys & more',
      image: offerPetcare,
      link: '/category/pet-care',
      alt: 'Pet care supplies at your door - Food, treats, toys & more - Order Now'
    },
    {
      id: 'baby-care',
      title: 'No time for a diaper run?',
      subtitle: 'Get baby care essentials',
      image: offerBabycare,
      link: '/category/baby-care',
      alt: 'No time for a diaper run? Get baby care essentials - Order Now'
    }
  ];

  return (
    <section className="w-full">
      {/* 
        3 Promotional Offer Banners matching user reference screenshot:
        - Mobile (< 768px): Smooth swipeable horizontal snap carousel
        - Desktop (>= 768px): 3 Equal side-by-side columns
      */}
      <div className="flex overflow-x-auto pb-2 scrollbar-none snap-x md:grid md:grid-cols-3 gap-3.5 sm:gap-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {cards.map((card) => (
          <Link
            key={card.id}
            to={card.link}
            className="w-[82vw] sm:w-[70vw] md:w-auto flex-shrink-0 snap-start block rounded-2xl md:rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
          >
            <img
              src={card.image}
              alt={card.alt}
              className="w-full h-auto object-cover rounded-2xl md:rounded-3xl group-hover:scale-[1.02] transition-transform duration-300"
              loading="lazy"
            />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PromoOfferBanners;
