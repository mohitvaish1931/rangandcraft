/**
 * SEO Configuration - Global constants and settings
 * Update these values to match your site's information
 */

export const SEO_CONFIG = {
  // Site Information
  siteName: 'RANG AND CRAFT',
  siteUrl: 'https://rangandcraft.store',
  siteDescription: 'Premium luxury clothing collection with premium sarees, suits, and ethnic wear and more',
  siteLogo: 'https://rangandcraft.store/logo.png',
  
  // Business Information
  business: {
    name: 'RANG AND CRAFT',
    type: 'LocalBusiness',
    description: 'Premium Luxury Clothing Retailer',
    priceRange: '₹₹₹',
    areaServed: 'IN',
    email: 'rangandcraft@gmail.com',
    phone: '+91 93513 25459',
    address: {
      streetAddress: 'Pahadiya chowk',
      addressLocality: 'Jaipur',
      addressRegion: 'Rajasthan',
      postalCode: '302002',
      addressCountry: 'IN'
    }
  },

  // Social Media
  socialProfiles: {
    facebook: 'https://www.facebook.com/rangandcraft',
    instagram: 'https://www.instagram.com/rangandcraft',
    twitter: 'https://twitter.com/rangandcraft',
    linkedin: 'https://www.linkedin.com/company/rangandcraft-fashion',
    youtube: 'https://www.youtube.com/channel/rangandcraft'
  },

  // Default Meta Information
  defaultMeta: {
    title: 'RANG AND CRAFT - Premium Luxury Clothing Collection | Sarees, Suits & Ethnic Wear',
    description: 'Shop RANG AND CRAFT\' exquisite luxury clothing collection. Premium sarees, suits, and dresses & more. Timeless elegance with finest craftsmanship. Explore our 100% authentic collection now.',
    keywords: 'luxury clothing, premium sarees, suits, and dresses, fine clothing, designer clothing, luxury accessories, authentic clothing, clothing collection'
  },

  // Page-Specific Meta
  pages: {
    home: {
      title: 'RANG AND CRAFT - Premium Luxury Clothing Collection | Shop Now',
      description: 'Discover RANG AND CRAFT\' exquisite luxury clothing collection. Premium sarees, suits, and dresses & more. Timeless elegance with finest craftsmanship. Shop 100% authentic clothing today.',
      keywords: 'luxury clothing, premium clothing collection, sarees, suits, and dresses, luxury accessories, designer clothing, fine clothing, authentic clothing'
    },
    products: {
      title: 'All Products - RANG AND CRAFT Premium Clothing Collection',
      description: 'Browse our complete collection of premium luxury clothing. Find the perfect sarees, suits, and dresses and more from RANG AND CRAFT.',
      keywords: 'all products, clothing collection, sarees, suits, and dresses, luxury clothing, premium accessories'
    },
    shortKurtas: {
      title: 'Premium Short Kurtas - RANG AND CRAFT Luxury Ethnic Wear',
      description: 'Discover our elegant Short Kurtas. Premium designs crafted with finest fabrics, hand-embroidery, and traditional Jaipur prints.',
      keywords: 'kurta sets, luxury kurtas, designer kurta sets, ethnic wear, jaipur kurtas, handcrafted kurta'
    },
    suits: {
      title: 'Designer Suits Collection - RANG AND CRAFT Luxury Clothing',
      description: 'Explore RANG AND CRAFT\' stunning collection of designer suits. From gotta patti to zari work, find perfect ensembles for every festive event.',
      keywords: 'designer suits, luxury suits, embroidered suits, gotta patti suits, sharara suits, traditional suits'
    },
    sarees: {
      title: 'Royal Sarees Collection - RANG AND CRAFT Luxury Wear',
      description: 'Shop our royal sarees collection featuring premium silk, georgette, and organza sarees with intricate borders and handloom craftsmanship.',
      keywords: 'sarees, luxury sarees, designer sarees, silk sarees, banarasi sarees, jaipur handloom sarees'
    },
    lehengas: {
      title: 'Exquisite Men's Suits - RANG AND CRAFT Luxury Ethnic Edit',
      description: 'Find your dream wedding suit at RANG AND CRAFT. Intricate embroidery, royal textures, and timeless ethnic silhouettes crafted for your precious moments.',
      keywords: 'wedding suits, luxury sherwanis, ethnic wear, men's kurtas, hand-embroidered suits'
    },
    contact: {
      title: 'Contact Us - RANG AND CRAFT Premium Clothing',
      description: 'Get in touch with RANG AND CRAFT. We\'re here to help with your clothing inquiries, orders, and customer service.',
      keywords: 'contact us, customer service, clothing support, RANG AND CRAFT contact'
    },
    trackOrder: {
      title: 'Track Your Order - RANG AND CRAFT Clothing Delivery Status',
      description: 'Track your RANG AND CRAFT clothing order in real-time. Get live updates on your shipment status, delivery date and package location.',
      keywords: 'track order, order tracking, clothing delivery, shipment status, order status'
    },
    profile: {
      title: 'My Profile - RANG AND CRAFT Clothing',
      description: 'Manage your profile, view orders, cart and wishlist on RANG AND CRAFT.',
      keywords: 'profile, orders, wishlist, cart, account management'
    }
  },

  // Robots & Crawling Rules
  robots: {
    index: 'index, follow',
    maxSnippet: -1,
    maxImagePreview: 'large',
    maxVideoPreview: -1
  },

  // OG Tags Defaults
  ogType: 'website',
  ogLocale: 'en_US',

  // Twitter Card Type
  twitterCardType: 'summary_large_image',

  // Verification Codes (Update with your actual codes)
  verification: {
    google: '498e7d065d63f257', // Added Google verification ID
    bing: '', // Add your Bing verification code
    pinterest: '', // Add your Pinterest verification code
  },

  // Sitemap Configuration
  sitemap: {
    homepage: {
      priority: 1.0,
      changefreq: 'weekly'
    },
    products: {
      priority: 0.9,
      changefreq: 'daily'
    },
    categories: {
      priority: 0.8,
      changefreq: 'weekly'
    },
    supportPages: {
      priority: 0.7,
      changefreq: 'monthly'
    }
  },

  // Analytics
  analytics: {
    googleAnalyticsId: 'G-XXXXXXXXXX', // Update with your GA4 ID
    googleSearchConsoleId: '498e7d065d63f257', // Added GSC property ID
  },

  // Canonical Base URL
  canonicalBase: 'https://rangandcraft.store',

  // OpenSearch Description
  openSearchUrl: '/opensearch.xml',

  // PWA Configuration (if using PWA)
  pwa: {
    manifestUrl: '/manifest.json',
    themeColor: '#1a1a1a',
    backgroundColor: '#ffffff'
  }
};

