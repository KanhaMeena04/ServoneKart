// import React, { useMemo, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { ArrowLeft, Search } from 'lucide-react';
// import { categories } from '../data/categories';

// const CategoriesOverviewPage = () => {
//   const [searchFilter, setSearchFilter] = useState('');

//   const filteredCategories = useMemo(() => {
//     const query = searchFilter.trim().toLowerCase();
//     if (!query) return categories;

//     return categories.reduce((matches, category) => {
//       if (category.name.toLowerCase().includes(query)) {
//         matches.push(category);
//         return matches;
//       }

//       const matchingSubcategories = category.subcategories.filter((subcategory) =>
//         subcategory.toLowerCase().includes(query)
//       );
//       if (matchingSubcategories.length > 0) {
//         matches.push({ ...category, subcategories: matchingSubcategories });
//       }
//       return matches;
//     }, []);
//   }, [searchFilter]);

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
//       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
//         <div>
//           <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B3EDB] hover:text-blue-700 transition mb-2">
//             <ArrowLeft className="w-3.5 h-3.5" />
//             <span>Back to Home</span>
//           </Link>
//           <div className="flex items-center gap-2.5">
//             <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
//               Categories
//             </h1>
//             <span className="text-xs font-bold text-[#0B3EDB] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
//               {filteredCategories.length}
//             </span>
//           </div>
//           <p className="text-xs text-gray-500 mt-1">
//             Explore groceries, personal care, home essentials and more.
//           </p>
//         </div>

//         <div className="relative w-full md:w-72">
//           <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
//           <input
//             type="text"
//             value={searchFilter}
//             onChange={(event) => setSearchFilter(event.target.value)}
//             placeholder="Search categories..."
//             aria-label="Search categories"
//             className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0B3EDB] shadow-xs"
//           />
//         </div>
//       </div>

//       {filteredCategories.length > 0 ? (
//         <div className="space-y-7 sm:space-y-8">
//           {filteredCategories.map((category, index) => (
//             <section key={category.name} aria-labelledby={`category-heading-${index}`}>
//               <h2
//                 id={`category-heading-${index}`}
//                 className="text-base sm:text-lg font-bold text-gray-900 mb-3"
//               >
//                 {category.name}
//               </h2>
//               {category.subcategories.length > 0 && (
//                 <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
//                   {category.subcategories.map((subcategory) => (
//                     <li key={subcategory} className="text-sm sm:text-base text-gray-500">
//                       {subcategory}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </section>
//           ))}
//         </div>
//       ) : (
//         <p className="py-10 text-center text-sm text-gray-500">
//           No categories found. Try a different search.
//         </p>
//       )}
//     </div>
//   );
// };

// export default CategoriesOverviewPage;


// import React, { useMemo, useState } from 'react';
// import { Link, useSearchParams } from 'react-router-dom';
// import {
//   ArrowLeft,
//   Search,
//   SlidersHorizontal,
//   ShoppingBag,
//   ChevronRight,
//   PackageSearch,
//   X,
//   LayoutGrid,
// } from 'lucide-react';

// import {
//   CATEGORIES,
//   ALL_CATALOG_PRODUCTS,
//   normalizeProduct,
// } from '../data/groceryCatalog';

// import ProductCard from '../components/ProductCard';

// // --------------------------------------------------
// // HELPERS
// // --------------------------------------------------

// const slugify = (value = '') =>
//   String(value)
//     .toLowerCase()
//     .trim()
//     .replace(/&/g, 'and')
//     .replace(/[^a-z0-9]+/g, '-')
//     .replace(/^-|-$/g, '');

// const getProductSubcategory = (product) => {
//   const value =
//     product.subcategory ||
//     product.subCategory ||
//     product.subcategoryName ||
//     product.subCategoryName ||
//     product.subcategorySlug ||
//     '';

//   if (typeof value === 'object' && value !== null) {
//     return value.name || value.slug || '';
//   }

