import { useEffect, useState } from 'react';
import type { Product } from '../context/AppContext';
import { API_ENDPOINTS } from '../utils/api';
import { isSoldOut } from './catalog';
import { productId } from './format';

/**
 * Every photo on the storefront comes from here: hero slides the admin
 * uploads, or photos of the products themselves. Nothing is bundled with the
 * site, so the store always shows what is actually for sale.
 */

export interface Slide {
  _id: string;
  image: string;
  eyebrow?: string;
  title?: string;
  text?: string;
  ctaLabel?: string;
  ctaLink?: string;
  active?: boolean;
  order?: number;
}

/** A catalogue photo together with the product it shows. */
export interface Look { src: string; product: Product }

export const photosOf = (p: Product) => (p.images?.length ? p.images : p.image ? [p.image] : []).filter(Boolean);

// Changes once a day, so pages feel fresh between visits without reshuffling on every render.
const DAY = Math.floor(Date.now() / 86_400_000);

const rotate = <T,>(list: T[], by: number) => {
  if (list.length < 2) return list;
  const k = ((by % list.length) + list.length) % list.length;
  return [...list.slice(k), ...list.slice(0, k)];
};

/** Products that may be featured: shown on the homepage, in stock and with at least one photo. */
export const showcase = (products: Product[]) =>
  products.filter((p) => p.showOnHomepage !== false && !isSoldOut(p) && photosOf(p).length > 0);

/** Interleaves categories so a row of looks never shows three pieces of the same kind. */
const spreadByCategory = (products: Product[]) => {
  const queues = new Map<string, Product[]>();
  for (const p of products) queues.set(p.category || '', [...(queues.get(p.category || '') || []), p]);
  const lists = [...queues.values()];
  const out: Product[] = [];
  while (out.length < products.length) {
    for (const q of lists) {
      const next = q.shift();
      if (next) out.push(next);
    }
  }
  return out;
};

type Shot = number | 'detail';

const photoAt = (p: Product, shot: Shot) => {
  const photos = photosOf(p);
  // Shoots usually end with a close-up and then the back view, so 'detail' is the second-to-last.
  const i = shot === 'detail' ? Math.max(0, photos.length - 2) : Math.min(shot, photos.length - 1);
  return photos[i];
};

interface PickOptions {
  /** Which photo of each product: an index, or 'detail' for a close-up. */
  shot?: Shot;
  /** Varies the daily rotation so different sections don't feature the same pieces. */
  salt?: number;
  /** Products already used elsewhere on the page. */
  exclude?: Look[];
}

/** Up to `count` looks from different products, spread across categories. */
export const pickLooks = (products: Product[], count: number, { shot = 0, salt = 0, exclude = [] }: PickOptions = {}): Look[] => {
  const used = new Set(exclude.map((l) => productId(l.product)));
  let pool = showcase(products).filter((p) => !used.has(productId(p)));
  if (pool.length < count) pool = showcase(products); // small catalogue: allow repeats across sections
  return spreadByCategory(rotate(pool, DAY + salt))
    .slice(0, count)
    .map((product) => ({ src: photoAt(product, shot), product }));
};

/** One category to feature today (among those with a few pieces), with a lead photo and two products. */
export const spotlightOf = (products: Product[]) => {
  const byCategory = new Map<string, Product[]>();
  for (const p of showcase(products)) {
    if (!p.category) continue;
    byCategory.set(p.category, [...(byCategory.get(p.category) || []), p]);
  }
  const candidates = [...byCategory.entries()].filter(([, list]) => list.length >= 3);
  const choices = candidates.length ? candidates : [...byCategory.entries()];
  if (!choices.length) return null;
  const [category, list] = choices[DAY % choices.length];
  const items = rotate(list, DAY);
  return { category, count: list.length, look: { src: photoAt(items[0], 1), product: items[0] } as Look, picks: items.slice(1, 3) };
};

/**
 * Every photo in the catalogue: first each product's cover, then each
 * product's second photo, and so on, so neighbouring photos show different pieces.
 */
export const allLooks = (products: Product[]): Look[] => {
  const sets = products.map((product) => ({ product, photos: photosOf(product) }));
  const longest = Math.max(0, ...sets.map((s) => s.photos.length));
  const out: Look[] = [];
  for (let i = 0; i < longest; i += 1) {
    for (const { product, photos } of sets) if (photos[i]) out.push({ src: photos[i], product });
  }
  return out;
};

// Hero slides are fetched once per visit, starting as soon as this module loads.
let slidesRequest: Promise<Slide[]> | null = null;

export const loadSlides = (fresh = false) => {
  if (!slidesRequest || fresh) {
    slidesRequest = fetch(API_ENDPOINTS.SLIDES)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => (Array.isArray(d) ? d : []))
      .catch(() => []);
  }
  return slidesRequest;
};

if (typeof window !== 'undefined') loadSlides();

/** Active hero slides; null until the request settles. */
export const useSlides = () => {
  const [slides, setSlides] = useState<Slide[] | null>(null);
  useEffect(() => {
    let alive = true;
    loadSlides().then((s) => alive && setSlides(s));
    return () => { alive = false; };
  }, []);
  return slides;
};
