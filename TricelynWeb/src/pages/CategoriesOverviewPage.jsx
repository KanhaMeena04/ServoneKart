import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Layers } from 'lucide-react';
import { groceryService } from '../services/api';

const CategoriesOverviewPage = () => {
  const [categories, setCategories] = useState([]);

  const defaultCategoriesList = [
    { name: 'Fruits & Vegetables', slug: 'vegetables-fruits', img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&q=80', count: '120+ items', bg: 'bg-emerald-50' },
    { name: 'Dairy, Bread & Eggs', slug: 'dairy-breakfast', img: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=300&q=80', count: '85+ items', bg: 'bg-blue-50' },
    { name: 'Munchies & Snacks', slug: 'munchies-snacks', img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&q=80', count: '200+ items', bg: 'bg-amber-50' },
    { name: 'Cold Drinks & Juices', slug: 'drinks-juices', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&q=80', count: '75+ items', bg: 'bg-red-50' },
    { name: 'Atta, Rice & Dal', slug: 'atta-rice-dal', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80', count: '150+ items', bg: 'bg-orange-50' },
    { name: 'Instant & Frozen Food', slug: 'instant-food', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80', count: '90+ items', bg: 'bg-yellow-50' },
    { name: 'Chocolates & Sweets', slug: 'sweets-chocolates', img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=300&q=80', count: '110+ items', bg: 'bg-pink-50' },
    { name: 'Personal Care & Hygiene', slug: 'personal-care', img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&q=80', count: '160+ items', bg: 'bg-purple-50' },
    { name: 'Cleaning & Household', slug: 'cleaning-household', img: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&q=80', count: '95+ items', bg: 'bg-teal-50' },
    { name: 'Pet Care Supplies', slug: 'pet-care', img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&q=80', count: '60+ items', bg: 'bg-amber-50' },
    { name: 'Baby Care Essentials', slug: 'baby-care', img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&q=80', count: '50+ items', bg: 'bg-cyan-50' },
    { name: 'Pharmacy & Wellness', slug: 'pharmacy', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80', count: '140+ items', bg: 'bg-emerald-50' },
  ];

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await groceryService.getCategories();
        if (res.data?.data && res.data.data.length > 0) {
          // merge
        }
      } catch (e) {}
    };
    fetchCats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <h1 className="text-2xl font-black text-gray-900">Explore All Grocery Categories</h1>
        <p className="text-xs text-gray-500 mt-1">Delivered to your home in 10-15 minutes across Indore</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {defaultCategoriesList.map((cat) => (
          <Link
            key={cat.slug}
            to={`/category/${cat.slug}`}
            className="group bg-white rounded-3xl border border-gray-100 hover:border-brand-300 hover:shadow-md transition p-4 flex flex-col items-center text-center space-y-3"
          >
            <div className={`w-20 h-20 rounded-2xl ${cat.bg} flex items-center justify-center p-2 group-hover:scale-105 transition-transform`}>
              <img
                src={cat.img}
                alt={cat.name}
                className="max-h-full max-w-full object-contain rounded-xl"
              />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-gray-900 group-hover:text-brand-600 transition leading-snug">
                {cat.name}
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{cat.count}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesOverviewPage;