//   return String(value);
// };

// // --------------------------------------------------
// // MASTER CATEGORY DATA
// // --------------------------------------------------

// const categories = [...CATEGORIES].sort(
//   (a, b) => (a.position || 0) - (b.position || 0)
// );

// const validCategorySlugs = new Set(
//   categories.map((category) => category.slug)
// );

// // Normalize only products belonging to the actual
// // categories defined in groceryCatalog.
// const catalogProducts = ALL_CATALOG_PRODUCTS
//   .map((product) => normalizeProduct(product))
//   .filter((product) => {
//     if (!product) return false;

//     const categorySlug =
//       product.categorySlug ||
//       product.category?.slug ||
//       '';

//     return validCategorySlugs.has(categorySlug);
//   });

// // --------------------------------------------------
// // MAIN COMPONENT
// // --------------------------------------------------

// const CategoriesOverviewPage = () => {
//   const [searchParams, setSearchParams] = useSearchParams();

//   const [searchFilter, setSearchFilter] = useState('');
//   const [sortBy, setSortBy] = useState('featured');

//   const selectedCategoryParam = searchParams.get('category') || '';
//   const selectedSubcategoryParam =
//     searchParams.get('subcategory') || '';

//   // Find selected category by slug, name or short name.
//   const selectedCategory = useMemo(() => {
//     if (!selectedCategoryParam) return null;

//     const value = selectedCategoryParam.toLowerCase();

//     return (
//       categories.find(
//         (category) =>
//           category.slug?.toLowerCase() === value ||
//           category.name?.toLowerCase() === value ||
//           category.shortName?.toLowerCase() === value ||
//           slugify(category.name) === value
//       ) || null
//     );
//   }, [selectedCategoryParam]);

//   // Products belonging to selected category only.
//   const categoryProducts = useMemo(() => {
//     if (!selectedCategory) return [];

//     return catalogProducts.filter((product) => {
//       const productCategorySlug =
//         product.categorySlug ||
//         product.category?.slug ||
//         '';

//       return productCategorySlug === selectedCategory.slug;
//     });
//   }, [selectedCategory]);

//   // Build subcategory options only from actual
//   // subcategory data available on products.
//   const subcategories = useMemo(() => {
//     const values = categoryProducts
//       .map((product) => getProductSubcategory(product))
//       .filter(Boolean);

//     return [...new Set(values)].sort((a, b) =>
//       a.localeCompare(b)
//     );
//   }, [categoryProducts]);

//   // Filter category products by search and subcategory.
//   const filteredProducts = useMemo(() => {
//     let result = [...categoryProducts];

//     if (selectedSubcategoryParam) {
//       result = result.filter((product) => {
//         const productSubcategory = getProductSubcategory(product);

//         return (
//           slugify(productSubcategory) ===
//           slugify(selectedSubcategoryParam)
//         );
//       });
//     }

//     if (searchFilter.trim()) {
//       const search = searchFilter.toLowerCase().trim();

//       result = result.filter((product) => {
//         const name = product.name?.toLowerCase() || '';
//         const description =
//           product.description?.toLowerCase() || '';
//         const categoryName =
//           product.categoryName?.toLowerCase() || '';

//         return (
//           name.includes(search) ||
//           description.includes(search) ||
//           categoryName.includes(search)
//         );
//       });
//     }

//     switch (sortBy) {
//       case 'price-low':
//         result.sort(
//           (a, b) => Number(a.price || 0) - Number(b.price || 0)
//         );
//         break;

//       case 'price-high':
//         result.sort(
//           (a, b) => Number(b.price || 0) - Number(a.price || 0)
//         );
//         break;

//       case 'name':
//         result.sort((a, b) =>
//           (a.name || '').localeCompare(b.name || '')
//         );
//         break;

//       case 'rating':
//         result.sort(
//           (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
//         );
//         break;

//       default:
//         break;
//     }

