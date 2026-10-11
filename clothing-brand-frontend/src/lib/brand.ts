export const WHATSAPP_NUMBER = '919828152444';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const whatsappLink = (message: string) => `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
export const SUPPORT_PHONE = '+91 93513 25459';
export const SUPPORT_EMAIL = 'rangandcraft.fashion.jaipur@gmail.com';
// Keep the name, address and phone identical everywhere (site, invoices, Google Merchant Center).
export const BUSINESS_NAME = 'Rang and Craft';
export const BUSINESS_ADDRESS = '455, Mandhi Khatikan, Pahadiya Chowk, Jaipur - 302002, Rajasthan, India';

export const ANNOUNCEMENTS = [
  'Any 2 short kurtas @ flat ₹1499',
  'Any 2 half sleeve shirts @ flat ₹1499',
  'Free shipping on orders above ₹1499',
  '7-day size exchange on unworn pieces',
  'Hand block printed cotton from Jaipur',
];

/** Messages for the scrolling bar: saved announcements, or the built-in ones when none are saved. */
export const announcementTexts = (banners: { text?: string }[]) => {
  const saved = banners.map((b) => (b.text || '').trim()).filter(Boolean);
  return saved.length ? saved : ANNOUNCEMENTS;
};
