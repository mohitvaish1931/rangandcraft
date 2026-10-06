// API Configuration
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? 'http://localhost:5000' : 'https://rangandcraft.onrender.com');

export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/api/health`,
  USERS: `${API_BASE_URL}/api/users`,
  PROFILE: `${API_BASE_URL}/api/users/profile`,
  PRODUCTS: `${API_BASE_URL}/api/products`,
  VIDEOS: `${API_BASE_URL}/api/videos`,
  BANNERS: `${API_BASE_URL}/api/banners`,
  COUPONS: `${API_BASE_URL}/api/coupons`,
  REVIEWS: `${API_BASE_URL}/api/reviews`,
  CONTACT: `${API_BASE_URL}/api/contact`,
  NEWSLETTER: `${API_BASE_URL}/api/contact/newsletter`,
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/users/login`,
    REGISTER: `${API_BASE_URL}/api/users`,
    LOGOUT: `${API_BASE_URL}/api/users/logout`,
  },
  CHAT: `${API_BASE_URL}/api/chat`,
  ORDERS: {
    BASE: `${API_BASE_URL}/api/orders`,
    QUOTE: `${API_BASE_URL}/api/orders/quote`,
    MINE: `${API_BASE_URL}/api/orders/my`,
    TRACK: `${API_BASE_URL}/api/orders/track`,
  },
  PAYMENT: {
    CONFIG: `${API_BASE_URL}/api/payment/razorpay/config`,
    CREATE: `${API_BASE_URL}/api/payment/razorpay`,
    VERIFY: `${API_BASE_URL}/api/payment/verify`,
    BYPASS: `${API_BASE_URL}/api/payment/bypass`,
  },
};

export const SESSION_KEY = 'rr_user';
export const SESSION_EXPIRED_EVENT = 'rc:session-expired';

export const getAuthToken = (): string | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw).token as string | undefined) ?? null : null;
  } catch {
    return null;
  }
};

const isApiRequest = (url: string) => url.startsWith(API_BASE_URL) || url.startsWith('/api/');

/**
 * Wraps window.fetch so that every request to our API carries the signed-in
 * user's bearer token, and so that network failures produce readable errors.
 * The token is never attached to third-party URLs.
 */
export const installFetchInterceptor = () => {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    let finalInit = init;
    let sentToken = false;

    if (isApiRequest(url)) {
      const token = getAuthToken();
      const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
        sentToken = true;
      }
      finalInit = { ...init, headers };
    }

    if (!navigator.onLine) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    let response: Response;
    try {
      response = await originalFetch(input, finalInit);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Unable to reach the server. Please check your connection and try again.');
      }
      throw error;
    }

    if (sentToken && response.status === 401) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    return response;
  };
};

const readError = async (response: Response) => {
  const body = await response.json().catch(() => ({}));
  const message: string = body.message || body.error || '';
  if (!message || /mongo/i.test(message)) {
    return response.status >= 500 ? 'Something went wrong on our side. Please try again.' : `Request failed (${response.status})`;
  }
  return message;
};

export async function apiCall(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = new Headers(options.headers);
  if (!isForm && options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(endpoint, { ...options, headers });
  if (!response.ok) throw new Error(await readError(response));
  return response;
}

export async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await apiCall(endpoint, options);
  return response.json() as Promise<T>;
}

export const postJSON = <T>(endpoint: string, body: unknown, method = 'POST') =>
  fetchJSON<T>(endpoint, { method, body: JSON.stringify(body) });
