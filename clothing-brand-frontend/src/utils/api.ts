// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? 'http://localhost:5000' : 'https://rangandcraft.onrender.com');

export const API_ENDPOINTS = {
  // Health Check
  HEALTH: `${API_BASE_URL}/api/health`,
  USERS: `${API_BASE_URL}/api/users`,

  // Products
  PRODUCTS: `${API_BASE_URL}/api/products`,

  // Videos
  VIDEOS: `${API_BASE_URL}/api/videos`,

  // Banners
  BANNERS: `${API_BASE_URL}/api/banners`,

  // Coupons
  COUPONS: `${API_BASE_URL}/api/coupons`,

  // Auth
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/users/login`,
    REGISTER: `${API_BASE_URL}/api/users`,
    LOGOUT: `${API_BASE_URL}/api/users/logout`,
  },

  // Chat
  CHAT: `${API_BASE_URL}/api/chat`,

  // Orders
  ORDERS: {
    BASE: `${API_BASE_URL}/api/orders`,
    CREATE: `${API_BASE_URL}/api/orders/create`,
    VERIFY: `${API_BASE_URL}/api/orders/verify`,
    USER_ORDERS: `${API_BASE_URL}/api/orders/user`,
    TRACK: `${API_BASE_URL}/api/orders/track`,
  },
};

// Helper function for API requests
export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  if (!navigator.onLine) {
    throw new Error("No internet connection. Please check your network and try again.");
  }

  let response;
  try {
    response = await fetch(endpoint, defaultOptions);
  } catch (err) {
    // If fetch throws, it's usually a network error or CORS issue
    throw new Error("Unable to connect to the server. Please check your internet connection.");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Something went wrong on the server.' }));
    // If backend sends a specific confusing message, override it here
    if (error.message && error.message.toLowerCase().includes('mongodb')) {
      throw new Error('Server connection error. Please try again later.');
    }
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response;
}

// Specific API call functions for common operations
export async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await apiCall(endpoint, options);
  return response.json() as Promise<T>;
}