/**
 * Helper function to get page-specific SEO metadata
 */
export const getPageSEO = (page: keyof typeof SEO_CONFIG.pages) => {
  return SEO_CONFIG.pages[page] || SEO_CONFIG.defaultMeta;
};

/**
 * Generate full URL for a page
 */
export const getPageUrl = (path: string) => {
  return `${SEO_CONFIG.canonicalBase}${path}`;
};

/**
 * Get social profile URL by platform
 */
export const getSocialUrl = (platform: keyof typeof SEO_CONFIG.socialProfiles) => {
  return SEO_CONFIG.socialProfiles[platform];
};

/**
 * Generate Business JSON-LD when needed
 */
export const getBusinessSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': SEO_CONFIG.business.type,
    name: SEO_CONFIG.business.name,
    description: SEO_CONFIG.business.description,
    url: SEO_CONFIG.siteUrl,
    email: SEO_CONFIG.business.email,
    ...(SEO_CONFIG.business.phone && { telephone: SEO_CONFIG.business.phone }),
    ...(SEO_CONFIG.business.address && {
      address: {
        '@type': 'PostalAddress',
        ...SEO_CONFIG.business.address
      }
    }),
    sameAs: Object.values(SEO_CONFIG.socialProfiles).filter(url => url),
    logo: SEO_CONFIG.siteLogo,
    image: SEO_CONFIG.siteLogo
  };
};
