import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { API_ENDPOINTS, API_BASE_URL } from '../utils/api';
import { ShoppingBag, LogOut, Package, Settings } from 'lucide-react';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { user } = state;
  const [orders, setOrders] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      const fetchOrders = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/orders/my/${user.id || user._id}`);
          if (res.ok) {
            const data = await res.json();
            setOrders(data);
          }
        } catch (err) {
          console.error('Failed to fetch user orders', err);
        }
      };
      fetchOrders();
    }
  }, [user, navigate]);

  const logoutHandler = async () => {
    try {
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout failed:', err);
    }
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="profile-page" style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', padding: '100px 20px' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Profile Header */}
        <div style={{ marginBottom: '60px', display: 'flex', alignItems: 'center', gap: '30px' }}>
           <div style={{ 
             width: '100px', 
             height: '100px', 
             backgroundColor: '#295454', 
             color: '#c48f56', 
             borderRadius: '50%', 
             display: 'flex', 
             alignItems: 'center', 
             justifyContent: 'center',
             fontSize: '2.5rem',
             fontWeight: '800',
             fontFamily: 'serif',
             boxShadow: '0 15px 30px rgba(45,10,78,0.1)'
           }}>
             {user.name.charAt(0).toUpperCase()}
           </div>
           <div>
             <span style={{ color: '#c48f56', letterSpacing: '4px', fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>ROYAL PATRON</span>
             <h1 className="font-serif" style={{ fontSize: '2.8rem', color: '#295454' }}>Welcome, {user.name}</h1>
           </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '40px' }}>
          {/* Sidebar Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #f0f0f0', boxShadow: '0 15px 40px rgba(0,0,0,0.02)' }}>
              <h3 className="font-serif" style={{ fontSize: '1.5rem', color: '#295454', marginBottom: '25px', borderBottom: '1px solid #f8f8f8', paddingBottom: '15px' }}>Account Essence</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#999', letterSpacing: '2px', textTransform: 'uppercase' }}>REGISTERED NAME</span>
                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333', marginTop: '5px' }}>{user.name}</p>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#999', letterSpacing: '2px', textTransform: 'uppercase' }}>EMAIL IDENTITY</span>
                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333', marginTop: '5px' }}>{user.email}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                 <button style={{ 
                   display: 'flex', 
                   alignItems: 'center', 
                   gap: '12px', 
                   padding: '15px 20px', 
                   borderRadius: '12px', 
                   backgroundColor: '#F0F6F6', 
                   color: '#295454', 
                   border: 'none', 
                   fontWeight: '800', 
                   fontSize: '0.85rem',
                   cursor: 'pointer'
                 }}>
                   <Settings size={18} /> UPDATE PROFILE
                 </button>
                 <button 
                   onClick={logoutHandler}
                   style={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: '12px', 
                     padding: '15px 20px', 
                     borderRadius: '12px', 
                     backgroundColor: 'transparent', 
                     color: '#C53030', 
                     border: '1.5px solid #FED7D7', 
                     fontWeight: '800', 
                     fontSize: '0.85rem',
                     cursor: 'pointer'
                   }}
                 >
                   <LogOut size={18} /> DISCONNECT SESSION
                 </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {orders.length === 0 ? (
              <div style={{ backgroundColor: '#fff', padding: '50px', borderRadius: '24px', border: '1px solid #f0f0f0', textAlign: 'center', boxShadow: '0 15px 40px rgba(0,0,0,0.02)' }}>
                <div style={{ color: '#c48f56', marginBottom: '25px' }}>
                   <Package size={60} strokeWidth={1} />
                </div>
                <h3 className="font-serif" style={{ fontSize: '1.8rem', color: '#295454', marginBottom: '15px' }}>Your Collection Journey</h3>
                <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '35px', maxWidth: '400px', margin: '0 auto 35px' }}>
                   It seems your wardrobe is awaiting its first Rang and Craft masterpiece. Our latest collection of handcrafted ethnic wear is ready for discovery.
                </p>
                <Link to="/shop" style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  backgroundColor: '#295454', 
                  color: '#fff', 
                  padding: '18px 40px', 
                  borderRadius: '12px', 
                  textDecoration: 'none', 
                  fontWeight: '800', 
                  letterSpacing: '2px',
                  boxShadow: '0 10px 30px rgba(45,10,78,0.1)'
                }}>
                   <ShoppingBag size={20} /> COMMENCE SHOPPING
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 className="font-serif" style={{ fontSize: '2rem', color: '#295454' }}>Order History</h2>
                {orders.map((order: any) => (
                  <div key={order._id} style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '15px', marginBottom: '15px' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#999', textTransform: 'uppercase' }}>Order Placed</span>
                        <p style={{ margin: '5px 0 0 0', fontWeight: '600' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#999', textTransform: 'uppercase' }}>Total</span>
                        <p style={{ margin: '5px 0 0 0', fontWeight: '600', color: '#295454' }}>₹{order.totalPrice || (order.orderItems?.reduce((a:any, b:any) => a + (b.price * b.qty), 0))}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#999', textTransform: 'uppercase' }}>Order ID</span>
                        <p style={{ margin: '5px 0 0 0', fontWeight: '600', fontSize: '0.9rem' }}>#{order._id.substring(0, 8)}</p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold', color: order.status === 'Delivered' ? '#38A169' : '#D69E2E' }}>
                          Status: {order.status || 'Processing'}
                        </p>
                        {order.awbNumber && (
                          <div style={{ marginTop: '10px' }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem' }}>AWB: <strong>{order.awbNumber}</strong> ({order.courierName})</p>
                            {order.trackingUrl && (
                              <a href={order.trackingUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '5px 12px', backgroundColor: '#EBF4FF', color: '#3182CE', borderRadius: '4px', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                TRACK SHIPMENT
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {order.labelPdf && (
                          <a href={order.labelPdf} target="_blank" rel="noreferrer" style={{ padding: '8px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#4A5568', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            Invoice
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 850px) {
          .profile-page {
            padding: 60px 20px !important;
          }
          .profile-page > div > div:nth-child(2) {
            grid-template-columns: 1fr !important;
          }
          .profile-page h1 {
            font-size: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileScreen;
