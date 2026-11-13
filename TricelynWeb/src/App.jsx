import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';
import { PlatformProvider } from './context/PlatformContext';

import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import LocationModal from './components/LocationModal';
import AuthModal from './components/AuthModal';
import SupportWidget from './components/SupportWidget';
import ProductDetailModal from './components/ProductDetailModal';
import ActiveOrderBanner from './components/ActiveOrderBanner';
import StickyMobileCartBar from './components/StickyMobileCartBar';

import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoryPage from './pages/CategoryPage';
import CategoriesOverviewPage from './pages/CategoriesOverviewPage';
import StoresPage from './pages/StoresPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import SearchResultsPage from './pages/SearchResultsPage';
import AccountOrdersPage from './pages/AccountOrdersPage';
import SupportPage from './pages/SupportPage';
import LegalPolicyCenterPage from './pages/LegalPolicyCenterPage';

function App() {
  return (
    <Router>
      <PlatformProvider>
        <AuthProvider>
          <LocationProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 antialiased relative">
                {/* Sticky Header with Logo, Location, Search & Cart */}
                <Header />

                {/* Main Routing Content */}
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/category/:slug" element={<CategoryPage />} />
                    <Route path="/categories" element={<CategoriesOverviewPage />} />
                    <Route path="/stores" element={<StoresPage />} />
                    <Route path="/store/:storeId" element={<StoresPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                    <Route path="/track/:orderId" element={<OrderTrackingPage />} />
                    <Route path="/search" element={<SearchResultsPage />} />
                    <Route path="/account" element={<AccountOrdersPage />} />
                    <Route path="/account/orders" element={<AccountOrdersPage />} />
                    <Route path="/account/addresses" element={<AccountOrdersPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/policy/:policyType" element={<LegalPolicyCenterPage />} />
                    <Route path="/policies" element={<Navigate to="/policy/refund" replace />} />
                    <Route path="/terms" element={<Navigate to="/policy/terms" replace />} />
                    <Route path="/privacy" element={<Navigate to="/policy/privacy" replace />} />
                    <Route path="/refund" element={<Navigate to="/policy/refund" replace />} />
                    <Route path="/shipping-policy" element={<Navigate to="/policy/shipping" replace />} />
                    <Route path="/faq" element={<Navigate to="/policy/faq" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>

                {/* Global Slide-Over Cart Drawer */}
                <CartDrawer />

                {/* Global Delivery Location Modal */}
                <LocationModal />

                {/* Global Phone OTP Authentication Modal */}
                <AuthModal />

                {/* Global Product Detail Modal */}
                <ProductDetailModal />

                {/* Global Floating Active Order Banner */}
                <ActiveOrderBanner />

                {/* Global Floating 24/7 Support Chat Widget */}
                <SupportWidget />

                {/* Global Sticky Bottom Cart Bar on Mobile */}
                <StickyMobileCartBar />

                {/* Tricelyn Footer */}
                <Footer />
              </div>
            </CartProvider>
          </LocationProvider>
        </AuthProvider>
      </PlatformProvider>
    </Router>
  );
}

export default App;
