import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { installFetchInterceptor } from './utils/api';
// Self-hosted fonts: no render-blocking third-party request, and only the
// subsets a page actually uses (latin, plus latin-ext for ₹) are downloaded.
// Two display faces and two text weights; 500/300 requests resolve to the
// nearest loaded weight, which keeps the first visit light.
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/jost/400.css';
import '@fontsource/jost/500.css';
import displayFont from '@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2?url';
import displayItalicFont from '@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2?url';

// Headline fonts are fetched immediately instead of waiting for text to render.
[displayFont, displayItalicFont].forEach((href) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.type = 'font/woff2';
  link.crossOrigin = 'anonymous';
  link.href = href;
  document.head.appendChild(link);
});
import './index.css';

installFetchInterceptor();

// index.html carries default SEO tags for crawlers that don't run JavaScript
// (WhatsApp, Facebook). Each page renders its own, so drop the defaults to
// avoid duplicate titles and conflicting canonicals.
document.querySelectorAll('[data-static-seo]').forEach((el) => el.remove());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
