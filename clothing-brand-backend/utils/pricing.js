import { HttpError } from '../middleware/errorMiddleware.js';

export const MAX_QTY_PER_LINE = 10;

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

// Discount is applied only to eligible lines, rounded to the nearest rupee.
export const computeDiscount = (lines, coupon) => {
  if (!coupon) return 0;
  const eligibleSubtotal = lines
    .filter((line) => isLineEligible(coupon, line))
    .reduce((sum, line) => sum + line.price * line.qty, 0);
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
  const discountAmount = Math.min(computeDiscount(lines, coupon), itemsPrice);
  const shippingPrice = 0;
  const taxPrice = 0; // Prices are GST-inclusive.
  return {
    itemsPrice,
    discountAmount,
    shippingPrice,
    taxPrice,
    totalPrice: itemsPrice - discountAmount + shippingPrice + taxPrice,
  };
};
