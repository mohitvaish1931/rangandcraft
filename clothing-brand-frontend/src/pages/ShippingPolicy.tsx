import React from 'react';
import { useSEO } from '../utils/useSEO';
import { Truck, Tag, RefreshCcw, MapPin, Box, Headphones, Mail, MessageCircle, ShieldCheck, Lock, Globe } from 'lucide-react';

const ShippingPolicy = () => {
  useSEO({
    title: 'Shipping Policy - RANG AND CRAFT',
    description: 'Learn about our delivery times, shipping costs, and order tracking.',
    keywords: 'shipping policy, delivery time, shipping rates, RANG AND CRAFT',
    url: 'https://rangandcraft.store/shipping-policy',
    type: 'website'
  });

  const sections = [
    {
      icon: <Truck size={30} />,
      title: "DELIVERY TIME",
      text: "All orders are usually dispatched within 2-3 working days unless stated otherwise. Once dispatched, it takes 4-8 working days to deliver depending upon the location. However, the delivery time is subject to change based on shortage of an item, bad weather, transit time of your carrier, destination address, or COVID related restrictions, etc."
    },
    {
      icon: <Tag size={30} />,
      title: "SHIPPING COST",
      text: (
        <>
          We charge ₹70 per order and also offer <strong style={{color: '#2d0a4e'}}>free shipping on all orders above ₹1499.</strong>
        </>
      )
    },
    {
      icon: <RefreshCcw size={30} />,
      title: "RTO/UN-DELIVERED SHIPMENT",
      text: "We are not liable for undelivered shipment or RTO (Return to Origin) due to wrong address / misinformation provided while placing an order. In this case, customer has to pay the shipping charges again so we can re-ship the order."
    },
    {
      icon: <MapPin size={30} />,
      title: "TRACKING YOUR ORDER",
      text: "Once your order is shipped from our warehouse, you will receive an email including a tracking number to check the status."
    },
    {
      icon: <Box size={30} />,
      title: "LOST SHIPMENT",
      text: "Incase your package gets lost during the transit, we shall re-ship your order. If any item of your order is out of stock, you can either wait for a restock or we will issue a credit note which can be used for future orders."
    }
  ];

  return (
    <div className="policy-page-v2" style={{ 
      backgroundColor: '#fdfbff', 
      color: '#2d0a4e', 
      minHeight: '100vh', 
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Patterns */}
      <div style={{ position: 'absolute', top: '100px', left: '-50px', opacity: 0.05, pointerEvents: 'none' }}>
         <img src="/images/floral-pattern.png" alt="" style={{ width: '400px' }} />
      </div>
      <div style={{ position: 'absolute', top: '150px', right: '-50px', opacity: 0.05, pointerEvents: 'none' }}>
         <img src="/images/floral-pattern.png" alt="" style={{ width: '400px', transform: 'scaleX(-1)' }} />
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{ color: '#D4AF37', letterSpacing: '4px', fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '20px' }}>LOGISTICS</span>
          <h1 className="font-serif" style={{ fontSize: '3.5rem', fontWeight: '700', marginBottom: '15px', color: '#2d0a4e' }}>Shipping Policy</h1>
          <div style={{ width: '40px', height: '1.5px', backgroundColor: '#D4AF37', margin: '0 auto 20px' }}></div>
          <p style={{ fontSize: '1.1rem', color: '#666' }}>Learn about our delivery times, shipping costs, and order tracking.</p>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '80px', maxWidth: '800px', margin: '0 auto 80px' }}>
          {sections.map((section, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              gap: '30px', 
              padding: '30px', 
              backgroundColor: '#fff', 
              borderRadius: '20px', 
              boxShadow: '0 5px 25px rgba(0,0,0,0.02)',
              border: '1px solid #f8f8f8',
              alignItems: 'flex-start'
            }}>
              <div style={{ 
                width: '70px', 
                height: '70px', 
                borderRadius: '50%', 
                backgroundColor: '#F9F6FF', 
                color: '#2d0a4e', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {section.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', color: '#2d0a4e' }}>{section.title}</h3>
                <p style={{ color: '#555', lineHeight: '1.7', fontSize: '0.95rem' }}>{section.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div style={{ 
          backgroundColor: '#F9F6FF', 
          borderRadius: '24px', 
          padding: '60px 40px', 
          textAlign: 'center',
          marginBottom: '80px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
             <div style={{ width: '60px', height: '60px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(45,10,78,0.05)' }}>
                <Headphones size={28} color="#2d0a4e" strokeWidth={1.5} />
             </div>
          </div>
          <h2 className="font-serif" style={{ fontSize: '2.2rem', marginBottom: '10px', color: '#2d0a4e' }}>NEED HELP WITH YOUR ORDER?</h2>
          <div style={{ width: '40px', height: '1.5px', backgroundColor: '#D4AF37', margin: '0 auto 20px' }}></div>
          <p style={{ color: '#666', marginBottom: '40px' }}>Feel free to reach us out on:</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
            <ContactCard 
              icon={<Mail size={24} />} 
              label="EMAIL" 
              value="rangandcraft.fashion.jaipur@gmail.com" 
              href="mailto:rangandcraft.fashion.jaipur@gmail.com"
            />
            <ContactCard 
              icon={<MessageCircle size={24} />} 
              label="WHATSAPP" 
              value="+91 93513 25459" 
              href="https://wa.me/919351325459"
            />
          </div>
        </div>

        {/* Trust Bar Footer */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', borderTop: '1px solid #eee', paddingTop: '60px' }}>
            <TrustItem icon={<ShieldCheck size={28} />} title="PREMIUM QUALITY" sub="Finest fabrics & craftsmanship" />
            <TrustItem icon={<Lock size={28} />} title="SECURE PAYMENTS" sub="100% secure & trusted" />
            <TrustItem icon={<RefreshCcw size={28} />} title="EASY RETURNS" sub="Hassle-free returns" />
            <TrustItem icon={<Globe size={28} />} title="WORLDWIDE SHIPPING" sub="Delivered across the globe" />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .policy-page-v2 h1 { font-size: 2.5rem !important; }
          .policy-page-v2 h2 { font-size: 1.8rem !important; }
          .policy-page-v2 > div > div:nth-child(3) { padding: 40px 20px !important; }
        }
      `}</style>
    </div>
  );
};

const ContactCard = ({ icon, label, value, href }: { icon: React.ReactNode, label: string, value: string, href: string }) => (
  <a href={href} style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '20px', 
    padding: '25px 40px', 
    backgroundColor: '#fff', 
    borderRadius: '16px', 
    textDecoration: 'none', 
    color: '#2d0a4e',
    boxShadow: '0 10px 20px rgba(0,0,0,0.02)',
    minWidth: '320px',
    border: '1px solid #f0f0f0'
  }}>
    <div style={{ color: '#2d0a4e', backgroundColor: '#F9F6FF', padding: '12px', borderRadius: '12px' }}>{icon}</div>
    <div style={{ textAlign: 'left' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px', color: '#999', display: 'block' }}>{label}</span>
      <span style={{ fontSize: '1rem', fontWeight: '700' }}>{value}</span>
    </div>
  </a>
);

const TrustItem = ({ icon, title, sub }: { icon: React.ReactNode, title: string, sub: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
    <div style={{ color: '#2D0A4E', opacity: 0.8 }}>{icon}</div>
    <div style={{ textAlign: 'left' }}>
      <h5 style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px', color: '#2D0A4E', marginBottom: '2px' }}>{title}</h5>
      <p style={{ fontSize: '0.65rem', color: '#888' }}>{sub}</p>
    </div>
  </div>
);

export default ShippingPolicy;