//     return result;
//   }, [
//     categoryProducts,
//     selectedSubcategoryParam,
//     searchFilter,
//     sortBy,
//   ]);

//   // Product counts for category cards.
//   const getCategoryProductCount = (categorySlug) =>
//     catalogProducts.filter(
//       (product) => product.categorySlug === categorySlug
//     ).length;

//   // Change selected category.
//   const handleCategorySelect = (category) => {
//     setSearchFilter('');
//     setSortBy('featured');

//     setSearchParams({
//       category: category.slug,
//     });
//   };

//   // Change selected subcategory.
//   const handleSubcategorySelect = (subcategory) => {
//     const params = {
//       category: selectedCategory.slug,
//     };

//     if (subcategory) {
//       params.subcategory = slugify(subcategory);
//     }

//     setSearchParams(params);
//   };

//   // Clear all category filters.
//   const handleShowAllCategories = () => {
//     setSearchFilter('');
//     setSortBy('featured');
//     setSearchParams({});
//   };

//   // --------------------------------------------------
//   // CATEGORY OVERVIEW
//   // --------------------------------------------------

//   if (!selectedCategory) {
//     const filteredCategories = categories.filter((category) => {
//       const search = searchFilter.toLowerCase().trim();

//       if (!search) return true;

//       return (
//         category.name?.toLowerCase().includes(search) ||
//         category.shortName?.toLowerCase().includes(search) ||
//         category.description?.toLowerCase().includes(search)
//       );
//     });

//     return (
//       <div className="min-h-screen bg-[#f7f9fc]">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10">

//           {/* Breadcrumb */}
//           <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
//             <Link
//               to="/"
//               className="hover:text-[#0B3EDB] transition-colors"
//             >
//               Home
//             </Link>

//             <ChevronRight size={15} />

//             <span className="text-[#0B3EDB] font-semibold">
//               All Categories
//             </span>
//           </div>

//           {/* Page Heading */}
//           <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
//             <div>
//               <span className="inline-flex items-center gap-2 bg-blue-50 text-[#0B3EDB] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-3">
//                 <LayoutGrid size={14} />
//                 Explore Our Store
//               </span>

//               <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#07162E]">
//                 Shop by Categories
//               </h1>

//               <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-2xl">
//                 Explore our complete collection of groceries,
//                 fresh produce and everyday essentials.
//               </p>
//             </div>

//             <div className="text-sm text-gray-500 font-medium">
//               {categories.length} Categories
//             </div>
//           </div>

//           {/* Search */}
//           <div className="relative max-w-xl mb-8">
//             <Search
//               size={19}
//               className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
//             />

//             <input
//               type="text"
//               value={searchFilter}
//               onChange={(e) => setSearchFilter(e.target.value)}
//               placeholder="Search categories..."
//               className="w-full h-12 pl-12 pr-12 rounded-xl bg-white border border-gray-200 outline-none focus:border-[#0B3EDB] focus:ring-4 focus:ring-blue-50 text-sm transition-all"
//             />

//             {searchFilter && (
//               <button
//                 onClick={() => setSearchFilter('')}
//                 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
//                 aria-label="Clear search"
//               >
//                 <X size={18} />
//               </button>
//             )}
//           </div>

//           {/* Category Grid */}
//           {filteredCategories.length > 0 ? (
//             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
//               {filteredCategories.map((category) => {
//                 const productCount = getCategoryProductCount(
//                   category.slug
//                 );

//                 return (
//                   <button
//                     key={category.id || category.slug}
//                     type="button"
//                     onClick={() => handleCategorySelect(category)}
//                     className="group text-left bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-[#0B3EDB]/40 transition-all duration-300 hover:-translate-y-1"
//                   >
//                     {/* Image */}
//                     <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
//                       {category.image ? (
//                         <img
//                           src={category.image}
//                           alt={category.name}
//                           loading="lazy"
//                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                         />
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center text-5xl">
//                           {category.icon || '🛒'}
//                         </div>
//                       )}

