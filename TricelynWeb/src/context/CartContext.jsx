import React, { createContext, useContext, useState, useEffect } from 'react';
import { marketingService, cartService } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
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

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [couponError, setCouponError] = useState(null);

  // Save to local storage on change
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

  const addToCart = (product, quantity = 1, variant = null) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.product._id === product._id && (!variant || item.variant?._id === variant?._id)
      );

      if (existingIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingIndex].quantity += quantity;
        return newItems;
      } else {
        return [...prevItems, { product, quantity, variant }];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product._id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setItems((prevItems) => prevItems.filter((item) => item.product._id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
    localStorage.removeItem('tricelyn_cart');
    localStorage.removeItem('tricelyn_coupon');
  };

  const getItemQuantity = (productId) => {
    const item = items.find((i) => i.product._id === productId);
    return item ? item.quantity : 0;
  };

  // Calculations
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.product.price) || 0;
    return sum + price * item.quantity;
  }, 0);

  const mrpTotal = items.reduce((sum, item) => {
    const mrp = Number(item.product.mrp) || (Number(item.product.price) * 1.25) || 0;
    return sum + mrp * item.quantity;
  }, 0);

  const totalSavings = Math.max(0, mrpTotal - subtotal);

  // Delivery fee logic: Free delivery on ₹199+, else ₹25
  const deliveryFee = subtotal >= 199 || items.length === 0 ? 0 : 25;
  const platformFee = items.length > 0 ? 2 : 0;

  // Coupon discount calculation
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

  const grandTotal = Math.max(0, subtotal - couponDiscount + deliveryFee + platformFee);

  const applyCoupon = async (code) => {
    setCouponError(null);
    if (!code) return { success: false, message: 'Please enter a coupon code' };

    const upperCode = code.trim().toUpperCase();

    // Default quick commerce coupons for instant delight
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
      // Fallback
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
        platformFee,
        coupon,
        couponDiscount,
        couponError,
        applyCoupon,
        removeCoupon,
        grandTotal,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
