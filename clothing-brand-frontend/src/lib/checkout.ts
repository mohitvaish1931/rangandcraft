import type { CartItem } from '../context/AppContext';
import { API_ENDPOINTS, fetchJSON, postJSON } from '../utils/api';

export interface Quote {
  itemsPrice: number;
  offerDiscount: number;
  appliedOffers: { id: string; label: string; times: number; saving: number }[];
  discountAmount: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  couponCode: string | null;
  couponError: string | null;
  freeShippingThreshold: number;
  shippingFee: number;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export const toOrderItems = (cart: CartItem[]) =>
  cart.map((i) => ({ product: i.productId, qty: i.quantity, selectedSize: i.selectedSize, selectedColor: i.selectedColor }));

export const fetchQuote = (cart: CartItem[], couponCode?: string | null) =>
  postJSON<Quote>(API_ENDPOINTS.ORDERS.QUOTE, { orderItems: toOrderItems(cart), couponCode: couponCode || undefined });

let razorpayScript: Promise<boolean> | null = null;
export const loadRazorpay = () => {
  if ((window as unknown as { Razorpay?: unknown }).Razorpay) return Promise.resolve(true);
  razorpayScript ??= new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => { razorpayScript = null; resolve(false); };
    document.body.appendChild(script);
  });
  return razorpayScript;
};

export const getPaymentConfig = () =>
  fetchJSON<{ keyId: string | null; mock: boolean; enabled: boolean }>(API_ENDPOINTS.PAYMENT.CONFIG);
