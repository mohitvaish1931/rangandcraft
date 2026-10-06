import { Helmet } from 'react-helmet-async';

const SITE = 'https://rangandcraft.store';
const DEFAULT_IMAGE = `${SITE}/images/hero-banner.png`;

interface SeoProps {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'product';
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const Seo = ({ title, description, path, image, type = 'website', noindex, jsonLd }: SeoProps) => {
  const fullTitle = title.includes('Rang and Craft') ? title : `${title} | Rang and Craft`;
  const url = path ? `${SITE}${path}` : undefined;
  const img = image && image.startsWith('http') ? image : image ? `${SITE}${image}` : DEFAULT_IMAGE;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {url && <link rel="canonical" href={url} />}
      {noindex && <meta name="robots" content="noindex" />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:image" content={img} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
};

export default Seo;