//                       <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/95 shadow-sm flex items-center justify-center text-lg">
//                         {category.icon || '🛒'}
//                       </div>
//                     </div>

//                     {/* Content */}
//                     <div className="p-3 sm:p-4">
//                       <h2 className="font-bold text-sm sm:text-base text-[#07162E] group-hover:text-[#0B3EDB] transition-colors line-clamp-2 min-h-10">
//                         {category.name}
//                       </h2>

//                       <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 min-h-8">
//                         {category.description}
//                       </p>

//                       <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-100">
//                         <span className="text-xs font-semibold text-gray-500">
//                           {productCount} Products
//                         </span>

//                         <span className="w-7 h-7 rounded-full bg-blue-50 text-[#0B3EDB] flex items-center justify-center group-hover:bg-[#0B3EDB] group-hover:text-white transition-all">
//                           <ChevronRight size={16} />
//                         </span>
//                       </div>
//                     </div>
//                   </button>
//                 );
//               })}
//             </div>
//           ) : (
//             <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
//               <PackageSearch
//                 size={42}
//                 className="mx-auto text-gray-300 mb-3"
//               />

//               <h3 className="font-bold text-lg text-[#07162E]">
//                 No categories found
//               </h3>

//               <p className="text-sm text-gray-500 mt-1">
//                 Try searching with a different category name.
//               </p>

//               <button
//                 onClick={() => setSearchFilter('')}
//                 className="mt-4 text-sm font-bold text-[#0B3EDB]"
//               >
//                 Clear Search
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }

//   // --------------------------------------------------
//   // SELECTED CATEGORY PAGE
//   // --------------------------------------------------

//   return (
//     <div className="min-h-screen bg-[#f7f9fc]">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

//         {/* Breadcrumb */}
//         <div className="flex items-center flex-wrap gap-2 text-sm text-gray-500 mb-5">
//           <Link
//             to="/"
//             className="hover:text-[#0B3EDB] transition-colors"
//           >
//             Home
//           </Link>

//           <ChevronRight size={15} />

//           <button
//             onClick={handleShowAllCategories}
//             className="hover:text-[#0B3EDB] transition-colors"
//           >
//             Categories
//           </button>

//           <ChevronRight size={15} />

//           <span className="font-semibold text-[#0B3EDB]">
//             {selectedCategory.name}
//           </span>
//         </div>

//         {/* Back Button */}
//         <button
//           onClick={handleShowAllCategories}
//           className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#0B3EDB] mb-5 transition-colors"
//         >
//           <ArrowLeft size={17} />
//           All Categories
//         </button>

//         {/* Category Header */}
//         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-7">
//           <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] items-center">
//             <div className="p-5 sm:p-8">
//               <div className="flex items-center gap-3 mb-3">
//                 <span className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">
//                   {selectedCategory.icon || '🛒'}
//                 </span>

//                 <span className="text-xs font-bold text-[#0B3EDB] uppercase tracking-wider">
//                   Explore Category
//                 </span>
//               </div>

//               <h1 className="text-2xl sm:text-3xl font-extrabold text-[#07162E]">
//                 {selectedCategory.name}
//               </h1>

//               <p className="text-sm text-gray-500 mt-2 max-w-xl">
//                 {selectedCategory.description}
//               </p>

//               <div className="flex items-center gap-2 mt-5 text-sm font-semibold text-gray-600">
//                 <ShoppingBag size={17} className="text-[#0B3EDB]" />

//                 {categoryProducts.length} Products Available
//               </div>
//             </div>

//             {selectedCategory.image && (
//               <div className="hidden md:block h-full min-h-[210px] overflow-hidden">
//                 <img
//                   src={selectedCategory.image}
//                   alt={selectedCategory.name}
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">

//           {/* Sidebar */}
//           <aside className="bg-white rounded-2xl border border-gray-100 p-4 h-fit">
//             <h2 className="font-extrabold text-[#07162E] text-base mb-4">
//               All Categories
//             </h2>

