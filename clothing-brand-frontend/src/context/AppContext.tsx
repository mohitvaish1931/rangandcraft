/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { API_ENDPOINTS, SESSION_EXPIRED_EVENT, SESSION_KEY } from '../utils/api';

export interface Product {
  id: string | number;
  _id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  videos?: string[];
  sale?: boolean;
  soldOut?: boolean;
  category: string;
  subcategory?: string;
  description?: string;
  features?: string[];
  materials?: string[];
  dimensions?: string;
  weight?: string;
  specifications?: string[];
  careInstructions?: string[];
  averageRating?: number;
  reviewCount?: number;
  rating?: number;
  numReviews?: number;
  stock?: number;
  countInStock?: number;
  colors?: string[];
  sizes?: string[];
  selectedSize?: string;
  selectedColor?: string;
  shapes?: string[];
  selectedShape?: string;
  productLink?: string;
  status?: 'published' | 'pre-upload';
  displayOrder?: number;
  quantity?: number;
  isBOGO?: boolean;
  showOnHomepage?: boolean;
  createdAt?: string;
}

export interface Video {
  id: string;
  _id?: string;
  title: string;
  url: string;
}

export interface Banner {
  id: string;
  _id?: string;
  text: string;
  type?: 'info' | 'hot' | 'new' | 'sold-out';
}

export interface Coupon {
  code: string;
  discountPercent: number;
  active: boolean;
  productId?: string | number | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  used?: number;
  applicableCategories?: string[];
  maxPriceThreshold?: number | null;
}

/** One line in the bag. The same product in two sizes is two lines. */
export interface CartItem {
  key: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  category: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  maxQuantity: number;
}

export interface User {
  id: string;
  _id?: string;
  email: string;
  name: string;
  phone?: string;
  isAdmin?: boolean;
  token?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Order = any;

interface AppState {
  user: User | null;
  cart: CartItem[];
  wishlist: Product[];
  isCartOpen: boolean;
  isSignInOpen: boolean;
  searchQuery: string;
  searchResults: Product[];
  isSearchOpen: boolean;
  products: Product[];
  productsStatus: 'idle' | 'loading' | 'ready' | 'error';
  videos: Video[];
  banners: Banner[];
  coupons: Coupon[];
  orders: Order[];
}

export const MAX_LINE_QUANTITY = 10;

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'LOGOUT' }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_PRODUCTS_STATUS'; payload: AppState['productsStatus'] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'REMOVE_PRODUCT'; payload: string | number }
  | { type: 'SET_VIDEOS'; payload: Video[] }
  | { type: 'ADD_VIDEO'; payload: Video }
  | { type: 'REMOVE_VIDEO'; payload: string }
  | { type: 'SET_BANNERS'; payload: Banner[] }
  | { type: 'ADD_BANNER'; payload: Banner }
  | { type: 'UPDATE_BANNER'; payload: Banner }
  | { type: 'REMOVE_BANNER'; payload: string }
  | { type: 'SET_COUPONS'; payload: Coupon[] }
  | { type: 'ADD_COUPON'; payload: Coupon }
  | { type: 'UPDATE_COUPON'; payload: Coupon }
  | { type: 'REMOVE_COUPON'; payload: string }
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number; selectedSize?: string; selectedColor?: string; openDrawer?: boolean } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { key: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SYNC_CART'; payload: Product[] }
  | { type: 'TOGGLE_CART'; payload?: boolean }
  | { type: 'ADD_TO_WISHLIST'; payload: Product }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string | number }
  | { type: 'TOGGLE_SIGNIN'; payload?: boolean }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SEARCH_RESULTS'; payload: Product[] }
  | { type: 'TOGGLE_SEARCH'; payload?: boolean }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'UPDATE_ORDER'; payload: Order };

const CART_KEY = 'rc_cart';
const WISHLIST_KEY = 'rc_wishlist';

const readStorage = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key: string, value: unknown) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode); the app still works in memory.
  }
};

const idOf = (p: { _id?: string; id?: string | number }) => String(p._id ?? p.id ?? '');

