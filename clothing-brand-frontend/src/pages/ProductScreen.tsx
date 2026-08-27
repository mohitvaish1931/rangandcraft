import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './ProductStyles.css';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, RefreshCcw, Star } from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL } from '../utils/api';
import { getImageUrl } from '../utils/mediaHelper';
import { useAppContext } from '../context/AppContext';
import { Helmet } from 'react-helmet-async';

// Helper component for star ratings
const StarRating = ({ rating, size = 16, interactive = false, onChange }: { rating: number, size?: number, interactive?: boolean, onChange?: (r: number) => void }) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  
  return (
    <div style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = hoverRating !== null ? star <= hoverRating : star <= rating;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(null)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: interactive ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: fill ? '#c48f56' : '#E2E8F0',
              transition: 'color 0.1s ease',
              outline: 'none'
            }}
          >
            <Star size={size} fill={fill ? '#c48f56' : 'none'} strokeWidth={1.5} />
          </button>
        );
      })}
    </div>
  );
};

const ReviewsTab = ({ productId }: { productId: string }) => {
  const { state } = useAppContext();
  const [reviews, setReviews] = useState<any[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<any>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Review Form State
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/product/${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      setReviews(data.reviews || []);
      setTotalReviews(data.totalReviews || 0);
      setRatingDistribution(data.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formComment.trim()) {
      setSubmitError('Please fill out all fields');
      return;
    }
    
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId,
          rating: formRating,
          title: formTitle,
          comment: formComment
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSubmitSuccess(true);
      setFormTitle('');
      setFormComment('');
      setFormRating(5);
      // Refresh list
      fetchReviews();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit review');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', marginBottom: '40px' }}>
        {/* Rating Summary */}
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '20px', border: '1px solid #f0f0f0', textAlign: 'center' }}>
          <h4 style={{ fontSize: '1.1rem', color: '#295454', fontWeight: '800', marginBottom: '15px', letterSpacing: '1px' }}>AVERAGE RATING</h4>
          <span style={{ fontSize: '3.5rem', fontWeight: '800', color: '#295454', display: 'block', lineHeight: '1' }}>{averageRating}</span>
          <div style={{ margin: '10px 0' }}>
            <StarRating rating={Math.round(parseFloat(averageRating))} size={20} />
          </div>
          <span style={{ color: '#888', fontSize: '0.85rem' }}>Based on {totalReviews} reviews</span>
        </div>

        {/* Rating Breakdown */}
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '20px', border: '1px solid #f0f0f0' }}>
          <h4 style={{ fontSize: '1rem', color: '#295454', fontWeight: '800', marginBottom: '15px', letterSpacing: '1px' }}>RATING DISTRIBUTION</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingDistribution[stars] || 0;
              const percent = getPercentage(count);
              return (
                <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                  <span style={{ width: '45px', color: '#295454', fontWeight: '700' }}>{stars} Star</span>
                  <div style={{ flex: 1, height: '8px', backgroundColor: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percent}%`, backgroundColor: '#c48f56', borderRadius: '4px' }}></div>
                  </div>
                  <span style={{ width: '30px', color: '#888', textAlign: 'right' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Write a Review Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #f0f0f0', paddingBottom: '20px' }}>
        <h3 className="font-serif" style={{ fontSize: '1.8rem', color: '#295454', margin: 0 }}>Customer Reviews</h3>
        {!writeReviewOpen && (
          <button
            onClick={() => setWriteReviewOpen(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#295454',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '800',
              fontSize: '0.8rem',
              letterSpacing: '1px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(45,10,78,0.1)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            WRITE A REVIEW
          </button>
        )}
      </div>

      {/* Review Writing Form */}
      {writeReviewOpen && (
        <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #f0f0f0', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h4 style={{ fontSize: '1.2rem', color: '#295454', fontWeight: '800', letterSpacing: '1px' }}>SHARE YOUR EXPERIENCE</h4>
            <button 
              onClick={() => { setWriteReviewOpen(false); setSubmitSuccess(false); setSubmitError(null); }}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}
            >
              &times;
            </button>
          </div>

          {!state.user ? (
            <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#f9f9f9', borderRadius: '16px', border: '1px dashed #ddd' }}>
              <p style={{ color: '#666', marginBottom: '20px' }}>You must be signed in to submit a product review.</p>
              <Link
                to="/login"
                style={{
                  display: 'inline-block',
                  padding: '12px 30px',
                  backgroundColor: '#295454',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '0.8rem',
                  letterSpacing: '1px'
                }}
              >
                SIGN IN TO YOUR ACCOUNT
              </Link>
            </div>
          ) : submitSuccess ? (
            <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#F0FDF4', color: '#15803D', borderRadius: '16px', border: '1px solid #BBF7D0' }}>
              <p style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '10px' }}>Review Submitted Successfully!</p>
              <p style={{ fontSize: '0.9rem' }}>Thank you for sharing your feedback. Your review has been submitted and is pending administrator approval.</p>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit}>
              {submitError && (
                <div style={{ padding: '12px 20px', backgroundColor: '#FFF5F5', color: '#C53030', borderRadius: '8px', border: '1px solid #FED7D7', marginBottom: '20px', fontSize: '0.85rem' }}>
                  {submitError}
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: '800', color: '#295454', letterSpacing: '1px' }}>YOUR RATING</label>
                <StarRating rating={formRating} size={24} interactive={true} onChange={setFormRating} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: '800', color: '#295454', letterSpacing: '1px' }}>REVIEW TITLE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Beautiful fabric and fit!"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: '800', color: '#295454', letterSpacing: '1px' }}>REVIEW DETAILS</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write your review here. What did you like or dislike? How was the sizing?"
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '0.95rem', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                style={{
                  padding: '15px 30px',
                  backgroundColor: '#295454',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '800',
                  letterSpacing: '1.5px',
                  cursor: submitLoading ? 'not-allowed' : 'pointer',
                  opacity: submitLoading ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(45,10,78,0.1)'
                }}
              >
                {submitLoading ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <div className="loader-spinner" style={{ border: '3px solid #f3f3f3', borderTop: '3px solid #295454', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        </div>
      ) : error ? (
        <p style={{ color: '#C53030', textAlign: 'center' }}>Error loading reviews: {error}</p>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed #eee', borderRadius: '12px' }}>
          <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {reviews.map((rev: any) => (
            <div key={rev._id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <h5 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#295454', margin: '0 0 5px' }}>{rev.title}</h5>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <StarRating rating={rev.rating} size={14} />
                    <span style={{ fontSize: '0.85rem', color: '#295454', fontWeight: '700' }}>by {rev.userName || 'Anonymous'}</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <p style={{ color: '#555', lineHeight: '1.6', fontSize: '0.95rem', margin: 0 }}>{rev.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>('');
  
  // Selection states
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setProduct(data);
        setSelectedImage(data.image || '');
        
        // Auto-select size/color if they only have 1 option
        if (data.sizes && data.sizes.length === 1) {
          setSelectedSize(data.sizes[0]);
        }
        if (data.colors && data.colors.length === 1) {
          setSelectedColor(data.colors[0]);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error fetching product or backend not running');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const addToCartHandler = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    navigate(`/cart/${id}?qty=${qty}&size=${selectedSize}&color=${selectedColor}`);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setSizeError(false);
  };

  const productRating = product.rating !== undefined ? product.rating : (product.averageRating || 0);
  const productReviewsCount = product.numReviews !== undefined ? product.numReviews : (product.reviewCount || 0);

  return (
    <div className="product-page-detail" style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', padding: '60px 20px 100px' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Link to="/shop" style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '10px', 
          color: '#295454', 
          textDecoration: 'none', 
          fontWeight: '800', 
          fontSize: '0.75rem', 
          letterSpacing: '2px', 
          marginBottom: '40px',
          textTransform: 'uppercase'
        }}>
          <ArrowLeft size={16} /> BACK TO COLLECTION
        </Link>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
             <div className="loader-spinner" style={{ border: '3px solid #f3f3f3', borderTop: '3px solid #295454', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#FFF5F5', borderRadius: '24px', border: '1px solid #FED7D7' }}>
             <p style={{ color: '#C53030' }}>{error}</p>
          </div>
        ) : (
          <>
            {/* @ts-ignore */}
            <Helmet>
              <title>{`${product.name} | Rang and Craft`}</title>
              <meta name="description" content={product.description ? product.description.substring(0, 150) + '...' : ''} />
              <meta property="og:title" content={`${product.name} | Rang and Craft`} />
              <meta property="og:description" content={product.description ? product.description.substring(0, 150) + '...' : ''} />
              <meta property="og:image" content={product.image} />
              <script type="application/ld+json">
                {`
                  {
                    "@context": "https://schema.org/",
                    "@type": "Product",
                    "name": "${product.name}",
                    "image": [
                      "${product.image}"
                    ],
                    "description": "${product.description ? product.description.replace(/\\n/g, ' ').replace(/"/g, '\\"') : ''}",
                    "sku": "${product._id}",
                    "brand": {
                      "@type": "Brand",
                      "name": "Rang and Craft"
                    },
                    "offers": {
                      "@type": "Offer",
                      "url": "https://rangandcraft.store/product/${product._id}",
                      "priceCurrency": "INR",
                      "price": "${product.price}",
                      "itemCondition": "https://schema.org/NewCondition",
                      "availability": "${product.countInStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'}"
                    }
                  }
                `}
              </script>
            </Helmet>
            <div className="product-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '60px' }}>
              {/* Image Section */}
              <div className="product-image-section">
                <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
                   <img src={getImageUrl(selectedImage || product.image, 1200)} alt={product.name} style={{ width: '100%', display: 'block' }} loading="eager" fetchPriority="high" />
                   {product.countInStock === 0 && (
                     <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ backgroundColor: '#295454', color: '#fff', padding: '10px 25px', borderRadius: '50px', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '2px' }}>SOLD OUT</span>
                     </div>
                   )}
                </div>
                
                {/* Image Gallery Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    marginTop: '20px', 
                    overflowX: 'auto', 
                    paddingBottom: '10px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#295454 #f9f9f9'
                  }}>
                    {product.images.map((imgUrl: string, idx: number) => (
                      <button 
                        key={idx}
                        onClick={() => setSelectedImage(imgUrl)}
                        style={{
                          border: selectedImage === imgUrl ? '2px solid #295454' : '2px solid transparent',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          padding: 0,
                          cursor: 'pointer',
                          backgroundColor: 'transparent',
                          width: '70px',
                          height: '70px',
                          flexShrink: 0,
                          transition: 'all 0.2s ease',
                          opacity: selectedImage === imgUrl ? 1 : 0.7,
                          boxShadow: selectedImage === imgUrl ? '0 4px 10px rgba(45,10,78,0.15)' : 'none'
                        }}
                        onMouseOver={(e) => {
                          if (selectedImage !== imgUrl) {
                            e.currentTarget.style.opacity = '1';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (selectedImage !== imgUrl) {
                            e.currentTarget.style.opacity = '0.7';
                          }
                        }}
                      >
                        <img src={getImageUrl(imgUrl, 400)} alt={`${product.name} detail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Info Section */}
              <div className="product-info-section">
                <span style={{ color: '#c48f56', letterSpacing: '4px', fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '15px' }}>{product.category}</span>
                <h1 className="font-serif" style={{ fontSize: '3rem', color: '#295454', marginBottom: '10px', lineHeight: '1.2' }}>{product.name}</h1>
                
                {/* Rating summary below title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <StarRating rating={Math.round(productRating)} size={16} />
                  <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>
                    ({productReviewsCount} reviews)
                  </span>
                </div>

                <div style={{ marginBottom: '30px' }}>
                   <span style={{ fontSize: '2rem', fontWeight: '800', color: '#295454' }}>₹{product.price?.toLocaleString('en-IN')}</span>
                   <span style={{ marginLeft: '15px', color: '#999', fontSize: '0.9rem', textDecoration: 'line-through' }}>₹{(product.price * 1.2).toLocaleString('en-IN')}</span>
                </div>

                <div style={{ color: '#666', lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '40px', borderBottom: '1px solid #f0f0f0', paddingBottom: '30px' }}>
                  <p>{product.description}</p>
                </div>

                {/* Purchase Card */}
                <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '20px', border: '1px solid #f0f0f0', marginBottom: '40px' }}>
                   {product.countInStock > 0 ? (
                     <>
                      {/* Sizes Selection */}
                      {product.sizes && product.sizes.length > 0 && (
                        <div style={{ marginBottom: '25px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontWeight: '800', color: '#295454', fontSize: '0.85rem', letterSpacing: '1px' }}>SELECT SIZE</span>
                            <button
                              type="button"
                              onClick={() => setShowSizeGuide(true)}
                              style={{ background: 'none', border: 'none', color: '#c48f56', fontWeight: '800', fontSize: '0.75rem', letterSpacing: '1px', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                              SIZE GUIDE
                            </button>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {product.sizes.map((size: string) => (
                              <button
                                key={size}
                                type="button"
                                onClick={() => handleSizeSelect(size)}
                                style={{
                                  padding: '10px 18px',
                                  borderRadius: '8px',
                                  border: selectedSize === size ? '2px solid #295454' : '1px solid #ddd',
                                  backgroundColor: selectedSize === size ? '#295454' : '#fff',
                                  color: selectedSize === size ? '#fff' : '#295454',
                                  fontWeight: '800',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  minWidth: '50px',
                                  textAlign: 'center'
                                }}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                          {sizeError && (
                            <p style={{ color: '#C53030', fontSize: '0.8rem', fontWeight: '700', marginTop: '8px', margin: '8px 0 0 0' }}>Please select a size before adding to collection.</p>
                          )}
                        </div>
                      )}

                      {/* Colors Selection */}
                      {product.colors && product.colors.length > 0 && (
                        <div style={{ marginBottom: '25px' }}>
                          <span style={{ display: 'block', fontWeight: '800', color: '#295454', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '10px' }}>SELECT COLOR</span>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {product.colors.map((color: string) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setSelectedColor(color)}
                                style={{
                                  padding: '8px 16px',
                                  borderRadius: '20px',
                                  border: selectedColor === color ? '2px solid #295454' : '1px solid #ddd',
                                  backgroundColor: selectedColor === color ? '#295454' : '#fcfcfc',
                                  color: selectedColor === color ? '#fff' : '#555',
                                  fontWeight: '700',
                                  fontSize: '0.85rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {color}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quantity Selector */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <span style={{ fontWeight: '800', color: '#295454', fontSize: '0.85rem', letterSpacing: '1px' }}>SELECT QUANTITY</span>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                          <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ padding: '10px 15px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '800' }}>-</button>
                          <span style={{ padding: '10px 20px', backgroundColor: '#f9f9f9', minWidth: '40px', textAlign: 'center', fontWeight: '800' }}>{qty}</span>
                          <button onClick={() => setQty(Math.min(product.countInStock, qty + 1))} style={{ padding: '10px 15px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '800' }}>+</button>
                        </div>
                      </div>
                      <button 
                        onClick={addToCartHandler}
                        style={{ 
                          width: '100%', 
                          padding: '20px', 
                          backgroundColor: '#295454', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '12px', 
                          fontWeight: '800', 
                          letterSpacing: '2px', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px',
                          boxShadow: '0 10px 30px rgba(45,10,78,0.1)'
                        }}
                      >
                        <ShoppingCart size={20} /> ADD TO COLLECTION
                      </button>
                     </>
                   ) : (
                     <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <p style={{ color: '#C53030', fontWeight: '800', letterSpacing: '1px' }}>WE ARE CURRENTLY OUT OF STOCK</p>
                        <button disabled style={{ width: '100%', padding: '18px', backgroundColor: '#eee', color: '#999', border: 'none', borderRadius: '12px', marginTop: '15px', fontWeight: '800' }}>NOTIFY ME</button>
                     </div>
                   )}
                </div>

                {/* USP Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '20px' }}>
                   <div style={{ textAlign: 'center' }}>
                      <ShieldCheck size={24} color="#c48f56" style={{ marginBottom: '10px' }} />
                      <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#295454', letterSpacing: '1px' }}>SECURE PAYMENT</p>
                   </div>
                   <div style={{ textAlign: 'center' }}>
                      <Truck size={24} color="#c48f56" style={{ marginBottom: '10px' }} />
                      <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#295454', letterSpacing: '1px' }}>FREE DELIVERY</p>
                   </div>
                   <div style={{ textAlign: 'center' }}>
                      <RefreshCcw size={24} color="#c48f56" style={{ marginBottom: '10px' }} />
                      <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#295454', letterSpacing: '1px' }}>EASY EXCHANGE</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Detailed Information Sections (Stacked) */}
            <div className="product-details-stacked" style={{ marginTop: '80px', borderTop: '1px solid #eee', paddingTop: '60px' }}>
              <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '60px' }}>
                
                {/* 1. Specifications Section */}
                <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '40px' }}>
                  <span style={{ color: '#c48f56', letterSpacing: '4px', fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>DETAILS</span>
                  <h3 className="font-serif" style={{ fontSize: '2rem', color: '#295454', marginBottom: '25px', marginTop: 0 }}>Specifications</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f8f8f8' }}>
                        <td style={{ padding: '15px 0', color: '#999', width: '35%', fontWeight: '600' }}>Category</td>
                        <td style={{ padding: '15px 0', color: '#295454', fontWeight: '700' }}>{product.category}</td>
                      </tr>
                      {product.subcategory && (
                        <tr style={{ borderBottom: '1px solid #f8f8f8' }}>
                          <td style={{ padding: '15px 0', color: '#999', fontWeight: '600' }}>Subcategory</td>
                          <td style={{ padding: '15px 0', color: '#295454', fontWeight: '700' }}>{product.subcategory}</td>
                        </tr>
                      )}
                      {product.materials && product.materials.length > 0 && (
                        <tr style={{ borderBottom: '1px solid #f8f8f8' }}>
                          <td style={{ padding: '15px 0', color: '#999', fontWeight: '600' }}>Material / Fabric</td>
                          <td style={{ padding: '15px 0', color: '#295454', fontWeight: '700' }}>{product.materials.join(', ')}</td>
                        </tr>
                      )}
                      {product.specifications && product.specifications.length > 0 && product.specifications.map((spec: string, index: number) => {
                        const parts = spec.split(':');
                        const label = parts.length > 1 ? parts[0] : `Feature ${index + 1}`;
                        const value = parts.length > 1 ? parts.slice(1).join(':') : spec;
                        return (
                          <tr key={index} style={{ borderBottom: '1px solid #f8f8f8' }}>
                            <td style={{ padding: '15px 0', color: '#999', fontWeight: '600' }}>{label.trim()}</td>
                            <td style={{ padding: '15px 0', color: '#295454', fontWeight: '700' }}>{value.trim()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 2. Care Instructions Section */}
                <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '40px' }}>
                  <span style={{ color: '#c48f56', letterSpacing: '4px', fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>MAINTENANCE</span>
                  <h3 className="font-serif" style={{ fontSize: '2rem', color: '#295454', marginBottom: '25px', marginTop: 0 }}>Care Guide</h3>
                  {product.careInstructions && product.careInstructions.length > 0 ? (
                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                      {product.careInstructions.map((inst: string, idx: number) => (
                        <li key={idx} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '15px', 
                          padding: '12px 15px', 
                          borderBottom: '1px solid #fcfcfc',
                          fontSize: '1rem',
                          color: '#555'
                        }}>
                          <span style={{ color: '#c48f56', fontSize: '1.2rem', lineHeight: '1' }}>✦</span>
                          <span>{inst}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>We recommend professional dry clean or gentle hand wash with mild detergent for all ethnic wear to preserve colors and embroidery.</p>
                  )}
                </div>

                {/* 3. Reviews Section */}
                <div>
                  <span style={{ color: '#c48f56', letterSpacing: '4px', fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>FEEDBACK</span>
                  <ReviewsTab productId={product._id} />
                </div>

              </div>
            </div>
          </>
        )}
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '40px',
            borderRadius: '24px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button 
              onClick={() => setShowSizeGuide(false)}
              style={{ 
                position: 'absolute', 
                top: '20px', 
                right: '20px', 
                border: 'none', 
                background: 'none', 
                fontSize: '2rem', 
                cursor: 'pointer', 
                color: '#999',
                lineHeight: '1',
                padding: '5px'
              }}
            >
              &times;
            </button>
            <span style={{ 
              color: '#c48f56', 
              letterSpacing: '4px', 
              fontWeight: '800', 
              fontSize: '0.7rem', 
              textTransform: 'uppercase', 
              display: 'block', 
              marginBottom: '10px' 
            }}>FIT GUIDE</span>
            <h3 className="font-serif" style={{ fontSize: '2rem', color: '#295454', marginBottom: '25px', marginTop: 0 }}>Size Chart (Inches)</h3>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #295454', color: '#295454', fontWeight: '800' }}>
                  <th style={{ padding: '12px' }}>Size</th>
                  <th style={{ padding: '12px' }}>Chest</th>
                  <th style={{ padding: '12px' }}>Waist</th>
                  <th style={{ padding: '12px' }}>Hip</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { size: 'S', chest: '36', waist: '32', hip: '38' },
                  { size: 'M', chest: '38', waist: '34', hip: '40' },
                  { size: 'L', chest: '40', waist: '36', hip: '42' },
                  { size: 'XL', chest: '42', waist: '38', hip: '44' },
                  { size: 'XXL', chest: '44', waist: '40', hip: '46' },
                  { size: '4XL', chest: '48', waist: '44', hip: '50' },
                  { size: '5XL', chest: '50', waist: '46', hip: '52' }
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#295454' }}>{row.size}</td>
                    <td style={{ padding: '12px', color: '#555' }}>{row.chest}</td>
                    <td style={{ padding: '12px', color: '#555' }}>{row.waist}</td>
                    <td style={{ padding: '12px', color: '#555' }}>{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <p style={{ marginTop: '25px', fontSize: '0.8rem', color: '#666', lineHeight: '1.5', textAlign: 'center' }}>
              * These are garment measurements. We recommend choosing a size that is 2 inches larger than your body bust measurement for a comfortable fit.
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .product-page-detail h1 {
            font-size: 2.2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductScreen;
