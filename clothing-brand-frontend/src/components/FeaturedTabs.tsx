import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/mediaHelper';

const FeaturedTabs = ({ shortKurtas, longKurtas }: any) => {
  const [activeTab, setActiveTab] = useState('SHORT KURTAS');
  
  const products = activeTab === 'SHORT KURTAS' ? shortKurtas : longKurtas;

  return (
    <section style={{ padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ marginBottom: '10px', fontSize: '10px', color: '#c48f56', letterSpacing: '2px', textTransform: 'uppercase' }}>FEATURED COLLECTION</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '40px' }}>
        <div 
          onClick={() => setActiveTab('SHORT KURTAS')}
          style={{ cursor: 'pointer', fontSize: '20px', color: activeTab === 'SHORT KURTAS' ? '#333' : '#888', borderBottom: activeTab === 'SHORT KURTAS' ? '1px solid #333' : 'none', paddingBottom: '5px', letterSpacing: '2px' }}
        >
          SHORT KURTAS
        </div>
        <div 
          onClick={() => setActiveTab('LONG KURTAS')}
          style={{ cursor: 'pointer', fontSize: '20px', color: activeTab === 'LONG KURTAS' ? '#333' : '#888', borderBottom: activeTab === 'LONG KURTAS' ? '1px solid #333' : 'none', paddingBottom: '5px', letterSpacing: '2px' }}
        >
          LONG KURTAS
        </div>
      </div>

      <div style={{ display: 'flex', overflowX: 'auto', gap: '15px', scrollbarWidth: 'none', paddingBottom: '20px' }}>
        {products?.slice(0, 6).map((product: any) => (
          <Link to={`/product/${product._id}`} key={product._id} style={{ flex: '0 0 calc(16.666% - 13px)', minWidth: '220px', textAlign: 'center', textDecoration: 'none' }}>
            <div style={{ aspectRatio: '3/4', overflow: 'hidden', marginBottom: '15px' }}>
              <img src={getImageUrl(product.image, 500)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3 style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>{product.name}</h3>
            <div style={{ fontSize: '11px', color: '#888', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <span style={{ textDecoration: 'line-through' }}>RS. {product.price + 200}.00</span>
              <span style={{ color: '#333' }}>RS. {product.price}.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', color: '#295454', marginTop: '5px', fontSize: '12px' }}>
              ★★★★★ <span style={{ color: '#888', marginLeft: '5px' }}>(4.8)</span>
            </div>
          </Link>
        ))}
      </div>
      <div style={{ marginTop: '30px' }}>
        <Link to="/shop" style={{ display: 'inline-block', backgroundColor: '#295454', color: '#fff', padding: '12px 30px', textDecoration: 'none', fontSize: '12px', letterSpacing: '1px' }}>
          VIEW ALL
        </Link>
      </div>
    </section>
  );
};

export default FeaturedTabs;
