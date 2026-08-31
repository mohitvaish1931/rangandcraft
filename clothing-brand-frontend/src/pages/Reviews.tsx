import { Helmet } from 'react-helmet-async';

const Reviews = () => {
  const reviews = [
    { name: "Rahul S.", rating: 5, comment: "Absolutely love the fit and the premium fabric of the sherwani. Wore it to my brother's wedding and received so many compliments." },
    { name: "Vikram M.", rating: 5, comment: "The ordering process was smooth, and the customer service was fantastic. The short kurta is exactly as shown in the pictures." },
    { name: "Anil K.", rating: 4, comment: "Great quality and traditional designs. Delivery took an extra day, but totally worth the wait for such fine craftsmanship." },
    { name: "Suresh P.", rating: 5, comment: "I've bought ethnic wear from many luxury brands, but Rang and Craft's attention to detail is unparalleled. Highly recommended." },
    { name: "Deepak R.", rating: 5, comment: "Perfect! The color, the fabric, the royal look. It feels like wearing actual heritage. Will buy again." },
    { name: "Kunal J.", rating: 5, comment: "Bought a Nehru jacket for a formal event. The fit was perfect out of the box." }
  ];

  return (
    <div style={{ backgroundColor: '#F9F9F9', minHeight: '100vh', padding: '60px 20px', textAlign: 'center' }}>
      <Helmet>
        <title>Customer Reviews - Rang and Craft</title>
      </Helmet>
      <h1 style={{ fontSize: '3rem', color: '#295454', fontFamily: 'serif', marginBottom: '10px' }}>Customer Reviews</h1>
      <p style={{ color: '#666', marginBottom: '50px' }}>See what our royal patrons have to say</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '1000px', margin: '0 auto' }}>
        {reviews.map((rev, idx) => (
          <div key={idx} style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'left' }}>
            <div style={{ display: 'flex', color: '#c48f56', marginBottom: '15px' }}>
              {"★".repeat(rev.rating)}{"☆".repeat(5-rev.rating)}
            </div>
            <p style={{ color: '#444', fontStyle: 'italic', marginBottom: '20px', lineHeight: 1.6 }}>"{rev.comment}"</p>
            <h4 style={{ color: '#295454', fontWeight: 'bold' }}>- {rev.name}</h4>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
