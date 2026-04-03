const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper to get auth token
const getToken = () => localStorage.getItem('token');

// Helper for API requests
async function fetchWithAuth(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() && { 'Authorization': `Bearer ${getToken()}` }),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// Auth API
export const authAPI = {
  register: (userData) => fetchWithAuth('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  login: (credentials) => fetchWithAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  getMe: () => fetchWithAuth('/auth/me'),
};

// Products API
export const productAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/products?${queryString}`);
  },
  
  getById: (id) => fetchWithAuth(`/products/${id}`),
  
  getCategories: () => fetchWithAuth('/products/categories/all'),
};

// Cart API
export const cartAPI = {
  getCart: () => fetchWithAuth('/cart'),
  
  addToCart: (productId, quantity = 1) => fetchWithAuth('/cart/add', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  }),
  
  updateQuantity: (productId, quantity) => fetchWithAuth(`/cart/update/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  }),
  
  removeFromCart: (productId) => fetchWithAuth(`/cart/remove/${productId}`, {
    method: 'DELETE',
  }),
  
  clearCart: () => fetchWithAuth('/cart/clear', {
    method: 'DELETE',
  }),
};

// User API
export const userAPI = {
  getWishlist: () => fetchWithAuth('/user/wishlist'),
  
  addToWishlist: (productId) => fetchWithAuth(`/user/wishlist/${productId}`, {
    method: 'POST',
  }),
  
  removeFromWishlist: (productId) => fetchWithAuth(`/user/wishlist/${productId}`, {
    method: 'DELETE',
  }),
  
  updateProfile: (updates) => fetchWithAuth('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
};

// Local storage helpers
export const storage = {
  setToken: (token) => localStorage.setItem('token', token),
  getToken: () => localStorage.getItem('token'),
  removeToken: () => localStorage.removeItem('token'),
  setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  removeUser: () => localStorage.removeItem('user'),
  clear: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
