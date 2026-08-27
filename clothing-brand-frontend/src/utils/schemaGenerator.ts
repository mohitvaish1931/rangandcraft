/**
 * Schema.org Structured Data Generator
 * Generates JSON-LD structured data for various content types
 */

export interface ProductSchema {
  name: string;
  description: string;
  image: string | string[];
  price: number;
  priceCurrency: string;
  availability: string;
  category: string;
  url: string;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  sku?: string;
}

export interface ArticleSchema {
  title: string;
  image: string;
  datePublished: string;
  dateModified: string;
  author: string;
  description: string;
  url: string;
}

export interface FAQSchema {
  question: string;
  answer: string;
}

/**
 * Generate Product schema for clothing items
 */
export const generateProductSchema = (product: ProductSchema) => {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: Array.isArray(product.image) ? product.image : [product.image],
    brand: {
      '@type': 'Brand',
      name: product.brand || 'RANG AND CRAFT'
    },
    offers: {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: product.priceCurrency,
      price: product.price.toString(),
      availability: `https://schema.org/${product.availability}`
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toString(),
      reviewCount: (product.reviewCount || 0).toString()
    } : undefined,
    sku: product.sku
  };
};

/**
 * Generate Breadcrumb schema for navigation
 */
export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
};

/**
 * Generate FAQ schema
 */
export const generateFAQSchema = (faqs: FAQSchema[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
};

/**
 * Generate Organization schema
 */
export const generateOrganizationSchema = (
  name: string,
  url: string,
  logo: string,
  description: string,
  socialProfiles?: string[]
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    sameAs: socialProfiles || [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: 'en'
    }
  };
};

/**
 * Generate Article schema
 */
export const generateArticleSchema = (article: ArticleSchema) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: {
      '@type': 'Person',
      name: article.author
    },
    description: article.description,
    url: article.url
  };
};

/**
 * Generate LocalBusiness schema
 */
export const generateLocalBusinessSchema = (
  name: string,
  description: string,
  url: string,
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  },
  telephone?: string,
  email?: string
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    description,
    url,
    priceRange: '₹₹₹',
    areaServed: 'IN',
    ...(address && { address: {
      '@type': 'PostalAddress',
      ...address
    }}),
    contactPoint: {
      '@type': 'ContactPoint',
      ...(telephone && { telephone }),
      contactType: 'Customer Service',
      ...(email && { email })
    }
  };
};

/**
 * Generate Event schema (for product launches, sales events, etc.)
 */
export const generateEventSchema = (
  name: string,
  description: string,
  startDate: string,
  endDate: string,
  image: string,
  url: string,
  location?: string
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    description,
    image,
    startDate,
    endDate,
    url,
    ...(location && { location: {
      '@type': 'Place',
      name: location
    }})
  };
};

/**
 * Generate AggregateOffer schema for product collections
 */
export const generateAggregateOfferSchema = (
  name: string,
  description: string,
  image: string,
  lowestPrice: number,
  highestPrice: number,
  offerCount: number,
  priceCurrency: string = 'INR',
  url?: string
) => {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name,
    description,
    image,
    aggregateOffer: {
      '@type': 'AggregateOffer',
      priceCurrency,
      lowPrice: lowestPrice.toString(),
      highPrice: highestPrice.toString(),
      offerCount: offerCount.toString()
    },
    ...(url && { url })
  };
};
