import { Link } from 'react-router-dom';
import { BadgeCheck, MessageSquareHeart } from 'lucide-react';
import Seo from '../components/Seo';
import { Stars } from '../components/StarRating';
import { useLatestReviews } from '../lib/useLatestReviews';
import { formatDate } from '../lib/format';
import { getImageUrl } from '../utils/mediaHelper';

const Reviews = () => {
  const { data, loading } = useLatestReviews(50);
  const reviews = data?.reviews ?? [];

  return (
    <>
      <Seo title="Customer Reviews" description="Read what customers say about Rang and Craft kurtas and shirts." path="/reviews" />
      <header className="rc-page-head">
        <div className="rc-container">
          <span className="rc-eyebrow">Customer love</span>
          <h1 className="rc-h1">Reviews</h1>
          {data && data.totalReviews > 0 ? (
            <p className="rc-rating" style={{ fontSize: 15, marginTop: 12 }}>
              <Stars value={data.averageRating} size={18} /> {data.averageRating.toFixed(1)} average from {data.totalReviews} review{data.totalReviews === 1 ? '' : 's'}
            </p>
          ) : (
            <p className="rc-lead">Honest words from the people who wear Rang and Craft.</p>
          )}
        </div>
      </header>

      <div className="rc-container rc-section" style={{ paddingTop: 40 }}>
        {loading ? (
          <div className="rc-quotes">{[0, 1, 2].map((i) => <div key={i} className="rc-skeleton" style={{ height: 220, borderRadius: 18 }} />)}</div>
        ) : reviews.length === 0 ? (
          <div className="rc-empty">
            <MessageSquareHeart size={44} strokeWidth={1.2} />
            <h2 className="rc-h3">Reviews are on their way</h2>
            <p>Bought from us? We’d love to hear from you — open the product page and tap “Write a review”.</p>
            <Link to="/shop" className="rc-btn">Shop the collection</Link>
          </div>
        ) : (
          <div className="rc-quotes" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {reviews.map((r) => (
              <figure className="rc-quote" key={r._id} style={{ display: 'flex' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stars value={r.rating} />
                  <span className="rc-muted" style={{ fontSize: 12 }}>{formatDate(r.createdAt)}</span>
                </div>
                <strong style={{ fontWeight: 500 }}>{r.title}</strong>
                <blockquote style={{ fontSize: '1.2rem' }}>“{r.comment}”</blockquote>
                <figcaption style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {r.productId?.image && <img src={getImageUrl(r.productId.image, 80)} alt="" style={{ width: 40, height: 50, objectFit: 'cover', borderRadius: 4 }} />}
                  <span>
                    <strong>{r.userName}</strong> {r.verified && <span className="rc-verified"><BadgeCheck size={13} /> Verified buyer</span>}
                    {r.productId && <><br /><Link to={`/product/${r.productId._id}`}>{r.productId.name}</Link></>}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Reviews;
