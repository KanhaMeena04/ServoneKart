import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { marketingService } from '../services/api';
import { usePlatform } from './PlatformContext';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const resolveProductId = (prod) => String(prod?._id || prod?.id || prod?.slug || '');

export const CartProvider = ({ children }) => {
  const { appSettings } = usePlatform();
  const { user } = useAuth();

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('tricelyn_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('tricelyn_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [riderTip, setRiderTip] = useState(0);
  const [donationAmount, setDonationAmount] = useState(() => {
    try {
      const saved = localStorage.getItem('tricelyn_donation');
      return saved ? JSON.parse(saved) : 0;
    } catch (e) {
      return 0;
    }
  });
  const [activeOrderId, setActiveOrderId] = useState(() => localStorage.getItem('tricelyn_active_order') || null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);

  useEffect(() => {
    localStorage.setItem('tricelyn_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('tricelyn_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('tricelyn_coupon');
    }
  }, [coupon]);

  useEffect(() => {
    if (donationAmount > 0) {
      localStorage.setItem('tricelyn_donation', JSON.stringify(donationAmount));
    } else {
      localStorage.removeItem('tricelyn_donation');
    }
  }, [donationAmount]);

  useEffect(() => {
    if (activeOrderId) {
      localStorage.setItem('tricelyn_active_order', activeOrderId);
    } else {
      localStorage.removeItem('tricelyn_active_order');
    }
  }, [activeOrderId]);

  const addToCart = (product, quantity = 1, variant = null) => {
    const pid = resolveProductId(product);
    if (!pid) return;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          resolveProductId(item.product) === pid &&
          (!variant || item.variant?._id === variant?._id)
      );

      if (existingIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity,
        };
        return newItems;
      }
      return [...prevItems, { product: { ...product, _id: product._id || pid }, quantity, variant }];
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const targetId = String(productId);
    setItems((prevItems) =>
      prevItems.map((item) =>
        resolveProductId(item.product) === targetId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    const targetId = String(productId);
    setItems((prevItems) => prevItems.filter((item) => resolveProductId(item.product) !== targetId));
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
    setRiderTip(0);
    setDonationAmount(0);
    localStorage.removeItem('tricelyn_cart');
    localStorage.removeItem('tricelyn_coupon');
    localStorage.removeItem('tricelyn_donation');
  };

  const getItemQuantity = (productId) => {
    const targetId = String(productId || '');
    const item = items.find((i) => resolveProductId(i.product) === targetId);
    return item ? item.quantity : 0;
  };

  // Multi-Vendor Store Grouping (mirrors backend split fulfilment groups)
  const storeGroups = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      const prod = item.product || {};
      const storeObj = prod.restaurant && typeof prod.restaurant === 'object' ? prod.restaurant : null;
      const storeId = String(
        prod.storeId ||
          storeObj?._id ||
          (typeof prod.restaurant === 'string' ? prod.restaurant : '') ||
          prod.vendorId ||
          'tricelyn_dark_store'
      );
      const storeName =
        prod.storeName || storeObj?.name || prod.vendorName || 'Tricelyn Partner Store';

      if (!map.has(storeId)) {
        map.set(storeId, { storeId, storeName, items: [], subtotal: 0 });
      }
      const group = map.get(storeId);
      group.items.push(item);
      group.subtotal += (Number(prod.price) || 0) * (Number(item.quantity) || 1);
    });
    return Array.from(map.values());
  }, [items]);

  const storeCount = storeGroups.length;
  const isMultiStore = storeCount > 1;

  // Calculations
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.product.price) || 0;
    return sum + price * item.quantity;
  }, 0);

  const mrpTotal = items.reduce((sum, item) => {
    const mrp = Number(item.product.mrp) || Number(item.product.price) || 0;
    return sum + mrp * item.quantity;
  }, 0);

  const totalSavings = Math.max(0, mrpTotal - subtotal);

  // Dynamic Delivery Fee Logic: Admin configured threshold & First-order perks
  const freeThreshold = Number(appSettings?.freeDeliveryMinAmount ?? appSettings?.deliveryFeeConfig?.freeDeliveryThreshold ?? 199);
  const baseFee = Number(appSettings?.deliveryFeeConfig?.baseFee ?? appSettings?.baseDeliveryFee ?? 25);
  const platformFeeAmount = Number(appSettings?.platformFeeConfig?.fee ?? appSettings?.platformFee ?? 2);
  const isFirstOrderEligible = Boolean(appSettings?.firstOrderFreeDelivery !== false && (!user?.orderCount || user?.orderCount === 0));

  const deliveryFee = items.length === 0 || subtotal >= freeThreshold || isFirstOrderEligible ? 0 : baseFee;
  const platformFee = items.length > 0 ? platformFeeAmount : 0;

  let couponDiscount = 0;
  if (coupon && subtotal > 0) {
    if (coupon.discountType === 'percentage' || coupon.percent) {
      const pct = coupon.discountPercent || coupon.percent || 10;
      couponDiscount = Math.round((subtotal * pct) / 100);
      if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
        couponDiscount = coupon.maxDiscount;
      }
    } else if (coupon.discountAmount) {
      couponDiscount = Math.min(coupon.discountAmount, subtotal);
    } else if (coupon.amount) {
      couponDiscount = Math.min(coupon.amount, subtotal);
    }
  }

  const toggleDonation = (amt = 1) => {
    setDonationAmount((prev) => (prev > 0 ? 0 : amt));
  };

  const grandTotal = Math.max(0, subtotal - couponDiscount + deliveryFee + platformFee + riderTip + (donationAmount || 0));

  const applyCoupon = async (code) => {
    setCouponError(null);
    if (!code) return { success: false, message: 'Please enter a coupon code' };

    const upperCode = code.trim().toUpperCase();

    try {
      const res = await marketingService.validateCoupon(upperCode, subtotal);
      if (res.data && res.data.success) {
        setCoupon(res.data.coupon || { code: upperCode, discountAmount: res.data.discount || 25 });
        return { success: true, message: res.data.message || 'Coupon applied successfully' };
      } else {
        setCouponError(res.data?.message || 'Invalid coupon code');
        return { success: false, message: res.data?.message || 'Invalid coupon code' };
      }
    } catch (err) {
      if (upperCode === 'SAVE25' || upperCode === 'WELCOME50' || upperCode === 'TRICELYN10') {
        const discount = upperCode === 'WELCOME50' ? 50 : 25;
        const newCoupon = {
          code: upperCode,
          discountAmount: discount,
          description: `₹${discount} Instant Savings applied!`,
        };
        setCoupon(newCoupon);
        return { success: true, message: `Coupon ${upperCode} applied! Saved ₹${discount}` };
      }
      setCouponError(err.response?.data?.message || 'Invalid or expired coupon');
      return { success: false, message: err.response?.data?.message || 'Invalid coupon' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        storeGroups,
        storeCount,
        isMultiStore,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getItemQuantity,
        itemCount,
        subtotal,
        mrpTotal,
        totalSavings,
        deliveryFee,
        freeThreshold,
        isFirstOrderEligible,
        platformFee,
        riderTip,
        setRiderTip,
        donationAmount,
        setDonationAmount,
        toggleDonation,
        activeOrderId,
        setActiveOrderId,
        coupon,
        couponDiscount,
        couponError,
        applyCoupon,
        removeCoupon,
        grandTotal,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        selectedProductForDetail,
        setSelectedProductForDetail,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
