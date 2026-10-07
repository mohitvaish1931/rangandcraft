import type { CartItem } from '../context/AppContext';

// Mirrors clothing-brand-backend/utils/pricing.js. The server is the source of
// truth at checkout; this powers live previews in the bag.
export const SHIPPING_FEE = 70;
export const FREE_SHIPPING_THRESHOLD = 1499;

export const BUNDLE_OFFERS = [
  { id: 'short-kurtas-2', label: 'Any 2 short kurtas @ ₹1499', noun: 'short kurta', match: /short\s*kurta/i, size: 2, price: 1499 },
  { id: 'half-sleeve-2', label: 'Any 2 half sleeve shirts @ ₹1499', noun: 'half sleeve shirt', match: /half\s*sleeve/i, size: 2, price: 1499 },
];

export interface BagEstimate {
  itemsPrice: number;
  offerDiscount: number;
  shippingPrice: number;
  total: number;
  /** Amount still needed for free shipping (0 when unlocked). */
  toFreeShipping: number;
  /** An offer the shopper is one item away from. */
  nudge: { label: string; noun: string; category: string } | null;
}

export const estimateBag = (cart: CartItem[]): BagEstimate => {
  const itemsPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  let offerDiscount = 0;
  let nudge: BagEstimate['nudge'] = null;

  for (const offer of BUNDLE_OFFERS) {
    const matching = cart.filter((i) => offer.match.test(i.category || ''));
    const units = matching
      .flatMap((i) => Array.from({ length: i.quantity }, () => i.price))
      .sort((a, b) => b - a);
    for (let k = 0; k + offer.size <= units.length; k += offer.size) {
      const full = units.slice(k, k + offer.size).reduce((s, p) => s + p, 0);
      if (full <= offer.price) break;
      offerDiscount += full - offer.price;
    }
    if (!nudge && units.length % offer.size === offer.size - 1 && units[units.length - 1] * offer.size > offer.price) {
      nudge = { label: offer.label, noun: offer.noun, category: matching[0].category || '' };
    }
  }

  const merchandise = itemsPrice - offerDiscount;
  const shippingPrice = cart.length === 0 || merchandise >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  return {
    itemsPrice,
    offerDiscount,
    shippingPrice,
    total: merchandise + shippingPrice,
    toFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - merchandise),
    nudge,
  };
};
