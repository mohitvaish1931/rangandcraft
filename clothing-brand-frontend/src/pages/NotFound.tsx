import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

const NotFound = () => (
  <div className="rc-container rc-section">
    <Seo title="Page not found" noindex />
    <div className="rc-empty">
      <span className="rc-eyebrow">Error 404</span>
      <h1 className="rc-h1">This page wandered off</h1>
      <p>The page you’re looking for doesn’t exist or may have moved. Let’s get you back to something beautiful.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/shop" className="rc-btn">Shop the collection</Link>
        <Link to="/" className="rc-btn rc-btn--outline">Go home</Link>
      </div>
    </div>
  </div>
);

export default NotFound;
