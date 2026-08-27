import React, { useState } from 'react';
import { Search, Truck, AlertCircle, Loader2, Package, Mail, Headphones, ShieldCheck, RefreshCcw, Globe, Lock, ChevronRight } from 'lucide-react';
import { useSEO } from '../utils/useSEO';
import { API_ENDPOINTS, fetchJSON } from '../utils/api';

interface OrderTrackingResponse {
  success: boolean;
  order: {
    _id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
    totalAmount: number;
    shippingAddress: {
      name: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
    };
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      image?: string;
    }>;
    courierName?: string;
    awbNumber?: string;
  };
}

const TrackOrder = () => {
  useSEO({
    title: 'Track Your Order - RANG AND CRAFT',
    description: 'Track your RANG AND CRAFT clothing order in real-time. Get live updates on your shipment status.',
    keywords: 'track order, clothing delivery status, rang and craft tracking',
    url: 'https://rangandcraft.store/track-order',
    type: 'website'
  });

  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingResult, setTrackingResult] = useState<OrderTrackingResponse | null>(null);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTrackingResult(null);

    try {
      const data = await fetchJSON<OrderTrackingResponse>(API_ENDPOINTS.ORDERS.TRACK, {
        method: 'POST',
        body: JSON.stringify({ orderNumber, email }),
      });

      if (data.success) {
        setTrackingResult(data);
      } else {
        setError('Order not found. Please check your order number and email.');
      }
    } catch (err: any) {
      console.error('Tracking error:', err);
      setError(err.message || 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="track-order-page-v3" style={{ 
      backgroundColor: '#f9fafa', 
      minHeight: '100vh', 
      paddingBottom: '100px',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Floral Patterns */}
      <div style={{ position: 'absolute', top: '100px', left: '-50px', opacity: 0.05, pointerEvents: 'none' }}>
         <img src="/images/floral-pattern.png" alt="" style={{ width: '400px' }} />
      </div>
      <div style={{ position: 'absolute', top: '150px', right: '-50px', opacity: 0.05, pointerEvents: 'none' }}>
         <img src="/images/floral-pattern.png" alt="" style={{ width: '400px', transform: 'scaleX(-1)' }} />
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px', position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span style={{ color: '#c48f56', letterSpacing: '4px', fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '20px' }}>REAL-TIME UPDATES</span>
          <h1 className="font-serif" style={{ fontSize: '3.5rem', color: '#295454', marginBottom: '15px' }}>Track Your Order</h1>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}>
             <div style={{ width: '40px', height: '1.5px', backgroundColor: '#c48f56' }}></div>
          </div>
          <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
            Enter your order details below to see the current status of your handcrafted apparel.
          </p>
        </div>

        {/* Tracking Card */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '80px' }}>
          <div style={{ 
            backgroundColor: '#fff', 
            padding: '50px', 
            borderRadius: '24px', 
            boxShadow: '0 20px 60px rgba(0,0,0,0.03)', 
            border: '1px solid #f8f8f8',
            maxWidth: '700px',
            width: '100%'
          }}>
            <form onSubmit={handleTrackOrder} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px', color: '#295454', marginBottom: '10px' }}>ORDER ID</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#295454' }}>
                    <Package size={20} strokeWidth={1.5} />
                  </div>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    style={{ width: '100%', padding: '15px 20px 15px 55px', borderRadius: '12px', border: '1px solid #e0e0e0', outline: 'none' }}
                    placeholder="e.g. MOR-123456"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px', color: '#295454', marginBottom: '10px' }}>EMAIL ADDRESS</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#295454' }}>
                    <Mail size={20} strokeWidth={1.5} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '15px 20px 15px 55px', borderRadius: '12px', border: '1px solid #e0e0e0', outline: 'none' }}
                    placeholder="The email used during checkout"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ 
                  width: '100%', 
                  padding: '18px', 
                  backgroundColor: '#295454', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontWeight: '700', 
                  fontSize: '0.9rem',
                  letterSpacing: '2px', 
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  marginTop: '10px'
                }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                TRACK MY SHIPMENT
              </button>
            </form>

            {error && (
              <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#FFF5F5', borderRadius: '12px', color: '#C53030', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertCircle size={18} />
                <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Result View */}
        {trackingResult && (
           <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '80px' }}>
              <div style={{ 
                backgroundColor: '#295454', 
                color: '#fff', 
                padding: '40px', 
                borderRadius: '24px', 
                boxShadow: '0 30px 60px rgba(45,10,78,0.2)',
                maxWidth: '700px',
                width: '100%'
              }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                    <div>
                      <span style={{ fontSize: '0.6rem', fontWeight: '700', letterSpacing: '3px', opacity: 0.6, textTransform: 'uppercase' }}>Shipment Status</span>
                      <h2 className="font-serif" style={{ fontSize: '2.5rem', marginTop: '5px' }}>{trackingResult.order.status}</h2>
                    </div>
                    <Truck size={40} color="#c48f56" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: '0.55rem', fontWeight: '700', letterSpacing: '2px', opacity: 0.5, textTransform: 'uppercase' }}>Order Number</span>
                      <p style={{ fontSize: '1.1rem', fontWeight: '500', marginTop: '5px' }}>{trackingResult.order.orderNumber}</p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: '0.55rem', fontWeight: '700', letterSpacing: '2px', opacity: 0.5, textTransform: 'uppercase' }}>Courier Partner</span>
                      <p style={{ fontSize: '1.1rem', fontWeight: '500', marginTop: '5px' }}>{trackingResult.order.courierName || 'In Transit'}</p>
                    </div>
                  </div>
              </div>
           </div>
        )}

        {/* Need Help Section */}
        <div style={{ backgroundColor: '#F9F6FF', borderRadius: '24px', padding: '60px 40px', marginBottom: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h3 className="font-serif" style={{ fontSize: '2rem', color: '#295454', marginBottom: '10px' }}>Need Help?</h3>
            <div style={{ width: '40px', height: '1.5px', backgroundColor: '#c48f56', margin: '0 auto' }}></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '25px' }}>
            <HelpCard 
              icon={<Headphones size={24} />} 
              title="Contact Us" 
              desc="Our support team is here to help you." 
              linkText="Get in Touch" 
              href="/contact"
            />
            <HelpCard 
              icon={<Truck size={24} />} 
              title="Shipping Info" 
              desc="Learn more about our shipping & delivery." 
              linkText="View Details" 
              href="/shipping-policy"
            />
            <HelpCard 
              icon={<RefreshCcw size={24} />} 
              title="Returns & Exchange" 
              desc="Hassle-free returns for your peace of mind." 
              linkText="Learn More" 
              href="/refund-policy"
            />
            <HelpCard 
              icon={<ShieldCheck size={24} />} 
              title="Secure & Safe" 
              desc="Your information is 100% secure with us." 
              linkText="Privacy Policy" 
              href="/privacy-policy"
            />
          </div>
        </div>

        {/* Trust Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', borderTop: '1px solid #eee', paddingTop: '40px' }}>
            <TrustItem icon={<ShieldCheck size={28} />} title="PREMIUM QUALITY" sub="Finest fabrics & craftsmanship" />
            <TrustItem icon={<Lock size={28} />} title="SECURE PAYMENTS" sub="100% secure & trusted" />
            <TrustItem icon={<RefreshCcw size={28} />} title="EASY RETURNS" sub="Hassle-free returns" />
            <TrustItem icon={<Globe size={28} />} title="WORLDWIDE SHIPPING" sub="Delivered across the globe" />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .track-order-page-v3 h1 { font-size: 2.5rem !important; }
          .track-order-page-v3 > div > div:nth-child(2) { padding: 40px 20px !important; }
        }
      `}</style>
    </div>
  );
};

const HelpCard = ({ icon, title, desc, linkText, href }: { icon: React.ReactNode, title: string, desc: string, linkText: string, href: string }) => (
  <div style={{ backgroundColor: 'transparent', textAlign: 'left' }}>
    <div style={{ width: '50px', height: '50px', backgroundColor: '#FDF7F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#295454', marginBottom: '20px', border: '1px solid rgba(45,10,78,0.05)' }}>
      {icon}
    </div>
    <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#295454', marginBottom: '8px' }}>{title}</h4>
    <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.6', marginBottom: '12px' }}>{desc}</p>
    <a href={href} style={{ fontSize: '0.75rem', fontWeight: '800', color: '#295454', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
      {linkText} <ChevronRight size={14} />
    </a>
  </div>
);

const TrustItem = ({ icon, title, sub }: { icon: React.ReactNode, title: string, sub: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
    <div style={{ color: '#295454', opacity: 0.8 }}>{icon}</div>
    <div style={{ textAlign: 'left' }}>
      <h5 style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px', color: '#295454', marginBottom: '2px' }}>{title}</h5>
      <p style={{ fontSize: '0.65rem', color: '#888' }}>{sub}</p>
    </div>
  </div>
);

export default TrackOrder;