export const cartKey = (productId: string, size = '', color = '') => [productId, size, color].join('|');

const restoreUser = (): User | null => {
  const raw = readStorage<User | null>(SESSION_KEY, null);
  // Sessions created before token auth existed cannot call protected APIs.
  return raw && raw.token ? raw : null;
};

const initialState = (): AppState => ({
  user: restoreUser(),
  cart: readStorage<CartItem[]>(CART_KEY, []).filter((i) => i && i.key && i.productId),
  wishlist: readStorage<Product[]>(WISHLIST_KEY, []),
  isCartOpen: false,
  isSignInOpen: false,
  searchQuery: '',
  searchResults: [],
  isSearchOpen: false,
  products: [],
  productsStatus: 'idle',
  videos: [],
  banners: [],
  coupons: [],
  orders: [],
});

const withIds = <T extends { _id?: string; id?: string | number }>(items: T[]) =>
  Array.isArray(items) ? items.map((item) => ({ ...item, id: item.id ?? item._id })) : [];

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, coupons: [], orders: [] };
    case 'SET_PRODUCTS':
      return { ...state, products: withIds(action.payload) as Product[], productsStatus: 'ready' };
    case 'SET_PRODUCTS_STATUS':
      return { ...state, productsStatus: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map((p) => (idOf(p) === idOf(action.payload) ? { ...action.payload, id: idOf(action.payload) } : p)) };
    case 'REMOVE_PRODUCT':
      return { ...state, products: state.products.filter((p) => idOf(p) !== String(action.payload)) };
    case 'SET_VIDEOS':
      return { ...state, videos: withIds(action.payload) as Video[] };
    case 'ADD_VIDEO':
      return { ...state, videos: [...state.videos, action.payload] };
    case 'REMOVE_VIDEO':
      return { ...state, videos: state.videos.filter((v) => idOf(v) !== action.payload) };
    case 'SET_BANNERS':
      return { ...state, banners: withIds(action.payload) as Banner[] };
    case 'ADD_BANNER':
      return { ...state, banners: [...state.banners, action.payload] };
    case 'UPDATE_BANNER':
      return { ...state, banners: state.banners.map((b) => (idOf(b) === idOf(action.payload) ? action.payload : b)) };
    case 'REMOVE_BANNER':
      return { ...state, banners: state.banners.filter((b) => idOf(b) !== action.payload) };
    case 'SET_COUPONS':
      return { ...state, coupons: action.payload };
    case 'ADD_COUPON':
      return { ...state, coupons: [...state.coupons, action.payload] };
    case 'UPDATE_COUPON':
      return { ...state, coupons: state.coupons.map((c) => (c.code === action.payload.code ? action.payload : c)) };
    case 'REMOVE_COUPON':
      return { ...state, coupons: state.coupons.filter((c) => c.code !== action.payload) };

    case 'ADD_TO_CART': {
      const { product, quantity, selectedSize = '', selectedColor = '', openDrawer = true } = action.payload;
      const pid = idOf(product);
      const key = cartKey(pid, selectedSize, selectedColor);
      const maxQuantity = Math.max(1, Math.min(MAX_LINE_QUANTITY, product.countInStock ?? MAX_LINE_QUANTITY));
      const existing = state.cart.find((item) => item.key === key);
      const cart = existing
        ? state.cart.map((item) =>
            item.key === key ? { ...item, quantity: Math.min(maxQuantity, item.quantity + quantity), maxQuantity } : item
          )
        : [
            ...state.cart,
            {
              key,
              productId: pid,
              name: product.name,
              image: product.image,
              price: product.price,
              originalPrice: product.originalPrice,
              category: product.category,
              quantity: Math.min(maxQuantity, quantity),
              selectedSize,
              selectedColor,
              maxQuantity,
            },
          ];
      return { ...state, cart, isCartOpen: openDrawer ? true : state.isCartOpen };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((item) => item.key !== action.payload) };
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.key === action.payload.key
            ? { ...item, quantity: Math.max(1, Math.min(item.maxQuantity || MAX_LINE_QUANTITY, action.payload.quantity)) }
            : item
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'SYNC_CART': {
      // Refresh saved lines with live prices/stock; drop products that are gone.
      const byId = new Map(action.payload.map((p) => [idOf(p), p]));
      const cart = state.cart.flatMap((item) => {
        const p = byId.get(item.productId);
        if (!p) return [];
        const maxQuantity = Math.max(1, Math.min(MAX_LINE_QUANTITY, p.countInStock ?? MAX_LINE_QUANTITY));
        return [{ ...item, name: p.name, image: p.image, price: p.price, originalPrice: p.originalPrice, category: p.category, maxQuantity, quantity: Math.min(item.quantity, maxQuantity) }];
      });
      return { ...state, cart };
    }
    case 'TOGGLE_CART':
      return { ...state, isCartOpen: action.payload ?? !state.isCartOpen };

    case 'ADD_TO_WISHLIST':
      if (state.wishlist.some((item) => idOf(item) === idOf(action.payload))) return state;
      return { ...state, wishlist: [...state.wishlist, action.payload] };
    case 'REMOVE_FROM_WISHLIST':
      return { ...state, wishlist: state.wishlist.filter((item) => idOf(item) !== String(action.payload)) };

    case 'TOGGLE_SIGNIN':
      return { ...state, isSignInOpen: action.payload ?? !state.isSignInOpen };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
    case 'TOGGLE_SEARCH':
      return { ...state, isSearchOpen: action.payload ?? !state.isSearchOpen };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'UPDATE_ORDER':
      return { ...state, orders: state.orders.map((o) => (o._id === action.payload._id ? action.payload : o)) };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

