import { HttpError } from '../middleware/errorMiddleware.js';

export const MAX_QTY_PER_LINE = 10;

// Shipping: flat fee below the threshold, free at or above it (merchandise
// value after bundle offers, before coupons).
export const SHIPPING_FEE = 70;
export const FREE_SHIPPING_THRESHOLD = 1499;

// "Any 2 for ₹X" offers advertised on the storefront. Matching is by category.
export const BUNDLE_OFFERS = [
  { id: 'short-kurtas-2', label: 'Any 2 short kurtas @ ₹1499', match: /short\s*kurta/i, size: 2, price: 1499 },
  { id: 'half-sleeve-2', label: 'Any 2 half sleeve shirts @ ₹1499', match: /half\s*sleeve/i, size: 2, price: 1499 },
];

/**
 * Applies bundle offers. Units are grouped most-expensive first so the
 * customer gets the largest saving; a group is only discounted when the
 * bundle price is actually lower. Returns the total saving, the units used
 * per line (those don't also get coupon discounts) and the applied offers.
 */
export const applyBundleOffers = (lines, offers = BUNDLE_OFFERS) => {
  const bundledQty = lines.map(() => 0);
  const applied = [];
  let discount = 0;

  for (const offer of offers) {
    const units = [];
    lines.forEach((line, index) => {
      if (!offer.match.test(line.category || '')) return;
      for (let i = 0; i < line.qty; i++) units.push({ index, price: line.price });
    });
    units.sort((a, b) => b.price - a.price);

    let saving = 0;
    let groups = 0;
    for (let i = 0; i + offer.size <= units.length; i += offer.size) {
      const group = units.slice(i, i + offer.size);
      const full = group.reduce((sum, u) => sum + u.price, 0);
      if (full <= offer.price) break; // later groups are cheaper still
      saving += full - offer.price;
      groups += 1;
      group.forEach((u) => { bundledQty[u.index] += 1; });
    }
    if (groups > 0) {
      discount += saving;
      applied.push({ id: offer.id, label: offer.label, times: groups, saving });
    }
  }

  return { discount, bundledQty, applied };
};

// Returns an error message if the coupon cannot be used right now.
export const couponUnavailableReason = (coupon, now = new Date()) => {
  if (!coupon) return 'Invalid coupon code';
  if (!coupon.active) return 'This coupon is no longer active';
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return 'This coupon has expired';
  if (coupon.usageLimit && (coupon.used || 0) >= coupon.usageLimit) return 'This coupon has reached its usage limit';
  return null;
};

export const isLineEligible = (coupon, line) => {
  if (coupon.productId && String(coupon.productId) !== String(line.product)) return false;
  const categories = coupon.applicableCategories || [];
  if (categories.length > 0 && !categories.includes(line.category)) return false;
  if (coupon.maxPriceThreshold !== null && coupon.maxPriceThreshold !== undefined && line.price > coupon.maxPriceThreshold) {
    return false;
  }
  return true;
};

// Discount is applied only to eligible units (not those already in a bundle),
// rounded to the nearest rupee.
export const computeDiscount = (lines, coupon, bundledQty = []) => {
  if (!coupon) return 0;
  const eligibleSubtotal = lines
    .map((line, index) => ({ line, qty: line.qty - (bundledQty[index] || 0) }))
    .filter(({ line, qty }) => qty > 0 && isLineEligible(coupon, line))
    .reduce((sum, { line, qty }) => sum + line.price * qty, 0);
  return Math.round((eligibleSubtotal * (coupon.discountPercent || 0)) / 100);
};

/**
 * Builds priced order lines from client-submitted cart items, using only
 * product ids, quantities and variant selections from the client. Prices,
 * names and images always come from the database.
 *
 * @param {Array} rawItems  [{ product|_id|id, qty|quantity, selectedSize, selectedColor }]
 * @param {Map<string, object>} productsById
 */
export const buildOrderLines = (rawItems, productsById) => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new HttpError(400, 'Your cart is empty.');
  }
  if (rawItems.length > 50) throw new HttpError(400, 'Too many items in one order.');

  return rawItems.map((item) => {
    const productId = String(item.product || item._id || item.id || '');
    const product = productsById.get(productId);
    if (!product) throw new HttpError(400, 'One of the products in your cart is no longer available.');

    const qty = Math.floor(Number(item.qty ?? item.quantity ?? 1));
    if (!Number.isFinite(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
      throw new HttpError(400, `Quantity for "${product.name}" must be between 1 and ${MAX_QTY_PER_LINE}.`);
    }
    if (product.soldOut || (product.countInStock ?? 0) < qty) {
      throw new HttpError(409, `Sorry, "${product.name}" does not have enough stock.`);
    }

    const selectedSize = typeof item.selectedSize === 'string' ? item.selectedSize.slice(0, 20) : '';
    const selectedColor = typeof item.selectedColor === 'string' ? item.selectedColor.slice(0, 40) : '';
    if (product.sizes?.length && !product.sizes.includes(selectedSize)) {
      throw new HttpError(400, `Please choose a size for "${product.name}".`);
    }

    return {
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      category: product.category,
      qty,
      selectedSize,
      selectedColor,
    };
  });
};

export const priceOrder = (lines, coupon) => {
  const itemsPrice = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const offers = applyBundleOffers(lines);
  const offerDiscount = Math.min(offers.discount, itemsPrice);
  const discountAmount = Math.min(computeDiscount(lines, coupon, offers.bundledQty), itemsPrice - offerDiscount);
  const merchandise = itemsPrice - offerDiscount;
  const shippingPrice = merchandise >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const taxPrice = 0; // Prices are GST-inclusive.
  return {
    itemsPrice,
    offerDiscount,
    appliedOffers: offers.applied,
    discountAmount,
    shippingPrice,
    taxPrice,
    totalPrice: itemsPrice - offerDiscount - discountAmount + shippingPrice + taxPrice,
  };
};
