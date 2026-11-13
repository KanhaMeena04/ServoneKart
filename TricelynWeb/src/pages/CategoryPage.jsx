import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  SlidersHorizontal, 
  Layers, 
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { groceryService } from '../services/api';
import { CATEGORIES, ALL_CATALOG_PRODUCTS } from '../data/groceryCatalog';

const CategoryPage = () => {
  const { slug } = useParams();
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'low-high' | 'high-low' | 'discount'

  // Default quick categories list matching Zepto sidebar layout
  const defaultCategoriesList = [
    { name: 'All Categories', slug: 'all', icon: '✨' },
    ...CATEGORIES.map(c => ({
      name: c.name,
      slug: c.slug,
      icon: c.icon || '🛒',
      image: c.image
    }))
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setActiveSubcategory('all');

        const [treeRes, catsRes, prodsRes] = await Promise.allSettled([
          groceryService.getCategoryTree(),
          groceryService.getCategories(),
          groceryService.getProducts({ category: slug !== 'all' ? slug : undefined }),
        ]);

        let loadedTree = [];
        if (treeRes.status === 'fulfilled' && (treeRes.value.data?.categories || treeRes.value.data?.data)) {
          loadedTree = treeRes.value.data.categories || treeRes.value.data.data;
          setCategoryTree(loadedTree);
        }

        let loadedCats = defaultCategoriesList;
        if (catsRes.status === 'fulfilled' && catsRes.value.data?.data && catsRes.value.data.data.length > 0) {
          const apiCats = catsRes.value.data.data.map((c) => ({
            _id: c._id,
            name: c.name,
            slug: c.slug || c._id,
            icon: c.icon || '🛒',
            image: c.image
          }));
          loadedCats = [{ name: 'All Categories', slug: 'all', icon: '✨' }, ...apiCats];
        }
        setCategories(loadedCats);

        const current = loadedCats.find((c) => c.slug === slug || c._id === slug) || loadedCats[0];
        setSelectedCategory(current);

        // Find nested subcategories from category tree
        if (loadedTree.length > 0 && current.slug !== 'all') {
          const matchedTreeNode = loadedTree.find(t => 
            t.slug === current.slug || 
            t._id === current._id || 
            t.name.toLowerCase() === current.name.toLowerCase()
          );
          if (matchedTreeNode && matchedTreeNode.subcategories && matchedTreeNode.subcategories.length > 0) {
            setSubcategories(matchedTreeNode.subcategories);
          } else {
            setSubcategories([]);
          }
        } else {
          setSubcategories([]);
        }

        if (prodsRes.status === 'fulfilled' && prodsRes.value.data?.data && prodsRes.value.data.data.length > 0) {
          setProducts(prodsRes.value.data.data);
        } else {
          const fallbackProds = slug && slug !== 'all' 
            ? ALL_CATALOG_PRODUCTS.filter(p => p.categorySlug === slug || p.category?.slug === slug)
            : ALL_CATALOG_PRODUCTS;
          setProducts(fallbackProds.length > 0 ? fallbackProds : ALL_CATALOG_PRODUCTS.slice(0, 12));
        }
      } catch (err) {
        console.error('Error fetching category page:', err);
        const fallbackProds = slug && slug !== 'all' 
          ? ALL_CATALOG_PRODUCTS.filter(p => p.categorySlug === slug || p.category?.slug === slug)
          : ALL_CATALOG_PRODUCTS;
        setProducts(fallbackProds.length > 0 ? fallbackProds : ALL_CATALOG_PRODUCTS.slice(0, 12));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Subcategory Filtering logic
  const filteredProducts = activeSubcategory === 'all'
    ? products
    : products.filter(p => {
        const subId = (p.subCategory?._id || p.subCategory || p.subCategoryId || '').toString();
        const subName = (p.subCategory?.name || p.subCategoryName || '').toString().toLowerCase();
        const pTags = Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase() : '';
        const pDesc = (p.description || '').toLowerCase();
        const pName = (p.name || '').toLowerCase();
        const target = activeSubcategory.toLowerCase();

        return subId === activeSubcategory ||
               subName.includes(target) ||
               pTags.includes(target) ||
               pDesc.includes(target) ||
               pName.includes(target);
      });

  // Sort logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = Number(a.price) || 0;
    const priceB = Number(b.price) || 0;
    if (sortBy === 'low-high') return priceA - priceB;
    if (sortBy === 'high-low') return priceB - priceA;
    if (sortBy === 'discount') {
      const discA = a.mrp ? a.mrp - priceA : 0;
      const discB = b.mrp ? b.mrp - priceB : 0;
      return discB - discA;
    }
    return 0; // default popular
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24 sm:pb-8">
      
      {/* Breadcrumbs (Matches Zepto User Image 3) */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium overflow-x-auto no-scrollbar py-0.5">
        <Link to="/" className="hover:text-brand-600 flex-shrink-0">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <Link to="/categories" className="hover:text-brand-600 flex-shrink-0">Categories</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <span className="font-bold text-gray-900 truncate max-w-[140px]">{selectedCategory?.name || 'All'}</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <span className="text-brand-600 font-bold flex-shrink-0">Top Picks</span>
      </nav>

      {/* Mobile Horizontal Category Pills (Quick-Commerce Style for Phones) */}
      <div className="md:hidden flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4">
        {categories.map((cat) => {
          const isActive = (slug === cat.slug) || (!slug && cat.slug === 'all');
          return (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                isActive
                  ? 'bg-[#0B3EDB] text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <span>{cat.icon || '📦'}</span>
              <span>{cat.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Layout (Zepto Style Left Sidebar for Desktop, Full Width for Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Vertical Categories Sidebar (Desktop only - Sticky) */}
        <aside className="hidden md:block md:col-span-3 bg-white rounded-2xl border border-gray-100 p-3 shadow-xs sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
          <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-600" />
              <span>Categories</span>
            </h3>
            <span className="text-[10px] text-gray-400 font-bold">{categories.length}</span>
          </div>

          <div className="space-y-1">
            {categories.map((cat) => {
              const isActive = (slug === cat.slug) || (!slug && cat.slug === 'all');
              return (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-bold border-l-4 border-brand-600 shadow-xs'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="text-base">{cat.icon || '📦'}</span>
                  <span className="truncate">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="md:col-span-9 space-y-5">
          
          {/* Category Header & Top Banner Cards (Matches Image 3) */}
          <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent p-5 rounded-3xl border border-blue-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-600">
                10-15 Minute Delivery in Indore
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
                {selectedCategory?.name || 'All Groceries'}
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Showing {sortedProducts.length} items available in your delivery zone
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-brand-500 shadow-xs cursor-pointer"
              >
                <option value="popular">Sort: Top Picks / Popular</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>
          </div>

          {/* Subcategories Filter Pills (Blinkit / Zepto Quick-Commerce Experience) */}
          {subcategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                type="button"
                onClick={() => setActiveSubcategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                  activeSubcategory === 'all'
                    ? 'bg-[#0B3EDB] text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                }`}
              >
                All ({products.length})
              </button>
              {subcategories.map((sub) => {
                const subKey = sub.slug || sub._id || sub.name;
                const isSelected = activeSubcategory === subKey || activeSubcategory === sub.name || activeSubcategory === sub._id;
                return (
                  <button
                    key={subKey}
                    type="button"
                    onClick={() => setActiveSubcategory(subKey)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                      isSelected
                        ? 'bg-[#0B3EDB] text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {sortedProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}

            {sortedProducts.length === 0 && !loading && (
              <div className="col-span-full py-16 text-center space-y-3 bg-white rounded-3xl border border-gray-100 p-8">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-brand-600 mx-auto flex items-center justify-center font-bold text-xl">
                  🥦
                </div>
                <h3 className="text-sm font-bold text-gray-800">No products found in this category yet</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  New inventory arrives daily at our Indore fulfillment dark stores. Check other categories!
                </p>
                <Link
                  to="/categories"
                  className="inline-block px-5 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition"
                >
                  Browse All Categories
                </Link>
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  );
};

export default CategoryPage;

