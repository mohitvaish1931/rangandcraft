import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await Product.find({}).select('_id updatedAt');

    const baseUrl = 'https://rangandcraft.store';
    
    // Static pages
    const staticPages = [
      '',
      '/shop',
      '/about',
      '/contact',
      '/faq',
      '/privacy-policy',
      '/terms-conditions',
      '/shipping-policy',
      '/refund-policy',
      '/care-guide'
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Add static pages
    staticPages.forEach(page => {
      xml += `  <url>\n    <loc>${baseUrl}${page}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
    });

    // Add dynamic product pages
    products.forEach(product => {
      const updatedAt = product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString();
      xml += `  <url>\n    <loc>${baseUrl}/product/${product._id}</loc>\n    <lastmod>${updatedAt}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Server Error generating sitemap');
  }
});

export default router;
