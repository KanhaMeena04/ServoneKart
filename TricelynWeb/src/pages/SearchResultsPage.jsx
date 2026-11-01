import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { groceryService } from '../services/api';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearch = async () => {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await groceryService.getProducts({ search: query.trim() });
        if (res.data?.data) {
          setProducts(res.data.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearch();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-xl font-black text-gray-900">
            Search Results for <span className="text-brand-600">"{query}"</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Found {products.length} matching grocery items</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-gray-400 font-bold">
          Searching Indore fresh inventory...
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {products.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-gray-100 p-8 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-brand-600 mx-auto flex items-center justify-center font-bold text-xl">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-gray-800">No items found for "{query}"</h3>
          <p className="text-xs text-gray-500">
            Try searching with simpler terms like milk, bread, potato, rice, or chips.
          </p>
          <Link
            to="/categories"
            className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition"
          >
            Explore All Categories
          </Link>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
