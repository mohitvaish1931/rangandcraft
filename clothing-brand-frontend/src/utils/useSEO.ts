import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
  author?: string;
  structuredData?: Record<string, unknown>;
}

export const useSEO = (props: SEOProps) => {
  const { title, description, image, url, type, keywords, author } = props;
  const structuredJson = props.structuredData ? JSON.stringify(props.structuredData) : '';

  useEffect(() => {
    const props = { title, description, image, url, type, keywords, author, structuredData: structuredJson ? JSON.parse(structuredJson) : undefined };
    // Update title
    document.title = props.title;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', props.description);
    
    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords && props.keywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    if (metaKeywords && props.keywords) {
      metaKeywords.setAttribute('content', props.keywords);
    }
    
    // Update author
    if (props.author) {
      let metaAuthor = document.querySelector('meta[name="author"]');
      if (!metaAuthor) {
        metaAuthor = document.createElement('meta');
        metaAuthor.setAttribute('name', 'author');
        document.head.appendChild(metaAuthor);
      }
      metaAuthor.setAttribute('content', props.author);
    }
    
    // Update Open Graph meta tags
    const updateOGTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };
    
    updateOGTag('og:title', props.title);
    updateOGTag('og:description', props.description);
    if (props.image) updateOGTag('og:image', props.image);
    if (props.url) updateOGTag('og:url', props.url);
    if (props.type) updateOGTag('og:type', props.type);
    
    // Update Twitter meta tags
    const updateTwitterTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };
    
    updateTwitterTag('twitter:title', props.title);
    updateTwitterTag('twitter:description', props.description);
    if (props.image) updateTwitterTag('twitter:image', props.image);
    updateTwitterTag('twitter:card', 'summary_large_image');
    
    // Update canonical URL
    const canonicalUrl = props.url || window.location.href;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);
    
    // Update JSON-LD structured data
    if (props.structuredData) {
      let script = document.querySelector('script[data-type="application/ld+json"][data-page="true"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('data-page', 'true');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(props.structuredData);
    }
    
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, [title, description, image, url, type, keywords, author, structuredJson]);
};