//             <div className="space-y-1.5">
//               {categories.map((category) => {
//                 const active =
//                   category.slug === selectedCategory.slug;

//                 return (
//                   <button
//                     key={category.id || category.slug}
//                     onClick={() => handleCategorySelect(category)}
//                     className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
//                       active
//                         ? 'bg-blue-50 text-[#0B3EDB] font-bold'
//                         : 'text-gray-600 hover:bg-gray-50 hover:text-[#0B3EDB]'
//                     }`}
//                   >
//                     <span className="text-lg">
//                       {category.icon || '🛒'}
//                     </span>

//                     <span className="flex-1 text-xs sm:text-sm">
//                       {category.name}
//                     </span>

//                     {active && (
//                       <ChevronRight size={16} />
//                     )}
//                   </button>
//                 );
//               })}
//             </div>
//           </aside>

//           {/* Products Section */}
//           <main className="min-w-0">

//             {/* Search and Sort */}
//             <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 mb-5">
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <div className="relative flex-1">
//                   <Search
//                     size={18}
//                     className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
//                   />

//                   <input
//                     type="text"
//                     value={searchFilter}
//                     onChange={(e) => setSearchFilter(e.target.value)}
//                     placeholder={`Search in ${selectedCategory.name}...`}
//                     className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 outline-none focus:border-[#0B3EDB] focus:ring-4 focus:ring-blue-50 text-sm"
//                   />

//                   {searchFilter && (
//                     <button
//                       onClick={() => setSearchFilter('')}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
//                       aria-label="Clear search"
//                     >
//                       <X size={16} />
//                     </button>
//                   )}
//                 </div>

//                 <div className="relative sm:w-52">
//                   <SlidersHorizontal
//                     size={16}
//                     className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//                   />

//                   <select
//                     value={sortBy}
//                     onChange={(e) => setSortBy(e.target.value)}
//                     className="w-full h-11 pl-9 pr-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-[#0B3EDB] text-sm font-medium text-gray-700 appearance-none cursor-pointer"
//                   >
//                     <option value="featured">Featured</option>
//                     <option value="price-low">Price: Low to High</option>
//                     <option value="price-high">Price: High to Low</option>
//                     <option value="name">Name: A to Z</option>
//                     <option value="rating">Top Rated</option>
//                   </select>
//                 </div>
//               </div>

//               {/* Subcategories: shown only when the
//                   catalog actually contains assignments. */}
//               {subcategories.length > 0 && (
//                 <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
//                   <button
//                     onClick={() => handleSubcategorySelect('')}
//                     className={`px-3 py-2 rounded-full text-xs font-bold transition-all ${
//                       !selectedSubcategoryParam
//                         ? 'bg-[#0B3EDB] text-white'
//                         : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-[#0B3EDB]'
//                     }`}
//                   >
//                     All
//                   </button>

//                   {subcategories.map((subcategory) => (
//                     <button
//                       key={subcategory}
//                       onClick={() =>
//                         handleSubcategorySelect(subcategory)
//                       }
//                       className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${
//                         slugify(selectedSubcategoryParam) ===
//                         slugify(subcategory)
//                           ? 'bg-[#0B3EDB] text-white'
//                           : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-[#0B3EDB]'
//                       }`}
//                     >
//                       {subcategory}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Product Count */}
//             <div className="flex items-center justify-between gap-3 mb-4">
//               <div>
//                 <h2 className="text-lg sm:text-xl font-extrabold text-[#07162E]">
//                   {selectedSubcategoryParam
//                     ? selectedSubcategoryParam.replace(/-/g, ' ')
//                     : selectedCategory.name}
//                 </h2>

//                 <p className="text-xs sm:text-sm text-gray-500 mt-1">
//                   Showing {filteredProducts.length} of{' '}
//                   {categoryProducts.length} products
//                 </p>
//               </div>
//             </div>