const getJSON = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, undefined, initialState);

  // Public catalogue data, loaded once and shared by every page.
  useEffect(() => {
    let mounted = true;
    dispatch({ type: 'SET_PRODUCTS_STATUS', payload: 'loading' });

    getJSON(API_ENDPOINTS.PRODUCTS)
      .then((data) => mounted && dispatch({ type: 'SET_PRODUCTS', payload: Array.isArray(data) ? data : data.products || [] }))
      .catch(() => mounted && dispatch({ type: 'SET_PRODUCTS_STATUS', payload: 'error' }));
    getJSON(API_ENDPOINTS.VIDEOS).then((d) => mounted && dispatch({ type: 'SET_VIDEOS', payload: d })).catch(() => {});
    getJSON(API_ENDPOINTS.BANNERS).then((d) => mounted && dispatch({ type: 'SET_BANNERS', payload: d })).catch(() => {});

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (state.productsStatus === 'ready' && state.products.length > 0) {
      dispatch({ type: 'SYNC_CART', payload: state.products });
    }
  }, [state.productsStatus, state.products]);

  // Coupons are admin-only data.
  // The token is passed explicitly: this can run before the session is persisted.
  const adminToken = state.user?.isAdmin ? state.user.token : undefined;
  useEffect(() => {
    if (!adminToken) return;
    fetch(API_ENDPOINTS.COUPONS, { headers: { Authorization: `Bearer ${adminToken}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((d) => dispatch({ type: 'SET_COUPONS', payload: d }))
      .catch(() => {});
  }, [adminToken]);

  useEffect(() => { writeStorage(SESSION_KEY, state.user); }, [state.user]);
  useEffect(() => { writeStorage(CART_KEY, state.cart); }, [state.cart]);
  useEffect(() => { writeStorage(WISHLIST_KEY, state.wishlist); }, [state.wishlist]);

  // Keep the bag and session in sync across browser tabs.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) dispatch({ type: 'SET_USER', payload: restoreUser() });
    };
    const onExpired = () => dispatch({ type: 'LOGOUT' });
    window.addEventListener('storage', onStorage);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
    };
  }, []);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const cartCount = (cart: CartItem[]) => cart.reduce((sum, item) => sum + item.quantity, 0);
export const cartSubtotal = (cart: CartItem[]) => cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
