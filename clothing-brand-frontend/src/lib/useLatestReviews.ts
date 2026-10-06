import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../utils/api';

export interface PublicReview {
  _id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verified?: boolean;
  createdAt: string;
  productId?: { _id: string; name: string; image?: string } | null;
}

interface LatestReviews {
  reviews: PublicReview[];
  totalReviews: number;
  averageRating: number;
}

export const useLatestReviews = (limit = 12) => {
  const [data, setData] = useState<LatestReviews | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch(`${API_ENDPOINTS.REVIEWS}/latest?limit=${limit}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && setData(d))
      .catch(() => alive && setData(null))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [limit]);

  return { data, loading };
};
