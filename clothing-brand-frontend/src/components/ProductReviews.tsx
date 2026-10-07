import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BadgeCheck, MessageSquareText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { API_ENDPOINTS, postJSON } from '../utils/api';
import { errorMessage, formatDate } from '../lib/format';
import { useToast } from '../lib/toast';
import { StarInput, Stars } from './StarRating';

interface Review {
  _id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verified?: boolean;
  helpful?: number;
  createdAt: string;
}

interface ReviewData {
  reviews: Review[];
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'highest', label: 'Highest rated' },
  { value: 'lowest', label: 'Lowest rated' },
  { value: 'helpful', label: 'Most helpful' },
];

const ProductReviews = ({ productId, productName }: { productId: string; productName: string }) => {
  const { state } = useAppContext();
  const location = useLocation();
  const toast = useToast();
  const [data, setData] = useState<ReviewData | null>(null);
  const [sort, setSort] = useState('newest');
  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [helped, setHelped] = useState<Set<string>>(new Set());

  const load = useCallback(() => {
    fetch(`${API_ENDPOINTS.REVIEWS}/product/${productId}?sort=${sort}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setData(d))
      .catch(() => {});
  }, [productId, sort]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { setError('Please choose a star rating.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await postJSON(API_ENDPOINTS.REVIEWS, { productId, rating, title, comment });
      setSubmitted(true);
      toast.success('Thank you! Your review will appear once approved.');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const markHelpful = async (id: string) => {
    if (helped.has(id)) return;
    setHelped(new Set(helped).add(id));
    try {
      const res = await postJSON<{ helpful: number }>(`${API_ENDPOINTS.REVIEWS}/${id}/helpful`, {}, 'PUT');
      setData((d) => d && { ...d, reviews: d.reviews.map((r) => (r._id === id ? { ...r, helpful: res.helpful } : r)) });
    } catch {
      // Non-critical.
    }
  };

  const total = data?.totalReviews ?? 0;
  const avg = data?.averageRating ?? 0;

  return (
    <div className="rc-reviews">
      <aside className="rc-reviews__summary">
        <span className="rc-eyebrow">Reviews</span>
        <h2 className="rc-h2" style={{ marginTop: -6 }}>What customers say</h2>
        {total > 0 ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span className="rc-reviews__score">{avg.toFixed(1)}</span>
              <div><Stars value={avg} size={16} /><div className="rc-muted" style={{ fontSize: 13 }}>{total} review{total === 1 ? '' : 's'}</div></div>
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              {[5, 4, 3, 2, 1].map((n) => {
                const count = data?.ratingDistribution?.[n] ?? 0;
                return (
                  <div key={n} className="rc-bar-row">
                    <span>{n} ★</span>
                    <span className="rc-bar"><span style={{ width: `${total ? (count / total) * 100 : 0}%` }} /></span>
                    <span>{count}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="rc-muted">No reviews yet. Be the first to share how {productName} fits and feels.</p>
        )}
        {!formOpen && !submitted && (
          <button type="button" className="rc-btn rc-btn--outline" onClick={() => setFormOpen(true)}>Write a review</button>
        )}
      </aside>

      <div>
        {(formOpen || submitted) && (
          <div className="rc-panel" style={{ marginBottom: 28 }}>
            {submitted ? (
              <div className="rc-alert rc-alert--success">Thanks for your review! It will be published after a quick check.</div>
            ) : !state.user ? (
              <div style={{ textAlign: 'center', display: 'grid', gap: 12, justifyItems: 'center' }}>
                <MessageSquareText size={32} strokeWidth={1.3} color="var(--rc-gold)" />
                <p>Please sign in to write a review.</p>
                <Link to={`/login?redirect=${encodeURIComponent(location.pathname)}`} className="rc-btn">Sign in</Link>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
                <h3 className="rc-h3">Review {productName}</h3>
                {error && <div className="rc-alert rc-alert--error" role="alert">{error}</div>}
                <div className="rc-field"><span className="rc-label">Your rating</span><StarInput value={rating} onChange={setRating} /></div>
                <div className="rc-field">
                  <label className="rc-label" htmlFor="rv-title">Headline</label>
                  <input id="rv-title" className="rc-input" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Great fit, lovely fabric" />
                </div>
                <div className="rc-field">
                  <label className="rc-label" htmlFor="rv-comment">Your review</label>
                  <textarea id="rv-comment" className="rc-textarea" required maxLength={2000} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was the fit, fabric and colour?" />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="submit" className="rc-btn" disabled={submitting}>{submitting ? <span className="rc-spinner" /> : 'Submit review'}</button>
                  <button type="button" className="rc-btn rc-btn--outline" onClick={() => setFormOpen(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}

        {total > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <label htmlFor="rv-sort" className="rc-sr-only">Sort reviews</label>
              <select id="rv-sort" className="rc-select" style={{ width: 'auto', minHeight: 40 }} value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {data!.reviews.map((r) => (
              <article key={r._id} className="rc-review">
                <div className="rc-review__head">
                  <div>
                    <Stars value={r.rating} />
                    <h3 className="rc-review__title">{r.title}</h3>
                  </div>
                  <span className="rc-muted" style={{ fontSize: 13 }}>{formatDate(r.createdAt)}</span>
                </div>
                <p>{r.comment}</p>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 12, fontSize: 13, flexWrap: 'wrap' }}>
                  <strong style={{ fontWeight: 500 }}>{r.userName}</strong>
                  {r.verified && <span className="rc-verified"><BadgeCheck size={14} /> Verified buyer</span>}
                  <button type="button" className="rc-line__remove" style={{ color: 'var(--rc-ink-soft)' }} onClick={() => markHelpful(r._id)} disabled={helped.has(r._id)}>
                    Helpful{r.helpful ? ` (${r.helpful})` : ''}
                  </button>
                </div>
              </article>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
