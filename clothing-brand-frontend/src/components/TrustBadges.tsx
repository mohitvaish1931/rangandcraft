const TrustBadges = () => (
  <div className="trust-badges" style={{ padding: '40px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderRight: '1px solid #ddd', paddingRight: '40px' }}>
      <div style={{ display: 'flex', color: '#295454' }}>
        {"★★★★★".split('').map((star, i) => <span key={i} style={{ fontSize: '18px' }}>{star}</span>)}
      </div>
      <span style={{ color: '#777', fontSize: '13px' }}>836 reviews</span>
    </div>
    
    <div className="trust-badge-list" style={{ display: 'flex', gap: '20px' }}>
      {['VERIFIED REVIEWS', 'HIGHEST RANKED', 'MOST AUTHENTIC', 'TOP 5% STORE', 'TOP 5% TRENDING'].map((text, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px', textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #295454', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#295454" strokeWidth="2"><path d="M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z"></path></svg>
          </div>
          <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#777', fontWeight: 600 }}>{text}</span>
        </div>
      ))}
    </div>
  </div>
);

export default TrustBadges;
