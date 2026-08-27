import fs from 'fs';

let content = fs.readFileSync('clothing-brand-frontend/src/pages/Contact.tsx', 'utf8');
content = content.replace('bridal shopping!', 'wedding shopping!');
fs.writeFileSync('clothing-brand-frontend/src/pages/Contact.tsx', content);

let seo = fs.readFileSync('clothing-brand-frontend/src/utils/seoConfig.ts', 'utf8');
seo = seo.replace('Exquisite Bridal Lehengas - RANG AND CRAFT Luxury Bridal Edit', "Exquisite Men's Suits - RANG AND CRAFT Luxury Ethnic Edit");
seo = seo.replace('Find your dream bridal lehenga at RANG AND CRAFT. Intricate zardozi, royal zari, and timeless crimson silhouettes crafted for your precious moments.', "Find your dream wedding suit at RANG AND CRAFT. Intricate embroidery, royal textures, and timeless ethnic silhouettes crafted for your precious moments.");
seo = seo.replace('bridal lehenga, luxury lehengas, wedding lehenga, crimson lehenga, hand-embroidered lehenga', "wedding suits, luxury sherwanis, ethnic wear, men's kurtas, hand-embroidered suits");
fs.writeFileSync('clothing-brand-frontend/src/utils/seoConfig.ts', seo);
