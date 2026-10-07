export const WHATSAPP_NUMBER = '919351325459';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const whatsappLink = (message: string) => `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
export const SUPPORT_PHONE = '+91 93513 25459';
export const SUPPORT_EMAIL = 'rangandcraft.fashion.jaipur@gmail.com';

// Editorial fallbacks when a category has no product photo yet.
export const FALLBACK_IMAGES = [
  '/images/kurta-men.jpg',
  '/images/tops-men.jpg',
  '/images/indowestern-men.jpg',
  '/images/suits-men.jpg',
  '/images/saree-men.jpg',
  '/images/heritage-edit-men.jpg',
];

export const ANNOUNCEMENTS = [
  'Any 2 short kurtas @ flat ₹1499',
  'Any 2 half sleeve shirts @ flat ₹1499',
  'Free shipping on orders above ₹1499',
  'Easy 7-day size exchange',
  '1 lakh+ happy customers',
];
