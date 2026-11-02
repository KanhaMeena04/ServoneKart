import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Layers } from 'lucide-react';
import { groceryService } from '../services/api';

const CategoriesOverviewPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackPalettes = [
    { img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&q=80', bg: 'bg-emerald-50' },
    { img: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=300&q=80', bg: 'bg-blue-50' },
    { img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&q=80', bg: 'bg-amber-50' },
    { img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&q=80', bg: 'bg-red-50' },
    { img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80', bg: 'bg-orange-50' },
    { img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80', bg: 'bg-yellow-50' },
    { img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=300&q=80', bg: 'bg-pink-50' },
    { img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&q=80', bg: 'bg-purple-50' },
    { img: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&q=80', bg: 'bg-teal-50' },
    { img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&q=80', bg: 'bg-amber-50' },
    { img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&q=80', bg: 'bg-cyan-50' },
    { img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80', bg: 'bg-emerald-50' },
  ];

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoading(true);
        const res = await groceryService.getCategories();
        if (res.data?.data && res.data.data.length > 0) {
          setCategories(res.data.data);
        }
      } catch (e) {
        console.warn('Categories overview error:', e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  const displayList = categories.length > 0 
    ? categories.map((c, i) => ({
        name: c.name,
        slug: c.slug || c._id,
        img: c.image || fallbackPalettes[i % fallbackPalettes.length].img,
        bg: fallbackPalettes[i % fallbackPalettes.length].bg,
        count: 'Fresh Stock',
      }))
    : fallbackPalettes.map((p, i) => ({
        name: `Category ${i + 1}`,
        slug: `category-${i + 1}`,
        img: p.img,
        bg: p.bg,
        count: '10-15 min delivery',
      }));

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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8">
        {displayList.map((cat) => (
          <Link
            key={cat.slug}
            to={`/category/${cat.slug}`}
            className="group flex flex-col items-center text-center cursor-pointer"
          >
            {/* Full Goal Circle with Thin Brand Theme Blue Border */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[2px] border border-[#0055ff]/35 group-hover:border-[#0055ff] bg-white shadow-xs group-hover:shadow-md group-hover:ring-2 group-hover:ring-blue-100/60 transition-all duration-300 flex items-center justify-center">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Name Below Circle */}
            <div className="mt-2.5">
              <h3 className="text-xs sm:text-[13px] font-extrabold text-gray-900 group-hover:text-[#0055ff] transition leading-snug line-clamp-2 max-w-[120px]">
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