//             {/* Product Grid */}
//             {filteredProducts.length > 0 ? (
//               <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
//                 {filteredProducts.map((product) => (
//                   <ProductCard
//                     key={product._id || product.id || product.slug}
//                     product={product}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center">
//                 <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
//                   <PackageSearch
//                     size={30}
//                     className="text-[#0B3EDB]"
//                   />
//                 </div>

//                 <h3 className="text-lg font-extrabold text-[#07162E]">
//                   No Products Found
//                 </h3>

//                 <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
//                   {categoryProducts.length === 0
//                     ? 'There are currently no products assigned to this category in the master catalog.'
//                     : 'No products match your search or selected filter.'}
//                 </p>

//                 <button
//                   onClick={() => {
//                     setSearchFilter('');
//                     setSortBy('featured');
//                     handleSubcategorySelect('');
//                   }}
//                   className="mt-5 inline-flex items-center gap-2 bg-[#0B3EDB] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-800 transition-colors"
//                 >
//                   <X size={16} />
//                   Clear Filters
//                 </button>
//               </div>
//             )}
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CategoriesOverviewPage;








import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  ChevronRight,
  SlidersHorizontal,
  X,
  ShoppingBasket,
  PackageOpen,
  MapPin,
  Grid3X3,
} from 'lucide-react';

import {
  CATEGORIES,
  ALL_CATALOG_PRODUCTS,
  normalizeProduct,
} from '../data/groceryCatalog';

import ProductCard from '../components/ProductCard';

const CategoriesOverviewPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedSlug = searchParams.get('category');
  const selectedSubcategory = searchParams.get('subcategory') || '';

  const [categorySearch, setCategorySearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  // Categories
  const categories = useMemo(() => {
    return [...(CATEGORIES || [])].sort(
      (a, b) => (a.position || 0) - (b.position || 0)
    );
  }, []);

  // Products
  const allProducts = useMemo(() => {
    return (ALL_CATALOG_PRODUCTS || [])
      .map((item) => {
        const product = normalizeProduct(item);

        if (!product) return null;

        return {
          ...product,
          categorySlug:
            item.categorySlug ||
            item.category?.slug ||
            product.categorySlug,
          categoryName:
            item.categoryName ||
            item.category?.name ||
            product.categoryName,
          subcategory:
            item.subcategory ||
            item.subCategory ||
            item.subcategoryName ||
            item.subCategoryName ||
            '',
        };
      })
      .filter(Boolean);
  }, []);

  const selectedCategory = categories.find(
    (category) => category.slug === selectedSlug
  );

  const categoryCounts = useMemo(() => {
    const counts = {};

    categories.forEach((category) => {
      counts[category.slug] = allProducts.filter(
        (product) => product.categorySlug === category.slug
      ).length;
    });

    return counts;
  }, [categories, allProducts]);

  const visibleCategories = useMemo(() => {
    const search = categorySearch.toLowerCase().trim();

    if (!search) return categories;

    return categories.filter((category) =>
      `${category.name} ${category.description || ''} ${category.slug}`
        .toLowerCase()
        .includes(search)
    );
  }, [categories, categorySearch]);

  const categoryProducts = useMemo(() => {
    if (!selectedCategory) return [];

    return allProducts.filter(
      (product) => product.categorySlug === selectedCategory.slug
    );
  }, [allProducts, selectedCategory]);

  // Optional subcategory data, if present in catalog
  const subcategories = useMemo(() => {
    const values = categoryProducts
      .map((product) => {
        const value = product.subcategory;

        if (typeof value === 'object' && value !== null) {
          return value.name || value.title || value.slug || '';
        }

        return value;
      })
      .filter(Boolean);

    return [...new Set(values)];
  }, [categoryProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...categoryProducts];

    if (selectedSubcategory) {
      result = result.filter((product) => {
        const value = product.subcategory;

        const name =
          typeof value === 'object' && value !== null
            ? value.name || value.title || value.slug
            : value;

        return name === selectedSubcategory;
      });
    }

    const search = productSearch.toLowerCase().trim();

    if (search) {
      result = result.filter((product) =>
        [
          product.name,
          product.description,
          product.categoryName,
        ]
          .join(' ')
          .toLowerCase()
          .includes(search)
      );
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        result.sort(
          (a, b) =>
            (b.discountPercent || 0) - (a.discountPercent || 0)
        );
        break;
      case 'rating':
        result.sort(
          (a, b) => Number(b.rating) - Number(a.rating)
        );
        break;
      default:
        break;
    }

    return result;
  }, [
    categoryProducts,
    productSearch,
    selectedSubcategory,
    sortBy,
  ]);

  const openCategory = (slug) => {
    setProductSearch('');
    setSortBy('recommended');
    setMobileCategoriesOpen(false);
    setSearchParams({ category: slug });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showAllCategories = () => {
    setCategorySearch('');
    setProductSearch('');
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const changeSubcategory = (value) => {
    const params = { category: selectedCategory.slug };

    if (value) params.subcategory = value;

    setSearchParams(params);
  };

  // Invalid category
  if (selectedSlug && !selectedCategory) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <PackageOpen size={52} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">
          Category not found
        </h2>
        <button
          onClick={showAllCategories}
          className="mt-5 rounded-xl bg-green-600 px-6 py-3 text-white font-semibold"
        >
          Browse Categories
        </button>
      </div>
    );
  }

  // ==========================================
  // ALL CATEGORIES
  // ==========================================

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-5">
            <Link to="/" className="hover:text-green-600">
              Home
            </Link>
            <ChevronRight size={14} />
            <span className="font-semibold text-gray-900">
              All Categories
            </span>
          </div>

          {/* Heading */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <p className="text-green-700 text-xs font-bold uppercase tracking-[2px]">
                ServoneKart Grocery Store
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#20232a] mt-2">
                Shop by Category
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Fresh groceries and daily essentials, all in one place.
              </p>
            </div>

            <span className="text-sm text-gray-500 font-medium">
              {categories.length} Categories
            </span>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl mb-7">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="Search for fruits, vegetables, snacks..."
              className="w-full h-[52px] rounded-xl border border-gray-200 bg-white pl-12 pr-11 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-50"
            />
            {categorySearch && (
              <button
                onClick={() => setCategorySearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Categories Grid */}
          {visibleCategories.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {visibleCategories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => openCategory(category.slug)}
                  className="group overflow-hidden rounded-2xl bg-white border border-gray-100 text-left hover:border-green-300 hover:shadow-[0_8px_28px_rgba(22,163,74,0.10)] transition-all duration-300"
                >
                  <div className="relative aspect-[1.15/1] bg-[#f0f7ee] overflow-hidden">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        {category.icon || '🛒'}
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-4">
                    <h3 className="text-sm sm:text-[15px] font-bold text-gray-900 leading-snug group-hover:text-green-700">
                      {category.name}
                    </h3>

                    <p className="text-[11px] sm:text-xs text-gray-500 mt-1 line-clamp-2 min-h-[30px]">
                      {category.description || 'Explore products'}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[11px] font-semibold text-green-700">
                        {categoryCounts[category.slug] || 0} Products
                      </span>
                      <span className="w-7 h-7 flex items-center justify-center rounded-full bg-green-50 text-green-700 group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
              <Search size={35} className="mx-auto text-gray-300 mb-3" />
              <h3 className="font-bold text-gray-800">
                No categories found
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Try another category name.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // SELECTED CATEGORY / PRODUCT LISTING
  // ==========================================

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-green-600">
            Home
          </Link>
          <ChevronRight size={14} />
          <button onClick={showAllCategories} className="hover:text-green-600">
            Categories
          </button>
          <ChevronRight size={14} />
          <span className="font-semibold text-gray-900">
            {selectedCategory.name}
          </span>
        </div>

        <button
          onClick={showAllCategories}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-700 font-semibold mb-5"
        >
          <ArrowLeft size={17} />
          All Categories
        </button>

        {/* Category Hero */}
        <section className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] items-center">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                <ShoppingBasket size={14} />
                SHOP CATEGORY
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#20232a] mt-4">
                {selectedCategory.name}
              </h1>

              <p className="text-sm sm:text-base text-gray-500 mt-2 max-w-xl">
                {selectedCategory.description ||
                  `Explore our ${selectedCategory.name} collection.`}
              </p>

              <p className="text-sm font-bold text-green-700 mt-4">
                {categoryProducts.length} Products Available
              </p>
            </div>

            <div className="hidden md:block h-[210px] bg-green-50">
              {selectedCategory.image ? (
                <img
                  src={selectedCategory.image}
                  alt={selectedCategory.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-7xl">
                  {selectedCategory.icon || '🛒'}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Mobile Category Selector */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
            className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 text-sm font-semibold text-gray-700"
          >
            <span className="flex items-center gap-2">
              <Grid3X3 size={17} />
              Browse Categories
            </span>
            <ChevronRight
              size={17}
              className={mobileCategoriesOpen ? 'rotate-90' : ''}
            />
          </button>

          {mobileCategoriesOpen && (
            <div className="mt-2 rounded-xl bg-white border border-gray-100 p-3 grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => openCategory(category.slug)}
                  className={`text-left rounded-lg px-3 py-2 text-xs font-semibold ${
                    category.slug === selectedCategory.slug
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[235px_minmax(0,1fr)] gap-5">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl bg-white border border-gray-100 p-4">
              <h3 className="font-bold text-gray-900 mb-4">
                All Categories
              </h3>

              <div className="max-h-[65vh] overflow-y-auto space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => openCategory(category.slug)}
                    className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      selectedCategory.slug === category.slug
                        ? 'bg-green-50 text-green-700 font-bold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{category.name}</span>
                    <ChevronRight size={15} className="shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Area */}
          <main className="min-w-0">

            {/* Search and Sort */}
            <div className="rounded-2xl bg-white border border-gray-100 p-3 sm:p-4 mb-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder={`Search in ${selectedCategory.name}...`}
                    className="w-full h-11 rounded-xl bg-gray-50 border border-gray-100 pl-10 pr-4 text-sm outline-none focus:bg-white focus:border-green-500"
                  />
                </div>

                <div className="relative sm:w-[210px]">
                  <SlidersHorizontal
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-11 rounded-xl bg-gray-50 border border-gray-100 pl-9 pr-3 text-sm font-medium text-gray-700 outline-none cursor-pointer"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="discount">Highest Discount</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Subcategory Pills */}
            {subcategories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
                <button
                  onClick={() => changeSubcategory('')}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold ${
                    !selectedSubcategory
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  All
                </button>

                {subcategories.map((subcategory) => (
                  <button
                    key={subcategory}
                    onClick={() => changeSubcategory(subcategory)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold ${
                      selectedSubcategory === subcategory
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    {subcategory}
                  </button>
                ))}
              </div>
            )}

            {/* Product Heading */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#20232a]">
                  {selectedSubcategory || selectedCategory.name}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {filteredProducts.length} products found
                </p>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id || product.id || product.slug}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white border border-gray-100 py-16 px-4 text-center">
                <PackageOpen
                  size={45}
                  className="mx-auto text-gray-300 mb-4"
                />
                <h3 className="text-lg font-bold text-gray-800">
                  No products found
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  Try changing your search or filters.
                </p>

                {(productSearch || selectedSubcategory) && (
                  <button
                    onClick={() => {
                      setProductSearch('');
                      changeSubcategory('');
                    }}
                    className="mt-5 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CategoriesOverviewPage;
