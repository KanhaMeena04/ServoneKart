import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor to inject JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tricelyn_token') || localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global errors (e.g. 401 unauth)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      const currentPath = window.location.pathname;
      if (currentPath.includes('/checkout') || currentPath.includes('/account')) {
        console.warn('Session expired. Please log in.');
      }
    }
    return Promise.reject(error);
  }
);

// Grocery Services
export const groceryService = {
  getCategories: () => api.get('/grocery/categories'),
  getProducts: (params = {}) => api.get('/grocery/products', { params }),
  getCategorySections: () => api.get('/grocery/category-sections'),
  getBanners: () => api.get('/grocery/banners'),
  getBestSellers: () => api.get('/grocery/best-sellers'),
  getStores: (params = {}) => api.get('/grocery/stores', { params }),
  getStoreCatalog: (storeId) => api.get(`/grocery/stores/${storeId}/catalog`),
  placeGroceryOrder: (orderData) => api.post('/grocery/order', orderData),
};

// Order Services
export const orderService = {
  placeOrder: (orderData) => api.post('/orders/place', orderData),
  getMyOrders: (params = {}) => api.get('/orders/my-orders', { params }),
  getOrderById: (orderId) => api.get(`/orders/${orderId}`),
  trackOrder: (orderId) => api.get(`/orders/tracking/${orderId}`),
  cancelOrder: (orderId, reason) => api.post(`/orders/${orderId}/cancel`, { reason }),
  calculateFee: (data) => api.post('/orders/calculate-fee', data),
};

// Coupons & Banners
export const marketingService = {
  getBanners: () => api.get('/banners'),
  getActiveCoupons: () => api.get('/coupons/active'),
  validateCoupon: (code, orderAmount) => api.post('/coupons/validate', { code, orderAmount }),
};

// Cart Services
export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart/add', data),
  updateQuantity: (data) => api.put('/cart/update', data),
  removeItem: (itemId) => api.delete('/cart/remove', { data: { itemId } }),
  clearCart: () => api.delete('/cart/clear'),
};

// User & Address Services
export const userService = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getAddresses: () => api.get('/addresses'),
  addAddress: (data) => api.post('/addresses', data),
  updateAddress: (id, data) => api.put(`/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/addresses/${id}`),
  setDefaultAddress: (id) => api.patch(`/addresses/set-default/${id}`),
};

// Auth Services
export const authService = {
  sendOtp: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOtp: (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register/initiate', data),
};

export default api;

