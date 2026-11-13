import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Layers, Search, Sparkles } from 'lucide-react';
import { groceryService } from '../services/api';

const CategoriesOverviewPage = () => {
  const [categories, setCategories] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
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

  const rawList = categories.length > 0 
    ? categories.map((c, i) => ({
        name: c.name,
        slug: c.slug || c._id,
        img: c.image || fallbackPalettes[i % fallbackPalettes.length].img,
        bg: fallbackPalettes[i % fallbackPalettes.length].bg,
        count: '10-15 Min Delivery',
      }))
    : fallbackPalettes.map((p, i) => ({
        name: `Category ${i + 1}`,
        slug: `category-${i + 1}`,
        img: p.img,
        bg: p.bg,
        count: '10-15 Min Delivery',
      }));

  const filteredList = rawList.filter(c => 
    c.name.toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-20">
      
      {/* Header with Search and Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B3EDB] hover:text-blue-700 transition mb-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              All Grocery Categories
            </h1>
            <span className="text-[11px] font-black text-[#0B3EDB] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              {filteredList.length} Categories
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Fresh groceries, dairy & daily staples delivered in 10-15 minutes from nearest partner dark stores.
          </p>
        </div>

        {/* Quick Filter Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter categories..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0B3EDB] shadow-xs"
          />
        </div>
      </div>

      {/* Grid: 3-4 columns on mobile, 4-6 on tablet/desktop with tight, attractive spacing */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-5">
        {filteredList.map((cat) => (
          <Link
            key={cat.slug}
            to={`/category/${cat.slug}`}
            className="group flex flex-col items-center text-center p-2.5 rounded-2xl bg-white hover:bg-blue-50/40 border border-gray-100 hover:border-[#0B3EDB]/40 shadow-xs hover:shadow-md transition-all duration-200"
          >
            {/* Full Goal Circle with Double Ring Accent */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full p-[2px] border border-[#0B3EDB]/35 group-hover:border-[#0B3EDB] bg-white shadow-2xs group-hover:shadow-md group-hover:ring-3 group-hover:ring-blue-100/70 transition-all duration-300 flex items-center justify-center">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Name Below Circle */}
            <div className="mt-2 w-full">
              <h3 className="text-xs sm:text-[13px] font-extrabold text-gray-800 group-hover:text-[#0B3EDB] transition leading-snug line-clamp-2 px-1">
                {cat.name}
              </h3>
              <span className="inline-block text-[9px] sm:text-[10px] text-emerald-600 font-bold mt-0.5">
                ⚡ 10-15m
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesOverviewPage;
